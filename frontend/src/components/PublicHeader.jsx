import { useState } from "react";
import { MdArrowForward, MdClose, MdMenu } from "react-icons/md";
import logo from "../assets/logo.png";
import "./PublicHeader.css";

function PublicHeader({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className={`public-header ${menuOpen ? "menu-open" : ""}`}>
      <a
        className="public-brand"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          closeMenu();
          onNavigate("/");
        }}
      >
        <img src={logo} alt="Poietik Academy" />
        <span>
          <strong>POIETIK</strong>
          <small>ACADEMY</small>
        </span>
      </a>
      <nav className="public-nav">
        <a href="#tracks" onClick={closeMenu}>
          Tracks
        </a>
        <a href="#pedagogy" onClick={closeMenu}>
          Pedagogy
        </a>
        <a href="#cohorts" onClick={closeMenu}>
          Cohorts
        </a>
      </nav>
      <div className="header-actions">
        <button
          className="mobile-menu"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <MdClose /> : <MdMenu />}
        </button>
        <button
          className="outline-button"
          type="button"
          onClick={() => {
            closeMenu();
            onNavigate("/enroll");
          }}
        >
          Enroll Now <MdArrowForward />
        </button>
      </div>
    </header>
  );
}
export default PublicHeader;
