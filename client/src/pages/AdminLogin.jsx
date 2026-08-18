import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch, readJson } from "../api";
import "./AdminLogin.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try {
      const data = await readJson(await apiFetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
      }));
      localStorage.setItem("token", data.token);
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (requestError) { setError(requestError.message); }
    finally { setSubmitting(false); }
  }

  return <div className="loginRoot" style={{ background: 'url("/images/bg-cafe.png") no-repeat center/cover' }}>
    <form className="loginForm" onSubmit={handleSubmit}>
      <h2 className="loginTitle">Admin prijava</h2>
      <div className="loginField"><span className="loginIcon" aria-hidden="true">👤</span><input type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="loginInput" required /></div>
      <div className="loginField"><span className="loginIcon" aria-hidden="true">🔒</span><input type="password" autoComplete="current-password" placeholder="Lozinka" value={password} onChange={(e) => setPassword(e.target.value)} className="loginInput" required /></div>
      {error && <p role="alert" className="loginError">{error}</p>}
      <button type="submit" className="loginButton" disabled={submitting}>{submitting ? "Prijava..." : "Prijavi se"}</button>
    </form>
  </div>;
}

export default AdminLogin;
