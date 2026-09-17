import {
  MdClose,
  MdDashboard,
  MdLogout,
  MdPeople,
  MdSchool,
} from "react-icons/md";
import logo from "../assets/b-logo.png";
import { adminLogout } from "../lib/api";
import { toast } from "react-toastify";
import "./Sidebar.css";

const navigation = [
  { label: "Admin Overview", icon: MdDashboard, path: "/admin/overview" },
  { label: "Manage Cohorts", icon: MdSchool, path: "/admin/cohorts" },
  { label: "Student Directory", icon: MdPeople, path: "/admin/students" },
];

function Sidebar({ open, onClose, onNavigate, currentPath = "" }) {
  const username =
    sessionStorage.getItem("poietik_admin_user") || "saint-poietik";

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

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {
      // ignore network errors on logout
    }
    sessionStorage.removeItem("poietik_admin_user");
    toast.info("Logged out of Admin Console.");
    if (onNavigate) onNavigate("/admin/login");
    else window.location.href = "/admin/login";
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

        <nav aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, path }) => {
            const isActive =
              currentPath === path ||
              (path === "/admin/overview" &&
                (currentPath === "/admin" || currentPath === "/admin/"));
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
          <div className="sidebar-user-block">
            <div className="sidebar-avatar">SP</div>
            <div className="sidebar-user-info">
              <strong title={username}>{username}</strong>
              <span>Superuser</span>
            </div>
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Log out of Admin Console"
            >
              <MdLogout />
            </button>
          </div>

          <div className="sidebar-campus-row">
            <span>Public Campus</span>
            <a href="/" onClick={(e) => handleNav(e, "/")}>
              View Site
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
