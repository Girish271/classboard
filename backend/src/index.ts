import express, {
  NextFunction,
  Request,
  Response,
} from 'express';

import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

import {
  initializeApp,
  getApps,
  cert,
} from 'firebase-admin/app';

import {
  getAuth,
} from 'firebase-admin/auth';

import {
  getFirestore,
} from 'firebase-admin/firestore';


dotenv.config();


// ============================================================
// ENVIRONMENT
// ============================================================

const required = [
  'GITHUB_TOKEN',
  'GITHUB_OWNER',
  'GITHUB_REPO',
  'GITHUB_BRANCH',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
] as const;

const missing =
  required.filter(
    (key) => !process.env[key]
  );

if (missing.length) {
  console.warn(
    'Missing backend env:',
    missing.join(', ')
  );
}


// ============================================================
// FIREBASE ADMIN
// ============================================================

if (
  !getApps().length &&
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  initializeApp({
    credential: cert({
      projectId:
        process.env.FIREBASE_PROJECT_ID,

      clientEmail:
        process.env.FIREBASE_CLIENT_EMAIL,

      privateKey:
        process.env.FIREBASE_PRIVATE_KEY.replace(
          /\\n/g,
          '\n'
        ),
    }),
  });
}


// ============================================================
// EXPRESS
// ============================================================

const app = express();

app.use(
  cors({
    origin:
      process.env.FRONTEND_ORIGIN?.split(',') ||
      'http://localhost:5173',
  })
);

app.use(express.json());


// ============================================================
// FILE UPLOAD
// ============================================================

const allowed = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'doc',
  'docx',
  'ppt',
  'pptx',
]);

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});


// ============================================================
// HELPERS
// ============================================================

const clean = (s: string) =>
  s
    .normalize('NFKD')
    .replace(
      /[^a-zA-Z0-9._-]+/g,
      '-'
    )
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'file';


// ============================================================
// AUTHENTICATION
// ============================================================

async function auth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const header =
      req.headers.authorization;


    if (
      !header?.startsWith('Bearer ') ||
      !getApps().length
    ) {
      return res.status(401).json({
        error:
          'Authentication required.',
      });
    }


    const token =
      await getAuth().verifyIdToken(
        header.slice(7)
      );


    const profile =
      await getFirestore()
        .doc(`users/${token.uid}`)
        .get();


    if (
      !profile.exists ||
      !['teacher', 'admin'].includes(
        profile.data()?.role
      )
    ) {
      return res.status(403).json({
        error:
          'Teacher or admin access required.',
      });
    }


    (req as any).uid =
      token.uid;


    next();

  } catch {

    return res.status(401).json({
      error:
        'Invalid authentication.',
    });
  }
}


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  '/api/health',
  (_req, res) => {
    res.json({
      ok: true,
      configured:
        missing.length === 0,
    });
  }
);


// ============================================================
// UPLOAD
// ============================================================

app.post(
  '/api/upload',
  auth,
  upload.single('file'),

  async (
    req,
    res
  ) => {

    try {

      // ------------------------------------------------------
      // BACKEND CONFIG
      // ------------------------------------------------------

      if (missing.length) {
        return res.status(503).json({
          error:
            `Backend configuration missing: ${missing.join(', ')}`,
        });
      }


      // ------------------------------------------------------
      // FILE
      // ------------------------------------------------------

      if (!req.file) {
        return res.status(400).json({
          error:
            'No file supplied.',
        });
      }


      const ext =
        (
          req.file.originalname
            .split('.')
            .pop() || ''
        ).toLowerCase();


      if (!allowed.has(ext)) {
        return res.status(415).json({
          error:
            'Unsupported file type.',
        });
      }


      // ------------------------------------------------------
      // ACADEMIC STRUCTURE
      // ------------------------------------------------------

      const departmentId =
        clean(
          String(
            req.body.departmentId || ''
          )
        );


      const academicGroupId =
        clean(
          String(
            req.body.academicGroupId || ''
          )
        );


      const sectionId =
        clean(
          String(
            req.body.sectionId || ''
          )
        );


      const subjectId =
        clean(
          String(
            req.body.subjectId || ''
          )
        );


      if (
        !departmentId ||
        !academicGroupId ||
        !sectionId ||
        !subjectId
      ) {
        return res.status(400).json({
          error:
            'departmentId, academicGroupId, sectionId and subjectId are required.',
        });
      }


      // ------------------------------------------------------
      // FILE NAME
      // ------------------------------------------------------

      const filename =
        clean(
          String(
            req.body.filename ||
            req.file.originalname
          )
        );


      // ------------------------------------------------------
      // GITHUB PATH
      // ------------------------------------------------------

      const timestamp =
        new Date()
          .toISOString()
          .replace(
            /[:.]/g,
            '-'
          );


      const path =
        `${departmentId}/${academicGroupId}/${sectionId}/${subjectId}/${timestamp}-${filename}`;


      const owner =
        process.env.GITHUB_OWNER!;

      const repo =
        process.env.GITHUB_REPO!;

      const branch =
        process.env.GITHUB_BRANCH!;


      // ------------------------------------------------------
      // GITHUB UPLOAD
      // ------------------------------------------------------

      const githubResponse =
        await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'PUT',

            headers: {
              Authorization:
                `Bearer ${process.env.GITHUB_TOKEN}`,

              Accept:
                'application/vnd.github+json',

              'X-GitHub-Api-Version':
                '2022-11-28',

              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              message:
                `Upload ${filename}`,

              content:
                req.file.buffer.toString(
                  'base64'
                ),

              branch,
            }),
          }
        );


      const data: any =
        await githubResponse.json();


      if (!githubResponse.ok) {

        return res.status(502).json({
          error:
            data?.message
              ? `GitHub upload failed: ${data.message}`
              : 'GitHub upload failed.',
        });

      }


      // ------------------------------------------------------
      // DOWNLOAD URL
      // ------------------------------------------------------

      const url =
        data.content?.download_url ||
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;


      // ------------------------------------------------------
      // RESPONSE
      // ------------------------------------------------------

      return res.json({
        url,
        filename,
        path,

        departmentId,
        academicGroupId,
        sectionId,
        subjectId,
      });

    } catch (error) {

      console.error(
        'Upload error:',
        error
      );

      return res.status(500).json({
        error:
          'Upload failed. Please try again.',
      });
    }
  }
);

