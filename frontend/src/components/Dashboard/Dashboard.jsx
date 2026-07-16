import React, { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import MojShare from "./MojShare/MojShare";
import Otpad from "./Otpad/Otpad";
import "./Dashboard.css";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("my-share");

  const renderContent = () => {
    switch (activeSection) {
      case "my-share":
        return <MojShare />;
      case "trash":
        return <Otpad />;
      default:
        return <MojShare />;
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar-shell">
        <DashboardSidebar active={activeSection} onChange={setActiveSection} />
      </div>

      <main className="dashboard-main">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;
