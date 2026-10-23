import admin from "firebase-admin";

/**
 * Credentials are NEVER stored in the repo. Provide ONE of:
 *  1. FIREBASE_SERVICE_ACCOUNT_B64  - base64 of the service account JSON (good for hosts like Render/Railway)
 *  2. GOOGLE_APPLICATION_CREDENTIALS - path to the JSON file on the server
 *  3. Nothing, when running on Google Cloud (Cloud Run / Functions) with a default service account
 */
function buildCredential() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (b64) {
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    return admin.credential.cert(json);
  }
  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: buildCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID || "nexusai-6879f",
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;
