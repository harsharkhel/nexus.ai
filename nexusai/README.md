# NexusAI

AI chat app: React + Vite frontend, Express + Firebase Admin backend, Firestore storage, Firebase Auth.

## Security first
- Never commit a service account key. If one was ever pasted into chat, email or git, revoke it in
  Google Cloud Console -> IAM & Admin -> Service Accounts -> Keys, then create a new one.
- The service account key is backend only. The frontend uses only the public web config.

## Setup

### 1. Firebase Console
1. Build -> Authentication -> enable Email/Password and Google.
2. Build -> Firestore Database -> create database.
3. Project settings -> Your apps -> add a Web app, copy its config into `frontend/.env`.
4. Deploy rules: `npm i -g firebase-tools && firebase login && firebase deploy --only firestore:rules`

### 2. Backend
```bash
cd backend
cp .env.example .env     # set FIREBASE_SERVICE_ACCOUNT_B64 (or GOOGLE_APPLICATION_CREDENTIALS) and ANTHROPIC_API_KEY
npm install
npm run dev              # http://localhost:8080
```
Create the base64 value with `base64 -w0 serviceAccount.json` (macOS: `base64 -i serviceAccount.json`).

### 3. Frontend
```bash
cd frontend
cp .env.example .env     # set VITE_FIREBASE_API_KEY and VITE_FIREBASE_APP_ID
npm install
npm run dev              # http://localhost:5173
```

## API (all require `Authorization: Bearer <Firebase ID token>`)
| Method | Path | Purpose |
|---|---|---|
| POST | /api/me | Upsert user profile |
| GET/POST | /api/conversations | List / create |
| PATCH/DELETE | /api/conversations/:id | Rename / delete |
| GET/POST | /api/conversations/:id/messages | History / send message + AI reply |

Data lives at `users/{uid}/conversations/{id}/messages/{id}`. Firestore rules block all direct client writes.

## Deploy
Backend: Cloud Run or any Node host (set the env vars there, and CORS_ORIGINS to your frontend URL).
Frontend: `npm run build`, then host `frontend/dist` on Firebase Hosting, Vercel or Netlify.
