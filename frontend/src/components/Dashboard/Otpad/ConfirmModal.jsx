import React from "react";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Potvrdi",
  cancelLabel = "Odustani",
  onConfirm,
  onCancel,
  isDanger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="mojshare-modal-backdrop">
      <div className="mojshare-modal">
        <div className="mojshare-modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="mojshare-modal-close"
            onClick={onCancel}
          >
            ×
          </button>
        </div>
        <div className="mojshare-modal-body">
          <p>{message}</p>
        </div>
        <div className="mojshare-modal-footer">
          <button
            type="button"
            className="mojshare-modal-btn mojshare-modal-btn-secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`mojshare-modal-btn mojshare-modal-btn-primary ${
              isDanger ? "danger" : ""
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
