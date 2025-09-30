import { useState } from "react";
import { authFetch } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Signup({onSignup}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passwordHash, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await authFetch("/users/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, passwordHash }),
    });
    const data = await res.json();
    if(data.token){
      localStorage.setItem("token",data.token);
      onSignup(data.response , data.token);
      navigate('/');
    }
    if (data.error) {
      alert(data.error);
    } else {
      alert("Signup successful! Please login.");
    }
  };

return (
  <form className="signup-form" onSubmit={handleSubmit}>
    <h2 className="signup-title">Signup</h2>
    <input
      className="signup-input"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
    />
    <input
      className="signup-input"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      className="signup-input"
      type="password"
      placeholder="Password"
      value={passwordHash}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button className="signup-btn" type="submit">Signup</button>
  </form>
);
}
