import { useRef, useState } from 'react';
import {
  CheckCircle2,
  UploadCloud,
  XCircle,
} from 'lucide-react';

import { useAcademicSubjects } from '../hooks/useRealtime';
import { useAuth } from '../hooks/useAuth';
import { addMaterial } from '../services/data';
import { bytes } from '../utils/format';

const MAX = 15 * 1024 * 1024;

const allowed = [
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'doc',
  'docx',
  'ppt',
  'pptx',
];

interface UploadPanelProps {
  departmentId: string;
  academicGroupId: string;
  sectionId: string;
  subjectId: string;
}

export default function UploadPanel({
  departmentId,
  academicGroupId,
  sectionId,
  subjectId,
}: UploadPanelProps) {

  const { user } = useAuth();

  const subjects = useAcademicSubjects(
    academicGroupId
  );

  const [file, setFile] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);

  const [progress, setProgress] = useState(0);

  const [msg, setMsg] = useState('');

  const ref = useRef<HTMLInputElement>(null);


  async function submit() {

    if (
      !file ||
      !departmentId ||
      !academicGroupId ||
      !sectionId ||
      !subjectId ||
      !user
    ) {
      setMsg(
        '⚠ Select department, year, section, subject and file.'
      );

      return;
    }


    const ext =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase() || '';


    if (!allowed.includes(ext)) {
      setMsg('⚠ Unsupported file type.');
      return;
    }


    if (file.size > MAX) {
      setMsg(
        '⚠ File is too large. Maximum is 15 MB.'
      );

      return;
    }


    setBusy(true);
    setProgress(0);
    setMsg('');


    try {

      const fd = new FormData();

      fd.append('file', file);

      fd.append(
        'departmentId',
        departmentId
      );

      fd.append(
        'academicGroupId',
        academicGroupId
      );

      fd.append(
        'sectionId',
        sectionId
      );

      fd.append(
        'subjectId',
        subjectId
      );

      fd.append(
        'filename',
        file.name
      );


      const token =
        await user.getIdToken();


      const base =
        import.meta.env.VITE_API_BASE_URL || '';


      const result =
        await new Promise<any>(
          (resolve, reject) => {

            const xhr =
              new XMLHttpRequest();


            xhr.open(
              'POST',
              `${base}/api/upload`
            );


            xhr.setRequestHeader(
              'Authorization',
              `Bearer ${token}`
            );


            xhr.upload.onprogress =
              (event) => {

                if (
                  event.lengthComputable
                ) {

                  const percent =
                    Math.round(
                      (event.loaded /
                        event.total) *
                        100
                    );

                  setProgress(percent);
                }
              };


            xhr.onload = () => {

              try {

                const data =
                  JSON.parse(
                    xhr.responseText
                  );


                if (
                  xhr.status >= 200 &&
                  xhr.status < 300
                ) {
                  resolve(data);
                } else {
                  reject(
                    new Error(
                      data.error ||
                        'Upload failed.'
                    )
                  );
                }

              } catch {

                reject(
                  new Error(
                    'Server returned an invalid response. Please try again.'
                  )
                );
              }
            };


            xhr.onerror = () => {

              reject(
                new Error(
                  'Network error. Please check your connection and try again.'
                )
              );
            };


            xhr.onabort = () => {

              reject(
                new Error(
                  'Upload cancelled.'
                )
              );
            };


            xhr.send(fd);
          }
        );


      setProgress(100);


      const subject =
        subjects.find(
          (x) =>
            x.id === subjectId
        );


      if (!subject) {
        throw new Error(
          'Selected subject could not be found.'
        );
      }


      await addMaterial({

        name: result.filename,

        originalName: file.name,

        url: result.url,

        departmentId,

        academicGroupId,

        sectionId,

        subjectId,

        subjectName:
          subject.name,

        uploadedBy:
          user.uid,

        fileType: ext,

        fileSize:
          file.size,
      });


      setMsg(
        '✓ Material uploaded successfully.'
      );

      setFile(null);

      setProgress(100);

    } catch (e: any) {

      setMsg(
        `⚠ ${
          e.message ||
          'Upload failed. Please try again.'
        }`
      );

      setProgress(0);

    } finally {

      setBusy(false);
    }
  }


  return (
    <section className="card p-5 sm:p-7">

      <h2 className="text-xl font-bold">
        Upload Material
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        PDF, images, Word or PowerPoint · max 15 MB
      </p>


      {!departmentId ||
      !academicGroupId ||
      !sectionId ||
      !subjectId ? (
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Select your department, academic year,
          section and subject above before uploading.
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() =>
              !busy &&
              ref.current?.click()
            }
            disabled={busy}
            className={`mt-5 grid min-h-44 w-full place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
              busy
                ? 'cursor-not-allowed border-slate-200 bg-slate-100'
                : 'border-slate-300 bg-slate-50 hover:border-brand hover:bg-mint'
            }`}
          >

            <div>

              <UploadCloud
                className={`mx-auto ${
                  busy
                    ? 'text-slate-400'
                    : 'text-brand'
                }`}
                size={34}
              />

              <b className="mt-2 block">
                {file
                  ? file.name
                  : 'Drop file here or click to browse'}
              </b>

              {file && (
                <span className="text-sm text-slate-500">
                  {bytes(file.size)}
                </span>
              )}

            </div>

          </button>


          <input
            ref={ref}
            className="hidden"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx"
            onChange={(e) => {

              setFile(
                e.target.files?.[0] ||
                  null
              );

              setMsg('');

              setProgress(0);
            }}
          />


          {busy && file && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">

              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-slate-700">
                    Uploading {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {bytes(
                      Math.round(
                        (file.size *
                          progress) /
                          100
                      )
                    )}{' '}
                    of {bytes(file.size)}
                  </p>

                </div>

                <span className="shrink-0 text-sm font-bold text-brand">
                  {progress}%
                </span>

              </div>


              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">

                <div
                  className="h-full rounded-full bg-brand transition-all duration-200 ease-out"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>


              <p className="mt-2 text-xs text-slate-500">
                Please keep this page open while the upload completes.
              </p>

            </div>
          )}


          {msg && (
            <div
              className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${
                msg.startsWith('✓')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >

              {msg.startsWith('✓') ? (
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />
              ) : (
                <XCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
              )}

              <span>
                {msg.replace(
                  /^[✓⚠]\s*/,
                  ''
                )}
              </span>

            </div>
          )}


          <button
            onClick={submit}
            disabled={busy}
            className="btn-primary mt-5 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy
              ? `Uploading ${progress}%...`
              : 'Upload Material'}
          </button>

        </>
      )}

    </section>
  );
}