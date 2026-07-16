import React, { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { sortFiles } from "../../../utils/FileSorting";
import { downloadFile } from "../../../utils/fileOperations";
import FileTableHeader from "../../../utils/FileTableHeader";
import FileTableRow from "../../../utils/FileTableRow";
import useFileList from "../../../utils/useFileList";
import useDragAndDrop from "../../../utils/useDragAndDrop";
import useAuth from "../../../utils/useAuth";
import useClickOutside from "../../../utils/useClickOutside";
import useSelection from "../../../utils/useSelection";
import useDragMove from "../../../utils/useDragMove";
import useRename from "../../../utils/FileRename";
import SelectionToolbar from "./SelectionToolbar";
import RenameModal from "./RenameModal";
import NewFolderModal from "./NewFolderModal";
import { useCreateFolder } from "../../../utils/useCreateFolder";
import DocumentViewer from "../../DocumentViewer/DocumentViewer";
import DashboardPage from "../../Layout/DashboardPage";

import "./MojShare.css";

const API_BASE = "http://localhost:5175";

const MojShare = () => {
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [rowMenuOpenId, setRowMenuOpenId] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [foldersPosition, setFoldersPosition] = useState("top");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);

  const { currentUserId } = useAuth();

  const {
    files,
    currentFolder,
    fetchItems,
    handleFileUpload,
    handleFolderUpload,
    uploading,
    error,
    success,
    setUploading,
    setError,
    setSuccess,
  } = useFileList({ API_BASE });

  const { createFolder } = useCreateFolder({
    API_BASE,
    fetchItems,
    currentFolder,
    setError,
  });

  const {
    selectedKeys,
    isSelected,
    toggleOne,
    clearSelection,
    getSelectionStats,
  } = useSelection();

  const {
    renameTarget,
    renameValue,
    handleRename,
    handleRenameConfirm,
    handleRenameCancel,
  } = useRename({ API_BASE, currentFolder, fetchItems, setError });

  const {
    draggedKeys,
    handleDragStart,
    handleDragOver,
    handleDropOnFolder,
    handleDropToRoot,
  } = useDragMove({
    onMoveItems: async (keys, targetFolderId) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const itemsToMove = keys.map((key) => {
        const [type, id] = key.split("-");
        return { type, id: parseInt(id, 10) };
      });

      const response = await fetch(`${API_BASE}/api/files/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: itemsToMove,
          targetFolderId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Move failed: ${errorText}`);
      }

      await fetchItems(currentFolder?.id ?? null, currentFolder?.name ?? null);
      clearSelection();
    },
  });

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const mainMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const tableRef = useRef(null);

  useClickOutside(mainMenuRef, showMainMenu, () => setShowMainMenu(false));
  useClickOutside(sortMenuRef, showSortMenu, () => setShowSortMenu(false));
  useClickOutside(tableRef, rowMenuOpenId !== null, () =>
    setRowMenuOpenId(null),
  );

  useEffect(() => {
    fetchItems(null, null);
  }, []);

  const { isDragging, dragHandlers } = useDragAndDrop({
    API_BASE,
    currentFolder,
    fetchItems,
    setUploading,
    setError,
    setSuccess,
  });

  const sortedFiles = sortFiles(files, { sortBy, sortDir, foldersPosition });

  const handleDownload = async (item) => {
    try {
      await downloadFile(item, API_BASE);
    } catch (err) {
      setError("Preuzimanje nije uspjelo.");
    }
  };

  const handleMoveToTrash = async (item) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const isFolder = item.type === "folder";
      const url = isFolder
        ? `${API_BASE}/api/files/folders/${item.id}`
        : `${API_BASE}/api/files/${item.id}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await fetchItems(
          currentFolder?.id ?? null,
          currentFolder?.name ?? null,
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openFolderDialog = () => {
    folderInputRef.current?.click();
  };

  const handleRowDoubleClick = (item) => {
    if (item.type === "folder") {
      fetchItems(item.id, item.name);
    } else {
      setViewerFile(item);
    }
  };

  const handleBreadcrumbRootClick = () => {
    fetchItems(null, null);
  };

  const pageHeader = (
    <div className="mojshare-header" ref={mainMenuRef}>
      <button
        type="button"
        className="mojshare-title-btn"
        onClick={() => setShowMainMenu((prev) => !prev)}
      >
        <span
          className="mojshare-breadcrumb"
          onClick={(e) => {
            e.stopPropagation();
            handleBreadcrumbRootClick();
          }}
        >
          Moj Share
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

      {showMainMenu && (
        <div className="mojshare-main-menu">
          <button
            type="button"
            onClick={() => {
              setNewFolderName("");
              setShowNewFolderModal(true);
              setShowMainMenu(false);
            }}
          >
            Kreiraj mapu
          </button>

          <button
            type="button"
            onClick={() => {
              openFileDialog();
              setShowMainMenu(false);
            }}
          >
            Prijenos datoteka
          </button>

          <button
            type="button"
            onClick={() => {
              openFolderDialog();
              setShowMainMenu(false);
            }}
          >
            Prijenos mape
          </button>
        </div>
      )}

      <SelectionToolbar
        stats={getSelectionStats(sortedFiles)}
        onClear={clearSelection}
        onDownloadAll={async () => {
          const selectedItems = selectedKeys
            .map((key) => {
              const [type, id] = key.split("-");
              return sortedFiles.find(
                (item) => item.type === type && item.id === Number(id),
              );
            })
            .filter(Boolean);

          for (const item of selectedItems) {
            try {
              await handleDownload(item);
            } catch (err) {
              console.error("Download failed for", item.name, err);
            }
          }
        }}
        onMoveAllToTrash={async () => {
          const selectedItems = selectedKeys
            .map((key) => {
              const [type, id] = key.split("-");
              return sortedFiles.find(
                (item) => item.type === type && item.id === Number(id),
              );
            })
            .filter(Boolean);

          for (const item of selectedItems) {
            try {
              await handleMoveToTrash(item);
            } catch (err) {
              console.error("Move to trash failed for", item.name, err);
            }
          }

          clearSelection();
        }}
      />
    </div>
  );

  const pageStatus =
    uploading || error || success ? (
      <div className="mojshare-status">
        {uploading && <span>Prijenos u tijeku...</span>}
        {error && <span className="mojshare-status-error">{error}</span>}
        {success && <span className="mojshare-status-success">{success}</span>}
      </div>
    ) : null;

  return (
    <div
      className={`mojshare-wrapper ${isDragging ? "mojshare-dragging" : ""}`}
      {...dragHandlers}
      onDrop={(e) => {
        const hasFileFromPC = Array.from(e.dataTransfer.items).some(
          (item) => item.kind === "file",
        );

        if (!hasFileFromPC) {
          handleDropToRoot(e);
          return;
        }

        dragHandlers.onDrop(e);
      }}
    >
      {isDragging && (
        <div className="mojshare-drag-overlay">
          <div className="mojshare-drag-message">
            Ispusti datoteke ili mape ovdje
          </div>
        </div>
      )}

      <DashboardPage header={pageHeader} status={pageStatus}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <input
          type="file"
          ref={folderInputRef}
          style={{ display: "none" }}
          webkitdirectory="true"
          directory="true"
          multiple
          onChange={handleFolderUpload}
        />

        <div className="mojshare-table-wrapper">
          <table className="mojshare-table" ref={tableRef}>
            <thead ref={sortMenuRef}>
              <FileTableHeader
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortDir={sortDir}
                setSortDir={setSortDir}
                foldersPosition={foldersPosition}
                setFoldersPosition={setFoldersPosition}
                showSortMenu={showSortMenu}
                setShowSortMenu={setShowSortMenu}
              />
            </thead>

            <tbody>
              {sortedFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="mojshare-empty">
                    Nema datoteka u "
                    {currentFolder && currentFolder.name
                      ? currentFolder.name
                      : "Moj Share"}
                    ".
                  </td>
                </tr>
              ) : (
                sortedFiles.map((item) => (
                  <FileTableRow
                    key={`${item.type}-${item.id}`}
                    item={item}
                    currentUserId={currentUserId}
                    onDoubleClick={handleRowDoubleClick}
                    rowMenuOpenId={rowMenuOpenId}
                    setRowMenuOpenId={setRowMenuOpenId}
                    onDownload={handleDownload}
                    onRename={handleRename}
                    onMoveToTrash={handleMoveToTrash}
                    isSelected={isSelected}
                    onRowClick={(e, rowKey) => {
                      if (e.metaKey || e.ctrlKey) {
                        toggleOne(rowKey);
                      } else {
                        toggleOne(rowKey);
                      }
                    }}
                    selectedKeys={selectedKeys}
                    onRowDragStart={handleDragStart}
                    onRowDragOver={handleDragOver}
                    onDropOnFolder={handleDropOnFolder}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardPage>

      <RenameModal
        isOpen={!!renameTarget}
        itemName={renameValue}
        onClose={handleRenameCancel}
        onConfirm={handleRenameConfirm}
      />

      <NewFolderModal
        isOpen={showNewFolderModal}
        folderName={newFolderName}
        onClose={() => {
          setShowNewFolderModal(false);
          setNewFolderName("");
        }}
        onConfirm={async (newName) => {
          const success = await createFolder(newName);
          if (success) {
            setShowNewFolderModal(false);
            setNewFolderName("");
          }
        }}
      />

      <DocumentViewer
        file={viewerFile}
        API_BASE={API_BASE}
        onClose={() => setViewerFile(null)}
      />
    </div>
  );
};

export default MojShare;
