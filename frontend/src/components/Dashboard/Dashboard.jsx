import React, { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import MojShare from "./MojShare/MojShare";
import Otpad from "./Otpad/Otpad";

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
      <DashboardSidebar active={activeSection} onChange={setActiveSection} />
      <main className="dashboard-main">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;
