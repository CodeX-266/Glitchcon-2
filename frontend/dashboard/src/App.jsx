import { useState } from "react";
import "./styles/theme.css";
import { Shell } from "./components/layout/Shell";
import { Login } from "./components/layout/Login";

export default function App() {
  const [user, setUser] = useState(null);
  return user
    ? <Shell user={user} onLogout={() => setUser(null)} />
    : <Login onLogin={setUser} />;
}
