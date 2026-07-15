import "./DashboardHeader.css";
import { MdHelpOutline, MdSettings } from "react-icons/md";

function DashboardHeader({
  userName = "Student",
  profileOpen,
  onProfileToggle,
  onLogout,
  onSettingsToggle,
}) {
  return (
    <header className="dashboard-header">
      <div className="dh-left">
        <h1>StudentShare</h1>
      </div>

      <div className="dh-right">
        <button className="icon-btn" aria-label="Help">
          <MdHelpOutline size={18} />
        </button>

        <button
          className="icon-btn"
          aria-label="Settings"
          onClick={onSettingsToggle}
        >
          <MdSettings size={18} />
        </button>

        <div className="profile-wrapper">
          <button
            className="profile-pill"
            type="button"
            onClick={onProfileToggle}
          >
            <div className="avatar-circle">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="profile-name">{userName}</span>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <button type="button" onClick={onLogout}>
                Odjava
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
