import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import "./AuthModalCss/AuthModal.css";

function AuthModal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState("login");

  return (
    <div className="auth-modal">
      <div className="intro-wrapper">
        <div className="intro-content">
          <h1>StudentShare</h1>
        </div>
      </div>
      <div className="auth-modal-content">
        <button className="close-btn" onClick={onClose}></button>

        <div className="tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Prijava
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Registracija
          </button>
        </div>

        {mode === "login" ? (
          <LoginForm
            onSuccess={(fullName) => {
              if (onLoginSuccess) onLoginSuccess(fullName);
              onClose();
            }}
          />
        ) : (
          <RegisterForm onSuccess={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}

export default AuthModal;
