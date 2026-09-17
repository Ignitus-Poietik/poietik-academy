import { MdCheckCircle, MdLaunch, MdLogout, MdMenu } from "react-icons/md";
import { adminLogout } from "../lib/api";
import "./Topbar.css";

function Topbar({ onMenu, onNavigate }) {
  const username = sessionStorage.getItem("poietik_admin_user") || "admin";

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {
      // ignore
    }
    sessionStorage.removeItem("poietik_admin_user");
    if (onNavigate) onNavigate("/admin/login");
    else window.location.href = "/admin/login";
  };

  return (
    <header className="topbar">
      <button
        className="menu-button"
        type="button"
        aria-label="Open navigation"
        onClick={onMenu}
      >
        <MdMenu />
      </button>
      <div className="topbar-context">
        <strong>Ghana Academic Node · Admin Console</strong>
        <span>Connected Node: Accra Central (Django + SQLite)</span>
      </div>
      <div className="topbar-actions">
        <span className="verified">
          <MdCheckCircle /> Paystack &amp; MoMo Live
        </span>
        <a
          href="http://127.0.0.1:8000/admin/"
          target="_blank"
          rel="noreferrer"
          className="django-admin-btn"
          title="Open Django Native Admin"
        >
          <span>Django Admin</span>
          <MdLaunch />
        </a>
        <div className="profile-avatar">AD</div>
        <div className="profile-name">
          <strong>{username}</strong>
          <span>Superuser</span>
        </div>
        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          title="Log out"
        >
          <MdLogout />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
