import React from "react";
import {
  MdFileDownload,
  MdDriveFileRenameOutline,
  MdDelete,
  MdRestore,
  MdDeleteForever,
} from "react-icons/md";
import FileIcon from "./FileIcon";

const FileTableRow = ({
  item,
  onDoubleClick,
  rowMenuOpenId,
  setRowMenuOpenId,
  onDownload,
  onRename,
  onMoveToTrash,
  onRestore,
  onHardDelete,
  sizeKey = "size_bytes",
  dateKey = "created_at",
  showOwner = true,
  type = "share",
  vrstaColumn = false,
  currentUserId = null,
  isSelected,
  onRowClick,
  selectedKeys = [],
  onRowDragStart,
  onRowDragOver,
  onDropOnFolder,
}) => {
  const displayName =
    item.type === "folder"
      ? item.name
      : item.name?.split("/").pop() ?? item.name;

  const rowKey = `${item.type}-${item.id}`;

  return (
    <tr
      className={`mojshare-row ${isSelected?.(rowKey) ? "is-selected" : ""}`}
      onClick={(e) => {
        if (e.target.closest(".mojshare-row-menu, .mojshare-row-menu-btn"))
          return;
        onRowClick?.(e, rowKey);
      }}
      onDoubleClick={() => onDoubleClick(item)}
      draggable
      onDragStart={(e) => onRowDragStart?.(e, rowKey, selectedKeys)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        e.currentTarget.classList.add("drag-over");
        onRowDragOver?.(e);
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove("drag-over");
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("drag-over");
        if (item.type === "folder") {
          onDropOnFolder?.(e, item.id);
        }
      }}
    >
      <td>
        <div className="mojshare-name-cell">
          <FileIcon item={item} className="mojshare-name-icon" />
          <span>{displayName}</span>
        </div>
      </td>

      {showOwner ? (
        <td>
          {currentUserId && item.owner_user_id === currentUserId
            ? "Ti"
            : item.owner_email || "Nepoznat"}
        </td>
      ) : vrstaColumn ? (
        <td>{item.type === "folder" ? "Mapa" : "Datoteka"}</td>
      ) : null}

      <td>
        {item[dateKey]
          ? new Date(item[dateKey]).toLocaleDateString("hr-HR")
          : "-"}
      </td>

      <td>
        {item.type === "file" && item[sizeKey] != null
          ? `${(item[sizeKey] / (1024 * 1024)).toFixed(1)} MB`
          : "-"}
      </td>

      <td className="mojshare-row-actions-cell">
        <div className="mojshare-actions-inner">
          <button
            type="button"
            className="mojshare-row-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setRowMenuOpenId((prev) => (prev === rowKey ? null : rowKey));
            }}
          >
            ⋮
          </button>

          {rowMenuOpenId === rowKey && (
            <div className="mojshare-row-menu">
              {type === "share" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onDownload(item);
                      setRowMenuOpenId(null);
                    }}
                  >
                    <MdFileDownload className="mojshare-row-menu-icon" />
                    <span className="mojshare-row-menu-label">
                      {item.type === "folder" ? "Preuzmi kao ZIP" : "Preuzmi"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRename(item);
                      setRowMenuOpenId(null);
                    }}
                  >
                    <MdDriveFileRenameOutline className="mojshare-row-menu-icon" />
                    <span className="mojshare-row-menu-label">
                      Promijeni naziv
                    </span>
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      onMoveToTrash(item);
                      setRowMenuOpenId(null);
                    }}
                  >
                    <MdDelete className="mojshare-row-menu-icon" />
                    <span className="mojshare-row-menu-label">
                      Premjesti u otpad
                    </span>
                  </button>
                </>
              )}

              {type === "trash" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onDownload(item);
                      setRowMenuOpenId(null);
                    }}
                  >
                    <MdFileDownload className="mojshare-row-menu-icon" />
                    <span className="mojshare-row-menu-label">
                      {item.type === "folder" ? "Preuzmi kao ZIP" : "Preuzmi"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRestore(item);
                      setRowMenuOpenId(null);
                    }}
                  >
                    <MdRestore className="mojshare-row-menu-icon" />
                    <span className="mojshare-row-menu-label">Vrati</span>
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      onHardDelete(item);
                      setRowMenuOpenId(null);
                    }}
                  >
                    <MdDeleteForever className="mojshare-row-menu-icon" />
                    <span className="mojshare-row-menu-label">
                      Trajno izbriši
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default FileTableRow;
