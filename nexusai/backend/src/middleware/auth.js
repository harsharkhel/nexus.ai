import { auth } from "../firebase.js";

/** Verifies the Firebase ID token sent as `Authorization: Bearer <token>`. */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: "Missing bearer token" });

  try {
    const decoded = await auth.verifyIdToken(match[1]);
    req.user = { uid: decoded.uid, email: decoded.email || null, name: decoded.name || null };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
