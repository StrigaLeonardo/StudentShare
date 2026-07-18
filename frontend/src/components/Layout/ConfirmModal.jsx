import React, { useEffect, useRef } from "react";
import { MdClose, MdWarningAmber } from "react-icons/md";
import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  title = "Potvrdi radnju",
  message = "Jesi li siguran da želiš nastaviti?",
  confirmText = "Potvrdi",
  cancelText = "Odustani",
  isDanger = false,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const overlayRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleBackdropMouseDown = (e) => {
    if (e.target === overlayRef.current && !isLoading) {
      onClose?.();
    }
  };

  return (
    <div
      className="confirm-modal-overlay"
      ref={overlayRef}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
      >
        <div className="confirm-modal-header">
          <div className="confirm-modal-title-wrap">
            <div className={`confirm-modal-icon ${isDanger ? "danger" : ""}`}>
              <MdWarningAmber size={20} />
            </div>

            <div>
              <h2 id="confirm-modal-title">{title}</h2>
              <p id="confirm-modal-message">{message}</p>
            </div>
          </div>

          <button
            type="button"
            className="confirm-modal-close"
            onClick={onClose}
            aria-label="Zatvori modal"
            disabled={isLoading}
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
            ref={cancelButtonRef}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`confirm-modal-btn ${
              isDanger
                ? "confirm-modal-btn-danger"
                : "confirm-modal-btn-primary"
            }`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Brisanje..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