// ============================================================
// DELETE MATERIAL
// ============================================================

app.delete(
  '/api/material/:id',
  auth,
  async (req, res) => {
    try {
      if (missing.length) {
        return res.status(503).json({
          error: `Backend configuration missing: ${missing.join(', ')}`,
        });
      }

      const materialId = String(req.params.id || '');

      if (!materialId) {
        return res.status(400).json({
          error: 'Material ID is required.',
        });
      }

      const firestore = getFirestore();

      const materialRef = firestore
        .collection('files')
        .doc(materialId);

      const materialSnap = await materialRef.get();

      if (!materialSnap.exists) {
        return res.status(404).json({
          error: 'Material not found.',
        });
      }

      const material = materialSnap.data() as {
        githubPath?: string;
        url?: string;
        uploadedBy?: string;
      };

      // --------------------------------------------------------
      // GITHUB PATH
      // --------------------------------------------------------

      const githubPath = material.githubPath;

      if (!githubPath) {
        return res.status(400).json({
          error:
            'This material does not have a GitHub path and cannot be deleted automatically.',
        });
      }

      const owner = process.env.GITHUB_OWNER!;
      const repo = process.env.GITHUB_REPO!;
      const branch = process.env.GITHUB_BRANCH!;

      // --------------------------------------------------------
      // GET FILE SHA FROM GITHUB
      // --------------------------------------------------------

      const githubFileResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}?ref=${branch}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );

      const githubFileData: any =
        await githubFileResponse.json();

      if (!githubFileResponse.ok) {
        return res.status(502).json({
          error:
            githubFileData?.message
              ? `GitHub lookup failed: ${githubFileData.message}`
              : 'GitHub lookup failed.',
        });
      }

      const sha = githubFileData.sha;

      if (!sha) {
        return res.status(502).json({
          error: 'GitHub file SHA could not be determined.',
        });
      }

      // --------------------------------------------------------
      // DELETE FROM GITHUB
      // --------------------------------------------------------

      const githubDeleteResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Delete ${githubPath.split('/').pop()}`,
            sha,
            branch,
          }),
        }
      );

      const githubDeleteData: any =
        await githubDeleteResponse.json();

      if (!githubDeleteResponse.ok) {
        return res.status(502).json({
          error:
            githubDeleteData?.message
              ? `GitHub deletion failed: ${githubDeleteData.message}`
              : 'GitHub deletion failed.',
        });
      }

      // --------------------------------------------------------
      // DELETE FIRESTORE RECORD
      // --------------------------------------------------------

      await materialRef.delete();

      return res.json({
        ok: true,
        message: 'Material deleted successfully.',
      });

    } catch (error) {
      console.error(
        'Delete material error:',
        error
      );

      return res.status(500).json({
        error:
          'Failed to delete material.',
      });
    }
  }
);


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (
    error: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {

    if (
      error?.code ===
      'LIMIT_FILE_SIZE'
    ) {
      return res.status(413).json({
        error:
          'File is too large. Maximum is 15 MB.',
      });
    }


    console.error(
      'Server error:',
      error
    );


    return res.status(500).json({
      error:
        'Server error.',
    });
  }
);


// ============================================================
// START SERVER
// ============================================================

const port =
  Number(
    process.env.PORT || 8787
  );


app.listen(
  port,
  () => {
    console.log(
      `ClassBoard upload API running on port ${port}`
    );
  }
);