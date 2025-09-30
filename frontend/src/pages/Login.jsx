import { useState } from "react";
import { authFetch } from "../utils/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await authFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.token) {
      onLogin(data.user, data.token);
    } else {
      alert(data.error || "Login failed");
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2 className="signup-title">Login</h2>
      <input className="signup-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="signup-input" type="password" placeholder="Password"
             value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="signup-btn" type="submit">Login</button>
    </form>
  );
}
