import { MdCheckCircle, MdMenu } from "react-icons/md";
import "./Topbar.css";

function Topbar({ onMenu }) {
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
        <strong>Ghana Academic Node</strong>
        <span>Active Cohort: 2025 Early-Bird Alpha</span>
      </div>
      <div className="topbar-actions">
        <span className="verified">
          <MdCheckCircle /> Paystack &amp; MoMo Live
        </span>
        <div className="profile-avatar">NA</div>
        <div className="profile-name">
          <strong>Admin Registrar</strong>
          <span>Accra Central</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
