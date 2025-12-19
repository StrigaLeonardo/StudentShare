import { useState } from "react";

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5175/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Login failed");
        return;
      }

      const data = await res.json(); // { token, fullName }

      localStorage.setItem("token", data.token);
      if (data.fullName) {
        localStorage.setItem("fullName", data.fullName);
      }

      // PROSLIJEDI IME OVDJE
      if (onSuccess) onSuccess(data.fullName);
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Lozinka"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Prijava</button>
    </form>
  );
}

export default LoginForm;
