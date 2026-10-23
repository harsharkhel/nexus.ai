import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";
import { requireAuth } from "./middleware/auth.js";
import conversations from "./routes/conversations.js";
import { db } from "./firebase.js";

const app = express();
const origins = (process.env.CORS_ORIGINS || "http://localhost:5173").split(",").map((s) => s.trim());

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "100kb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));

app.get("/health", (_req, res) => res.json({ ok: true }));

// Stores/updates the signed-in user's profile document
app.post("/api/me", requireAuth, async (req, res, next) => {
  try {
    await db.collection("users").doc(req.user.uid).set(
      { email: req.user.email, name: req.user.name, lastSeen: new Date() },
      { merge: true }
    );
    res.json(req.user);
  } catch (e) { next(e); }
});

app.use("/api/conversations", requireAuth, conversations);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Invalid input", details: err.flatten().fieldErrors });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`NexusAI backend listening on :${port}`));
