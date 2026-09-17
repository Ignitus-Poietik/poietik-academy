import {
  MdClose,
  MdDashboard,
  MdPayments,
  MdPeople,
  MdSchool,
} from "react-icons/md";
import logo from "../assets/logo.png";
import "./Sidebar.css";

const navigation = [
  { label: "Admin Overview", icon: MdDashboard, path: "/admin/students" },
  { label: "Manage Cohorts", icon: MdSchool, path: "/admin/cohorts" },
  {
    label: "Student Directory",
    icon: MdPeople,
    path: "/admin/students",
    active: true,
  },
  { label: "Tuition & Rails", icon: MdPayments, path: "/admin/students" },
];

function Sidebar({ open, onClose }) {
  return (
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
        {navigation.map(({ label, icon: Icon, path, active }) => (
          <a className={active ? "active" : ""} href={path} key={label}>
            <Icon />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div>
          <span>Public Campus</span>
          <a href="#">View Site</a>
        </div>
        <small>v2.4.0-gh-ignitus</small>
      </div>
    </aside>
  );
}

export default Sidebar;
