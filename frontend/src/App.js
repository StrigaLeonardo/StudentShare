// src/App.jsx
import { useEffect, useState } from "react";
import AuthModal from "./components/AuthModal/AuthModal";
import DashboardHeader from "./components/Dashboard/DashboardHeader/DashboardHeader";
import DashboardSidebar from "./components/Dashboard/DashboardSidebar/DashboardSidebar";
import SettingsMenu from "./components/SettingsMenu/SettingsMenu";
import MojShare from "./components/Dashboard/MojShare/MojShare";

function App() {
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [userName, setUserName] = useState("Student");
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setShowAuthModal(false);

    const storedName = localStorage.getItem("fullName");
    if (storedName) setUserName(storedName);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    setShowAuthModal(true);
    setUserName("Student");
    setProfileOpen(false);
    setShowSettings(false);
  }

  function handleToggleProfile() {
    setProfileOpen((prev) => !prev);
  }

  // NOVO: poziva se iz AuthModal kad login prođe
  function handleLoginSuccess(fullName) {
    setUserName(fullName || "Student");
    setShowAuthModal(false);
    localStorage.setItem("fullName", fullName || "Student");
  }

  return (
    <div className="app">
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {!showAuthModal && (
        <>
          <DashboardHeader
            userName={userName}
            profileOpen={profileOpen}
            onProfileToggle={handleToggleProfile}
            onLogout={handleLogout}
            onSettingsToggle={() => setShowSettings((prev) => !prev)}
          />

          <div className="dashboard-shell">
            <DashboardSidebar
              active={activeSection}
              onChange={(id) => {
                setActiveSection(id);
                setShowSettings(false);
              }}
            />

            <main className="dashboard-content">
              {showSettings ? (
                <SettingsMenu />
              ) : activeSection === "my-share" ? (
                <MojShare />
              ) : (
                <div>Dashboard sadržaj</div>
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
