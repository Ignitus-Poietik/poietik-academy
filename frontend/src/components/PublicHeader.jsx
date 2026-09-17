import { useState } from "react";
import { MdArrowForward, MdClose, MdMenu } from "react-icons/md";
import logo from "../assets/b-logo.png";
import "./PublicHeader.css";

function PublicHeader({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (event, hash) => {
    event.preventDefault();
    closeMenu();
    if (window.location.pathname !== "/") {
      onNavigate("/" + hash);
    } else {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = hash;
      }
    }
  };

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
        <a href="#tracks" onClick={(e) => handleNavClick(e, "#tracks")}>
          Tracks
        </a>
        <a href="#pedagogy" onClick={(e) => handleNavClick(e, "#pedagogy")}>
          Pedagogy
        </a>
        <a href="#cohorts" onClick={(e) => handleNavClick(e, "#cohorts")}>
          Cohorts
        </a>
      </nav>
      <div className="header-actions">
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
        <button
          className="mobile-menu"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>
    </header>
  );
}
export default PublicHeader;
