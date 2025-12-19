import { useState } from "react";

function RegisterForm({ onSuccess }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    try {
      const res = await fetch("http://localhost:5175/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Registracija nije uspjela");
        return;
      }

      setOk("Registracija je uspjela, sada se prijavi.");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <input
        type="text"
        placeholder="Ime i prezime"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
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
      {ok && <div className="success">{ok}</div>}
      <button type="submit">Registracija</button>
    </form>
  );
}

export default RegisterForm;
