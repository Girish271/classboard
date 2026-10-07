# ClassBoard

ClassBoard is a focused classroom material delivery MVP: **upload → store → display → access**. A teacher uploads once, the classroom board receives metadata in realtime, and students can open the same material without hunting through chat history.

## Features
- One React application with protected Teacher, Student, Board and Admin routes.
- Firebase Email/Password authentication and Firestore role profiles.
- Firestore realtime material lists for board and students.
- Secure Express upload API: GitHub token stays server-side.
- PDF/images open directly in the browser; Office files expose their public URL for browser handling/download.
- Board Mode uses large touch targets, persistent Firebase auth and remembers only the selected class ID in localStorage (never passwords).
- Responsive, light-first teacher/student/admin UI and high-contrast board UI.
- Loading, empty, auth, configuration, file validation and upload error states.

## Architecture
Browser → Firebase Auth → role route. Teacher upload → Express API (verifies Firebase ID token + role) → GitHub Contents API → public file URL → browser writes Firestore metadata → Firestore realtime listeners → Board/Student.

## Stack
React, TypeScript, Vite, Tailwind CSS, Firebase Auth/Firestore/Hosting, Express, Firebase Admin, GitHub Contents API.

## Folder structure
`src/` frontend UI/services; `backend/` secure upload API; `firestore.rules` authorization; `firestore.indexes.json` indexes; `firebase.json` hosting config; `STEPS.txt` beginner setup.

## Local setup
Follow `STEPS.txt`. In short: copy `.env.example` to `.env`, configure Firebase; copy `backend/.env.example` to `backend/.env`, configure GitHub + Firebase Admin; install dependencies in root and backend; run both dev servers.

## Environment variables
Frontend: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_API_BASE_URL`.
Backend: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, optional `PORT`, `FRONTEND_ORIGIN`.

## GitHub storage
Use a dedicated **public** repository for this prototype because students/boards need public file URLs. The API writes sanitized paths under `<classId>/<subjectId>/<timestamp>-<filename>`. Never put the GitHub token in Vite env, Firestore or browser storage.

## Deployment
Build the frontend with `npm run build`, then deploy Firebase Hosting with `firebase deploy --only hosting,firestore`. Deploy `backend/` to a Node host (Render/Railway/Cloud Run/etc.) and set server environment variables there. Set `VITE_API_BASE_URL` to that HTTPS API URL before rebuilding/deploying the frontend.

## Testing
Run `npm run typecheck` and `npm run build` in root, and `npm run build` in `backend/`. Then perform the end-to-end test in `STEPS.txt`: teacher upload → GitHub file → Firestore metadata → realtime Board → Student open/download.

## Security
Firestore is not open. User roles live in `/users/{uid}`. Upload API verifies Firebase ID tokens and only accepts teacher/admin roles. GitHub credentials remain server-only. File types are allowlisted and uploads are capped at 15 MB.

## Known MVP limitations
GitHub is prototype storage, not ideal production object storage. Public repo files are public. Office formats may download instead of previewing depending on browser. Admin user creation is intentionally done via Firebase Console for the MVP rather than shipping privileged account-creation logic to the browser. No virus scanning or content moderation is included. Class/subject GitHub folders use Firestore IDs rather than display names to avoid collisions.
