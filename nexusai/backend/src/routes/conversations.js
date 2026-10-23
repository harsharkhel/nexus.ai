import { Router } from "express";
import { z } from "zod";
import { db, FieldValue } from "../firebase.js";
import { generateReply } from "../ai.js";

const router = Router();
const conversations = (uid) => db.collection("users").doc(uid).collection("conversations");

const createSchema = z.object({ title: z.string().trim().min(1).max(120).optional() });
const messageSchema = z.object({ content: z.string().trim().min(1).max(8000) });

const serialize = (doc) => {
  const d = doc.data();
  return {
    id: doc.id,
    ...d,
    createdAt: d.createdAt?.toMillis?.() ?? null,
    updatedAt: d.updatedAt?.toMillis?.() ?? null,
  };
};

// List conversations
router.get("/", async (req, res, next) => {
  try {
    const snap = await conversations(req.user.uid).orderBy("updatedAt", "desc").limit(100).get();
    res.json(snap.docs.map(serialize));
  } catch (e) { next(e); }
});

// Create conversation
router.post("/", async (req, res, next) => {
  try {
    const { title } = createSchema.parse(req.body ?? {});
    const ref = await conversations(req.user.uid).add({
      title: title || "New chat",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    res.status(201).json(serialize(await ref.get()));
  } catch (e) { next(e); }
});

// Rename conversation
router.patch("/:id", async (req, res, next) => {
  try {
    const { title } = z.object({ title: z.string().trim().min(1).max(120) }).parse(req.body);
    const ref = conversations(req.user.uid).doc(req.params.id);
    if (!(await ref.get()).exists) return res.status(404).json({ error: "Not found" });
    await ref.update({ title, updatedAt: FieldValue.serverTimestamp() });
    res.json(serialize(await ref.get()));
  } catch (e) { next(e); }
});

// Delete conversation (and its messages)
router.delete("/:id", async (req, res, next) => {
  try {
    const ref = conversations(req.user.uid).doc(req.params.id);
    if (!(await ref.get()).exists) return res.status(404).json({ error: "Not found" });
    await db.recursiveDelete(ref);
    res.status(204).end();
  } catch (e) { next(e); }
});

// List messages
router.get("/:id/messages", async (req, res, next) => {
  try {
    const ref = conversations(req.user.uid).doc(req.params.id);
    if (!(await ref.get()).exists) return res.status(404).json({ error: "Not found" });
    const snap = await ref.collection("messages").orderBy("createdAt", "asc").limit(500).get();
    res.json(snap.docs.map(serialize));
  } catch (e) { next(e); }
});

// Send a message, get the AI reply
router.post("/:id/messages", async (req, res, next) => {
  try {
    const { content } = messageSchema.parse(req.body);
    const convoRef = conversations(req.user.uid).doc(req.params.id);
    const convo = await convoRef.get();
    if (!convo.exists) return res.status(404).json({ error: "Not found" });

    const msgs = convoRef.collection("messages");
    const userRef = await msgs.add({ role: "user", content, createdAt: FieldValue.serverTimestamp() });

    // Build context from the last 30 messages
    const history = await msgs.orderBy("createdAt", "asc").limitToLast(30).get();
    const context = history.docs.map((d) => ({ role: d.data().role, content: d.data().content }));

    let reply;
    try {
      reply = await generateReply(context);
    } catch (err) {
      console.error("AI error:", err.message);
      reply = "Sorry, I couldn't generate a reply right now. Please try again.";
    }

    const botRef = await msgs.add({ role: "assistant", content: reply, createdAt: FieldValue.serverTimestamp() });

    const updates = { updatedAt: FieldValue.serverTimestamp() };
    if (convo.data().title === "New chat") updates.title = content.slice(0, 50);
    await convoRef.update(updates);

    const [u, b, c] = await Promise.all([userRef.get(), botRef.get(), convoRef.get()]);
    res.status(201).json({ userMessage: serialize(u), assistantMessage: serialize(b), conversation: serialize(c) });
  } catch (e) { next(e); }
});

export default router;
