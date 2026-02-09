import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "../auth.css";
export default function Register() {
  const navigate = useNavigate();
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [err,setErr] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await api.post("/api/auth/register", { name,email,password });
      navigate("/login");
    } catch (e) {
      setErr(e.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Create Account</h1>
        <p>Start tracking income, expenses and insights instantly.</p>
      </div>

      <form className="auth-card" onSubmit={handleRegister}>
        <h2>Register</h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        {err && <p className="error">{err}</p>}

        <button type="submit">Create Account</button>

        <p>
          Already have account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
