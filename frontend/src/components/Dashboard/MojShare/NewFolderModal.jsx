import React from "react";

const NewFolderModal = ({ isOpen, folderName, onClose, onConfirm }) => {
  const [inputValue, setInputValue] = React.useState(folderName || "");

  React.useEffect(() => {
    setInputValue(folderName || "");
  }, [folderName]);

  const handleConfirm = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onConfirm(trimmed);
    }
  };

  const handleCancel = () => {
    setInputValue("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="mojshare-modal-backdrop">
      <div className="mojshare-modal">
        <div className="mojshare-modal-header">
          <h2>Nova mapa</h2>
          <button
            type="button"
            className="mojshare-modal-close"
            onClick={handleCancel}
          >
            ×
          </button>
        </div>
        <div className="mojshare-modal-body">
          <input
            type="text"
            className="mojshare-modal-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
            placeholder="Naziv mape"
          />
        </div>
        <div className="mojshare-modal-footer">
          <button
            type="button"
            className="mojshare-modal-btn mojshare-modal-btn-secondary"
            onClick={handleCancel}
          >
            Odustani
          </button>
          <button
            type="button"
            className="mojshare-modal-btn mojshare-modal-btn-primary"
            onClick={handleConfirm}
          >
            Kreiraj
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewFolderModal;
