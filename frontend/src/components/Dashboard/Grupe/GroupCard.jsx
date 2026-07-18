import React from "react";
import {
  MdMoreVert,
  MdOutlineGroups,
  MdEdit,
  MdPersonAddAlt,
  MdDeleteOutline,
} from "react-icons/md";

const GroupCard = ({
  group,
  isMenuOpen,
  onToggleMenu,
  onEditGroup,
  onDeleteGroup,
}) => {
  const Icon = group.icon;

  return (
    <article className="grupe-card">
      <div className="grupe-card-top">
        <div className="grupe-card-icon">
          <Icon size={20} />
        </div>

        <div className="grupe-card-menu-anchor">
          <button
            type="button"
            className="mojshare-row-menu-btn"
            onClick={onToggleMenu}
          >
            <MdMoreVert />
          </button>

          {isMenuOpen && (
            <div className="mojshare-row-menu grupe-card-menu">
              <button type="button" onClick={() => onEditGroup?.(group)}>
                <span className="mojshare-row-menu-label">Uredi grupu</span>
                <MdEdit className="mojshare-row-menu-icon" />
              </button>

              <button
                type="button"
                className="danger"
                onClick={() => onDeleteGroup?.(group)}
              >
                <span className="mojshare-row-menu-label">Obriši grupu</span>
                <MdDeleteOutline className="mojshare-row-menu-icon" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grupe-card-body">
        <h3>{group.title}</h3>
        <p>{group.description}</p>
      </div>

      <div className="grupe-card-meta">
        <span>
          <MdOutlineGroups size={16} />
          {group.students} studenata
        </span>
      </div>

      <div className="grupe-card-footer">
        <button type="button" className="grupe-manage-btn">
          Upravljaj grupom
        </button>
      </div>
    </article>
  );
};

export default GroupCard;
