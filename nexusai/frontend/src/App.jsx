import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./Login.jsx";
import Chat from "./Chat.jsx";

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) return <div className="splash">Loading…</div>;
  return user ? <Chat user={user} /> : <Login />;
}
