import { MdClose, MdDashboard, MdPeople, MdSchool } from "react-icons/md";
import logo from "../assets/b-logo.png";
import "./Sidebar.css";

const navigation = [
  { label: "Admin Overview", icon: MdDashboard, path: "/admin/students" },
  { label: "Manage Cohorts", icon: MdSchool, path: "/admin/cohorts" },
  { label: "Student Directory", icon: MdPeople, path: "/admin/students" },
];

function Sidebar({ open, onClose, onNavigate, currentPath = "" }) {
  const handleNav = (event, dest) => {
    event.preventDefault();
    if (onClose) onClose();
    if (onNavigate) {
      onNavigate(dest);
    } else {
      window.history.pushState({}, "", dest);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="brand-block">
          <img className="brand-logo" src={logo} alt="Poietik Academy" />
          <div>
            <strong>POIETIK</strong>
            <span>ADMIN CONSOLE</span>
          </div>
          <button
            className="close-menu"
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <MdClose />
          </button>
        </div>
        <div className="node-card">
          <span>Node Environment</span>
          <strong>Accra Main Hub</strong>
        </div>
        <nav aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, path }) => {
            const isActive =
              currentPath === path ||
              (path === "/admin/students" &&
                label === "Admin Overview" &&
                currentPath === "/admin/students");
            return (
              <a
                className={isActive ? "active" : ""}
                href={path}
                key={label}
                onClick={(e) => handleNav(e, path)}
              >
                <Icon />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div>
            <span>Public Campus</span>
            <a href="/" onClick={(e) => handleNav(e, "/")}>
              View Site
            </a>
          </div>
          <small>v2.4.0-gh-ignitus</small>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
