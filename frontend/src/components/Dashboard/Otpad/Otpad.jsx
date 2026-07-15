import React, { useState, useEffect, useRef, useMemo } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { sortFiles } from "../../../utils/FileSorting";
import {
  downloadFile,
  restoreItem,
  hardDeleteItem,
  emptyTrash,
} from "../../../utils/fileOperations";
import FileTableHeader from "../../../utils/FileTableHeader";
import FileTableRow from "../../../utils/FileTableRow";
import useFileList from "../../../utils/useFileList";
import useAuth from "../../../utils/useAuth";
import useClickOutside from "../../../utils/useClickOutside";
import ConfirmModal from "./ConfirmModal";
import SelectionToolbar from "../MojShare/SelectionToolbar";
import useSelection from "../../../utils/useSelection";

import "../MojShare/MojShare.css";
import "./Otpad.css";

const API_BASE = "http://localhost:5175";

const Otpad = () => {
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [foldersPosition, setFoldersPosition] = useState("top");
  const [rowMenuOpenId, setRowMenuOpenId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const menuRef = useRef(null);
  const { currentUserId } = useAuth();

  const {
    files: items,
    currentFolder,
    fetchItems: fetchTrashItems,
  } = useFileList({
    API_BASE,
    endpoint: "/api/files/trash",
    trashFilter: true,
    setError,
    setInfo,
  });

  const {
    selectedKeys,
    isSelected,
    toggleOne,
    clearSelection,
    getSelectionStats,
  } = useSelection();

  useEffect(() => {
    fetchTrashItems(null, null);
  }, []);

  useClickOutside(
    menuRef,
    showMainMenu || showSortMenu || rowMenuOpenId !== null,
    () => {
      setShowMainMenu(false);
      setShowSortMenu(false);
      setRowMenuOpenId(null);
    }
  );

  const sortedItems = sortFiles(items, { sortBy, sortDir, foldersPosition });

  const stats = useMemo(() => getSelectionStats(items), [items, selectedKeys]);

  const selectedItems = useMemo(() => {
    return items.filter((it) => selectedKeys.includes(`${it.type}-${it.id}`));
  }, [items, selectedKeys]);

  const handleRowClick = (e, rowKey) => {
    if (e?.target?.closest?.(".mojshare-row-menu, .mojshare-row-menu-btn"))
      return;
    toggleOne(rowKey);
  };

  const handleDownload = async (item) => {
    try {
      await downloadFile(item, API_BASE);
    } catch (err) {
      setError("Preuzimanje nije uspjelo.");
    }
  };

  const handleRestore = async (item) => {
    try {
      const message = await restoreItem(item, API_BASE);
      setInfo(message);
      setError(null);

      clearSelection();
      await fetchTrashItems(
        currentFolder?.id ?? null,
        currentFolder?.name ?? null
      );
    } catch (err) {
      setError("Vraćanje nije uspjelo.");
    }
  };

  const handleHardDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const message = await hardDeleteItem(deleteTarget, API_BASE);
      setInfo(message);
      setError(null);

      setDeleteTarget(null);
      clearSelection();
      await fetchTrashItems(
        currentFolder?.id ?? null,
        currentFolder?.name ?? null
      );
    } catch (err) {
      setError("Brisanje nije uspjelo.");
    }
  };

  const handleEmptyTrashConfirm = async () => {
    try {
      const message = await emptyTrash(API_BASE);
      setInfo(message);
      setError(null);

      clearSelection();
      setShowEmptyTrashModal(false);
      await fetchTrashItems(null, null);
    } catch (err) {
      setError("Pražnjenje otpada nije uspjelo.");
    }
  };

  const handleRowDoubleClick = (item) => {
    if (item.type === "folder") {
      fetchTrashItems(item.id, item.name);
      clearSelection();
    }
  };

  return (
    <div className="mojshare-wrapper">
      <div ref={menuRef}>
        <div className="mojshare-header">
          <button
            type="button"
            className="mojshare-title-btn"
            onClick={() => setShowMainMenu((prev) => !prev)}
          >
            <span
              className="mojshare-breadcrumb"
              onClick={(e) => {
                e.stopPropagation();
                fetchTrashItems(null, null);
                clearSelection();
              }}
            >
              Otpad
              {currentFolder && currentFolder.name
                ? ` / ${currentFolder.name}`
                : ""}
            </span>

            <MdKeyboardArrowDown
              className={
                showMainMenu
                  ? "mojshare-title-chevron mojshare-title-chevron--open"
                  : "mojshare-title-chevron"
              }
            />
          </button>

          <SelectionToolbar
            stats={stats}
            selectedItems={selectedItems}
            onClear={clearSelection}
            onSuccess={(msg) => {
              setInfo(msg);
              setError(null);
            }}
            onError={(msg) => {
              setError(msg);
              setInfo(null);
            }}
            type="trash"
            API_BASE={API_BASE}
            refreshList={() =>
              fetchTrashItems(
                currentFolder?.id ?? null,
                currentFolder?.name ?? null
              )
            }
          />

          {showMainMenu && (
            <div className="mojshare-main-menu">
              <button
                type="button"
                onClick={() => {
                  setShowEmptyTrashModal(true);
                  setShowMainMenu(false);
                }}
              >
                Isprazni otpad
              </button>
            </div>
          )}
        </div>

        {(error || info) && (
          <div className="mojshare-status">
            {error && <span className="mojshare-status-error">{error}</span>}
            {info && <span className="mojshare-status-success">{info}</span>}
          </div>
        )}

        <div className="mojshare-table-wrapper">
          <table className="mojshare-table">
            <thead>
              <FileTableHeader
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortDir={sortDir}
                setSortDir={setSortDir}
                foldersPosition={foldersPosition}
                setFoldersPosition={setFoldersPosition}
                showSortMenu={showSortMenu}
                setShowSortMenu={setShowSortMenu}
                columns={["Naziv", "Vlasnik", "Datum brisanja", "Veličina"]}
              />
            </thead>

            <tbody>
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="mojshare-empty">
                    Nema datoteka u otpadu.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => (
                  <FileTableRow
                    key={`${item.type}-${item.id}`}
                    item={item}
                    currentUserId={currentUserId}
                    onDoubleClick={handleRowDoubleClick}
                    rowMenuOpenId={rowMenuOpenId}
                    setRowMenuOpenId={setRowMenuOpenId}
                    onDownload={handleDownload}
                    onRename={() => {}}
                    onMoveToTrash={() => {}}
                    onRestore={handleRestore}
                    onHardDelete={() => setDeleteTarget(item)}
                    type="trash"
                    showOwner={true}
                    dateKey="deleted_at_utc"
                    isSelected={isSelected}
                    onRowClick={handleRowClick}
                    selectedKeys={selectedKeys}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Trajno brisanje"
        message={
          deleteTarget
            ? `${deleteTarget.type === "folder" ? "Mapa" : "Datoteka"} "${
                deleteTarget.name
              }" bit će trajno izbrisana i neće se moći vratiti.`
            : ""
        }
        confirmLabel="Trajno izbriši"
        onConfirm={handleHardDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDanger={true}
      />

      <ConfirmModal
        isOpen={showEmptyTrashModal}
        title="Isprazni otpad"
        message="Sve datoteke i mape u otpadu bit će trajno izbrisane i neće se moći vratiti."
        confirmLabel="Isprazni otpad"
        onConfirm={handleEmptyTrashConfirm}
        onCancel={() => setShowEmptyTrashModal(false)}
        isDanger={true}
      />
    </div>
  );
};

export default Otpad;
