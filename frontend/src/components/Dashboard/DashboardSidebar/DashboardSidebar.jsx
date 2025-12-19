import "./DashboardSidebar.css";
import {
  MdHome,
  MdFolderShared,
  MdPeopleAlt,
  MdGroups,
  MdWorkspaces,
  MdAccessTime,
  MdStar,
  MdDelete,
  MdCloud,
} from "react-icons/md";

const items = [
  { id: "home", label: "Početna stranica", icon: MdHome },
  { id: "my-share", label: "Moj Share", icon: MdFolderShared },
  { id: "shared-with-me", label: "Dijeljeno sa mnom", icon: MdPeopleAlt },
  { id: "groups", label: "Grupe", icon: MdGroups },
  { id: "teams", label: "Timovi", icon: MdWorkspaces },
  { id: "recent", label: "Nedavno", icon: MdAccessTime },
  { id: "favorites", label: "Favoriti", icon: MdStar },
  { id: "trash", label: "Otpad", icon: MdDelete },
  { id: "storage", label: "Pohrana", icon: MdCloud },
];

function DashboardSidebar({ active, onChange }) {
  return (
    <aside className="dashboard-sidebar">
      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={
                "sidebar-item" +
                (active === item.id ? " sidebar-item-active" : "")
              }
              onClick={() => onChange(item.id)}
            >
              <span className="sidebar-icon">
                <Icon size={18} />
              </span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default DashboardSidebar;
