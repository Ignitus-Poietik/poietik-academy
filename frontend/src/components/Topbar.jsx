import { MdCheckCircle, MdMenu } from "react-icons/md";
import "./Topbar.css";

function Topbar({ onMenu }) {
  const username =
    sessionStorage.getItem("poietik_admin_user") || "saint-poietik";

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
        <strong>Poietik Academy · Admissions Portal</strong>
        <span>Engineering Academy · Accra Campus</span>
      </div>
      <div className="topbar-actions">
        <span className="verified">
          <MdCheckCircle /> Paystack &amp; MoMo Active
        </span>
        <div className="profile-avatar">SP</div>
        <div className="profile-name">
          <strong>{username}</strong>
          <span>Superuser</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
