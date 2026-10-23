import { auth } from "./firebase";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const token = await user.getIdToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  me: () => request("/api/me", { method: "POST" }),
  listConversations: () => request("/api/conversations"),
  createConversation: (title) => request("/api/conversations", { method: "POST", body: JSON.stringify({ title }) }),
  renameConversation: (id, title) => request(`/api/conversations/${id}`, { method: "PATCH", body: JSON.stringify({ title }) }),
  deleteConversation: (id) => request(`/api/conversations/${id}`, { method: "DELETE" }),
  listMessages: (id) => request(`/api/conversations/${id}/messages`),
  sendMessage: (id, content) => request(`/api/conversations/${id}/messages`, { method: "POST", body: JSON.stringify({ content }) }),
};
