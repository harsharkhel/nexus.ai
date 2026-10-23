import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { api } from "./api";

export default function Chat({ user }) {
  const [convos, setConvos] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.me().catch(() => {});
    api.listConversations().then(setConvos).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!activeId) return setMessages([]);
    api.listMessages(activeId).then(setMessages).catch((e) => setError(e.message));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const newChat = async () => {
    try {
      const c = await api.createConversation();
      setConvos((prev) => [c, ...prev]);
      setActiveId(c.id);
      setSidebarOpen(false);
    } catch (e) { setError(e.message); }
  };

  const removeChat = async (id) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      await api.deleteConversation(id);
      setConvos((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    } catch (e) { setError(e.message); }
  };

  const send = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    setError("");
    setSending(true);
    setInput("");

    let id = activeId;
    try {
      if (!id) {
        const c = await api.createConversation();
        setConvos((prev) => [c, ...prev]);
        id = c.id;
        setActiveId(id);
      }
      setMessages((prev) => [...prev, { id: "tmp", role: "user", content }]);
      const res = await api.sendMessage(id, content);
      setMessages((prev) => [...prev.filter((m) => m.id !== "tmp"), res.userMessage, res.assistantMessage]);
      setConvos((prev) => [res.conversation, ...prev.filter((c) => c.id !== id)]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.filter((m) => m.id !== "tmp"));
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">◆ NexusAI</div>
        <button className="btn primary" onClick={newChat}>+ New chat</button>
        <nav className="convo-list">
          {convos.map((c) => (
            <div key={c.id} className={`convo ${c.id === activeId ? "active" : ""}`} onClick={() => { setActiveId(c.id); setSidebarOpen(false); }}>
              <span className="title">{c.title}</span>
              <button className="icon" title="Delete" onClick={(e) => { e.stopPropagation(); removeChat(c.id); }}>×</button>
            </div>
          ))}
          {!convos.length && <p className="muted">No conversations yet.</p>}
        </nav>
        <div className="user-box">
          <span className="muted">{user.email}</span>
          <button className="btn ghost" onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon menu" onClick={() => setSidebarOpen((o) => !o)}>☰</button>
          <span>{convos.find((c) => c.id === activeId)?.title || "NexusAI"}</span>
        </header>

        <div className="messages">
          {!messages.length && (
            <div className="empty">
              <h2>How can I help today?</h2>
              <p className="muted">Ask anything to get started.</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`msg ${m.role}`}>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          {sending && <div className="msg assistant"><div className="bubble typing">Thinking…</div></div>}
          <div ref={bottomRef} />
        </div>

        {error && <div className="error-bar" onClick={() => setError("")}>{error} (click to dismiss)</div>}

        <form className="composer" onSubmit={send}>
          <textarea
            rows={1}
            placeholder="Message NexusAI…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) send(e); }}
          />
          <button className="btn primary" disabled={sending || !input.trim()}>Send</button>
        </form>
      </main>
    </div>
  );
}
