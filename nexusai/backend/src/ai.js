import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.AI_MODEL || "claude-sonnet-5-5";
const SYSTEM = process.env.AI_SYSTEM_PROMPT || "You are NexusAI, a helpful, concise assistant.";

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

/** messages: [{ role: "user" | "assistant", content: string }] */
export async function generateReply(messages) {
  const c = getClient();
  if (!c) {
    return "The AI model is not configured yet. Set ANTHROPIC_API_KEY on the server to enable replies.";
  }
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    messages,
  });
  return res.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
}
