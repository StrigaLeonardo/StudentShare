import React, { useState, useRef, useEffect } from "react";
import {
  MdAdd,
  MdOutlineAutoStories,
  MdOutlineCode,
  MdOutlineBarChart,
  MdOutlineStorage,
} from "react-icons/md";
import DashboardPage from "../../Layout/DashboardPage";
import useClickOutside from "../../../utils/useClickOutside";
import GroupCard from "./GroupCard";
import "../MojShare/MojShare.css";
import "./Grupe.css";
import NewGroupModal from "./NewGroupModal";

const API_BASE = "http://localhost:5175";

const groupIcons = {
  stories: MdOutlineAutoStories,
  code: MdOutlineCode,
  chart: MdOutlineBarChart,
  storage: MdOutlineStorage,
  default: MdOutlineAutoStories,
};

const Grupe = () => {
  const [groupsData, setGroupsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const menuAreaRef = useRef(null);

  useClickOutside(menuAreaRef, openMenuId !== null, () => setOpenMenuId(null));

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/groups`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Dohvat grupa nije uspio.");
        }

        const data = await res.json();

        setIsProfessor(data.canCreateGroup);

        const mappedGroups = (data.items || []).map((group) => ({
          id: group.id,
          title: group.name,
          description: group.description,
          students: group.studentsCount ?? 0,
          icon: groupIcons[group.icon_key] ?? groupIcons.default,
        }));

        setGroupsData(mappedGroups);
      } catch (err) {
        setError(err.message || "Došlo je do greške.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const pageHeader = (
    <div className="mojshare-header">
      <button type="button" className="mojshare-title-btn">
        <span className="mojshare-breadcrumb">Grupe</span>
      </button>

      {isProfessor && (
        <div className="grupe-action-pill">
          <button
            type="button"
            className="selection-toolbar-btn grupe-action-btn"
            onClick={() => setIsNewGroupModalOpen(true)}
          >
            <MdAdd size={18} />
            Kreiraj grupu
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mojshare-wrapper">
      <DashboardPage header={pageHeader}>
        {loading ? (
          <div className="mojshare-status">Učitavanje grupa...</div>
        ) : error ? (
          <div className="mojshare-status">
            <span className="mojshare-status-error">{error}</span>
          </div>
        ) : (
          <div className="grupe-grid" ref={menuAreaRef}>
            {groupsData.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                isMenuOpen={openMenuId === group.id}
                onToggleMenu={() =>
                  setOpenMenuId((prev) => (prev === group.id ? null : group.id))
                }
              />
            ))}
          </div>
        )}
      </DashboardPage>

      {isProfessor && (
        <NewGroupModal
          isOpen={isNewGroupModalOpen}
          onClose={() => setIsNewGroupModalOpen(false)}
          onSubmit={async (newGroupData) => {
            try {
              const token = localStorage.getItem("token");

              const res = await fetch(`${API_BASE}/api/groups`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newGroupData),
              });

              if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Kreiranje grupe nije uspjelo.");
              }

              const createdGroup = await res.json();

              const mappedGroup = {
                id: createdGroup.id,
                title: createdGroup.name,
                description: createdGroup.description,
                students: createdGroup.studentsCount ?? 0,
                icon: groupIcons[createdGroup.icon_key] ?? groupIcons.default,
              };

              setGroupsData((prev) => [mappedGroup, ...prev]);
              setIsNewGroupModalOpen(false);
            } catch (err) {
              console.error(err);
              alert(err.message || "Došlo je do greške pri kreiranju grupe.");
            }
          }}
        />
      )}
    </div>
  );
};

export default Grupe;
