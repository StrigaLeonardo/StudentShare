import React, { useState } from "react";
import {
  MdFileDownload,
  MdDelete,
  MdRestore,
  MdDeleteForever,
} from "react-icons/md";
import {
  downloadFile,
  restoreItem,
  hardDeleteItem,
} from "../../../utils/fileOperations";
import ConfirmModal from "../Otpad/ConfirmModal";

const SelectionToolbar = ({
  stats,
  selectedItems,
  onClear,
  onSuccess,
  onError,
  type = "normal",
  API_BASE,
  onMoveAllToTrash,
  refreshList,
}) => {
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  if (!stats || stats.total === 0) return null;

  const handleDownloadAll = async () => {
    try {
      for (const item of selectedItems) {
        await downloadFile(item, API_BASE);
      }
      onSuccess(`Preuzeto ${selectedItems.length} stavki.`);
      onClear();
    } catch (err) {
      onError("Preuzimanje nije uspjelo.");
    }
  };

  const handleRestoreAll = async () => {
    try {
      for (const item of selectedItems) {
        await restoreItem(item, API_BASE);
      }
      onSuccess(`Vraćeno ${selectedItems.length} stavki.`);
      onClear();
      setShowRestoreModal(false);
      if (refreshList) refreshList();
    } catch (err) {
      onError("Vraćanje nije uspjelo.");
    }
  };

  const handleDeleteAll = async () => {
    try {
      for (const item of selectedItems) {
        await hardDeleteItem(item, API_BASE);
      }
      onSuccess(`Trajno izbrisano ${selectedItems.length} stavki.`);
      onClear();
      setShowDeleteModal(false);
      if (refreshList) refreshList();
    } catch (err) {
      onError("Brisanje nije uspjelo.");
    }
  };

  return (
    <>
      <div
        className={`mojshare-selection-toolbar ${
          stats.total > 0 ? "show" : ""
        }`}
      >
        <span>Označeno: {stats.total}</span>

        <button className="selection-toolbar-btn" onClick={handleDownloadAll}>
          <MdFileDownload className="mojshare-row-menu-icon" />
          Preuzmi sve
        </button>

        {type === "trash" ? (
          <>
            <button
              className="selection-toolbar-btn"
              onClick={() => setShowRestoreModal(true)}
            >
              <MdRestore className="mojshare-row-menu-icon" />
              Vrati sve
            </button>
            <button
              className="selection-toolbar-btn danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <MdDeleteForever className="mojshare-row-menu-icon" />
              Trajno izbriši sve
            </button>
          </>
        ) : (
          <button
            className="selection-toolbar-btn danger"
            onClick={onMoveAllToTrash}
          >
            <MdDelete className="mojshare-row-menu-icon" />U otpad
          </button>
        )}
      </div>

      {/* Modals za trash type */}
      {type === "trash" && (
        <>
          <ConfirmModal
            isOpen={showRestoreModal}
            title="Vrati sve označeno"
            message={`Vratit će se ${stats.total} označenih stavki.`}
            confirmLabel="Vrati sve"
            onConfirm={handleRestoreAll}
            onCancel={() => setShowRestoreModal(false)}
          />

          <ConfirmModal
            isOpen={showDeleteModal}
            title="Trajno izbriši sve označeno"
            message={`${stats.total} označenih stavki bit će trajno izbrisano i neće se moći vratiti.`}
            confirmLabel="Trajno izbriši sve"
            onConfirm={handleDeleteAll}
            onCancel={() => setShowDeleteModal(false)}
            isDanger={true}
          />
        </>
      )}
    </>
  );
};

export default SelectionToolbar;
