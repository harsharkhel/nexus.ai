import {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
  type App,
} from "firebase-admin/app";
import {
  getFirestore as getAdminFirestore,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import path from "path";

let app: App | null = null;
let firestoreDb: Firestore | null = null;

function initFirebase(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  try {
    if (!getApps().length) {
      const credentialsPath =
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        path.join(process.cwd(), "nexusai-credentials.json");

      let credential;
      try {
        credential = cert(credentialsPath);
      } catch {
        credential = applicationDefault();
      }

      app = initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID || "nexusai-6879f",
      });
    } else {
      app = getApps()[0];
    }

    if (app) {
      firestoreDb = getAdminFirestore(app);
      return firestoreDb;
    }
  } catch (err) {
    console.warn("Firebase Admin initialization warning:", err);
  }

  return null;
}

export function getFirestore(): Firestore | null {
  return initFirebase();
}

export type { QueryDocumentSnapshot };
