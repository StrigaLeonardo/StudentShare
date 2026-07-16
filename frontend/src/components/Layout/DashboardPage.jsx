import React from "react";
import "./DashboardPage.css";

const DashboardPage = ({ header, status, children, className = "" }) => {
  return (
    <section className={`dashboard-page ${className}`}>
      {header ? <div className="dashboard-page__header">{header}</div> : null}
      {status ? <div className="dashboard-page__status">{status}</div> : null}
      <div className="dashboard-page__content">{children}</div>
    </section>
  );
};

export default DashboardPage;
