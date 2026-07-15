import React, { useState } from "react";
import "./SettingsMenu.css";

const TABS = {
  ROLE_VERIFICATION: "ROLE_VERIFICATION",
};

const SettingsMenu = () => {
  const [activeTab, setActiveTab] = useState(TABS.ROLE_VERIFICATION);
  const [selectedRole, setSelectedRole] = useState("student");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSaveRole = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Nisi prijavljen.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5175/api/Roles/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roles: [selectedRole], // "student" ili "teacher"
        }),
      });

      if (!res.ok) {
        throw new Error(`Greška: ${res.status}`);
      }

      setMessage("Uloga je uspješno spremljena.");
    } catch (err) {
      setMessage("Spremanje uloge nije uspjelo. Pokušaj ponovno.");
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case TABS.ROLE_VERIFICATION:
        return (
          <div className="settings-content">
            <h2>Postavke/ Verifikacija uloge</h2>
            <p>Odaberi svoju ulogu u sustavu:</p>

            <div className="role-options">
              <button
                className={
                  selectedRole === "student"
                    ? "role-button role-button--active"
                    : "role-button"
                }
                onClick={() => setSelectedRole("student")}
              >
                Student
              </button>

              <button
                className={
                  selectedRole === "teacher"
                    ? "role-button role-button--active"
                    : "role-button"
                }
                onClick={() => setSelectedRole("teacher")}
              >
                Profesor
              </button>
            </div>

            <div className="role-actions">
              <button
                className="save-role-button"
                onClick={handleSaveRole}
                disabled={saving}
              >
                {saving ? "Spremanje..." : "Spremi"}
              </button>

              {message && <p className="role-message">{message}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-wrapper">
      <aside className="settings-sidebar">
        <h3 className="settings-title">Postavke</h3>
        <button
          className={
            activeTab === TABS.ROLE_VERIFICATION
              ? "settings-tab settings-tab--active"
              : "settings-tab"
          }
          onClick={() => setActiveTab(TABS.ROLE_VERIFICATION)}
        >
          Verifikacija uloge
        </button>
      </aside>

      <section className="settings-panel">{renderContent()}</section>
    </div>
  );
};

export default SettingsMenu;
