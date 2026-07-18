import React, { useEffect, useRef, useState } from "react";
import { MdClose, MdOutlineAutoStories } from "react-icons/md";
import "./NewGroupModal.css";
import { GROUP_ICON_OPTIONS, DEFAULT_GROUP_ICON_KEY } from "./GroupIcons";

const NewGroupModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon_key: DEFAULT_GROUP_ICON_KEY,
  });

  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    setFormData({
      name: initialData?.title ?? "",
      description: initialData?.description ?? "",
      icon_key: initialData?.icon_key ?? DEFAULT_GROUP_ICON_KEY,
    });

    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, initialData]);

  if (!isOpen) return null;

  const isEditMode = mode === "edit";

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    onSubmit?.({
      id: initialData?.id,
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon_key: formData.icon_key,
    });

    if (!isEditMode) {
      setFormData({
        name: "",
        description: "",
        icon_key: DEFAULT_GROUP_ICON_KEY,
      });
    }

    onClose();
  };

  return (
    <div
      className="group-modal-overlay"
      ref={dialogRef}
      onMouseDown={handleBackdropClick}
    >
      <div
        className="group-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-modal-title"
      >
        <div className="group-modal-header">
          <div className="group-modal-title-wrap">
            <div className="group-modal-icon">
              <MdOutlineAutoStories size={20} />
            </div>
            <div>
              <h2 id="group-modal-title">
                {isEditMode ? "Uredi grupu" : "Kreiraj grupu"}
              </h2>
              <p>
                {isEditMode
                  ? "Uredi podatke postojeće grupe."
                  : "Unesi podatke za novu grupu."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="group-modal-close"
            onClick={onClose}
            aria-label="Zatvori modal"
          >
            <MdClose size={20} />
          </button>
        </div>

        <form className="group-modal-form" onSubmit={handleSubmit}>
          <div className="group-modal-field">
            <label htmlFor="group-name">Naziv</label>
            <input
              id="group-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              ref={nameInputRef}
              maxLength={100}
            />
          </div>

          <div className="group-modal-field">
            <label htmlFor="group-description">Opis</label>
            <textarea
              id="group-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="group-modal-field">
            <label>Odaberi ikonu</label>

            <div className="group-icon-picker">
              {GROUP_ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                const isSelected = formData.icon_key === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    className={`group-icon-option ${isSelected ? "selected" : ""}`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        icon_key: option.key,
                      }))
                    }
                    aria-label={`Odaberi ikonu ${option.label}`}
                    title={option.label}
                  >
                    <IconComponent size={22} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="group-modal-actions">
            <button
              type="button"
              className="group-modal-btn group-modal-btn-secondary"
              onClick={onClose}
            >
              Odustani
            </button>

            <button
              type="submit"
              className="group-modal-btn group-modal-btn-primary"
            >
              {isEditMode ? "Spremi promjene" : "Kreiraj grupu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewGroupModal;
