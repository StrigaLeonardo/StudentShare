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
import ConfirmModal from "../../Layout/ConfirmModal";

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
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
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
          iconKey: group.icon_key,
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

  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setIsNewGroupModalOpen(true);
  };

  const handleOpenEditModal = (group) => {
    setOpenMenuId(null);
    setEditingGroup(group);
    setIsNewGroupModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsNewGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleOpenDeleteModal = (group) => {
    setOpenMenuId(null);
    setGroupToDelete(group);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleteLoading) return;
    setGroupToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      setIsDeleteLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/groups/${groupToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Brisanje grupe nije uspjelo.");
      }

      setGroupsData((prev) =>
        prev.filter((group) => group.id !== groupToDelete.id),
      );

      setGroupToDelete(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Došlo je do greške pri brisanju grupe.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

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
            onClick={handleOpenCreateModal}
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
                onEditGroup={handleOpenEditModal}
                onDeleteGroup={handleOpenDeleteModal}
              />
            ))}
          </div>
        )}
      </DashboardPage>

      {isProfessor && (
        <NewGroupModal
          isOpen={isNewGroupModalOpen}
          onClose={handleCloseModal}
          mode={editingGroup ? "edit" : "create"}
          initialData={
            editingGroup
              ? {
                  id: editingGroup.id,
                  title: editingGroup.title,
                  description: editingGroup.description,
                  icon_key: editingGroup.iconKey,
                }
              : null
          }
          onSubmit={async (groupData) => {
            try {
              const token = localStorage.getItem("token");

              if (editingGroup) {
                const res = await fetch(
                  `${API_BASE}/api/groups/${groupData.id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      name: groupData.name,
                      description: groupData.description,
                      icon_key: groupData.icon_key,
                    }),
                  },
                );

                if (!res.ok) {
                  const errorText = await res.text();
                  throw new Error(
                    errorText || "Uređivanje grupe nije uspjelo.",
                  );
                }

                const updatedGroup = await res.json();

                const mappedUpdatedGroup = {
                  id: updatedGroup.id,
                  title: updatedGroup.name,
                  description: updatedGroup.description,
                  students: updatedGroup.studentsCount ?? 0,
                  iconKey: updatedGroup.icon_key,
                  icon: groupIcons[updatedGroup.icon_key] ?? groupIcons.default,
                };

                setGroupsData((prev) =>
                  prev.map((group) =>
                    group.id === mappedUpdatedGroup.id
                      ? mappedUpdatedGroup
                      : group,
                  ),
                );

                handleCloseModal();
                return;
              }

              const res = await fetch(`${API_BASE}/api/groups`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(groupData),
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
                iconKey: createdGroup.icon_key,
                icon: groupIcons[createdGroup.icon_key] ?? groupIcons.default,
              };

              setGroupsData((prev) => [mappedGroup, ...prev]);
              handleCloseModal();
            } catch (err) {
              console.error(err);
              alert(
                err.message ||
                  "Došlo je do greške pri spremanju promjena grupe.",
              );
            }
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!groupToDelete}
        title="Obriši grupu"
        message={
          groupToDelete
            ? `Jesi li siguran da želiš obrisati grupu "${groupToDelete.title}"? Ova radnja se ne može poništiti.`
            : ""
        }
        confirmText="Obriši grupu"
        cancelText="Odustani"
        isDanger
        isLoading={isDeleteLoading}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Grupe;
