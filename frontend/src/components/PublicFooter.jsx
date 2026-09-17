import { MdEmail, MdPhone } from "react-icons/md";
import { SiTiktok, SiWhatsapp } from "react-icons/si";
import "./PublicFooter.css";

const WHATSAPP_URL =
  import.meta.env.VITE_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/EQCSUbUfF555mJtbhk5uoT";

function PublicFooter({ onNavigate }) {
  return (
    <footer className="public-footer">
      <div className="footer-meta">
        <strong>© 2026 Ignitus Poietik</strong>
        <span>Engineering education for the builders ahead · Accra, Ghana</span>
      </div>

      <div className="footer-contacts">
        <a
          href="mailto:ignituspoietik@gmail.com"
          className="footer-contact-pill"
          title="Send email"
        >
          <MdEmail />
          <span>ignituspoietik@gmail.com</span>
        </a>

        <a
          href="tel:+233548136155"
          className="footer-contact-pill"
          title="Call or message"
        >
          <MdPhone />
          <span>+233 54 813 6155</span>
        </a>

        <a
          href="https://www.tiktok.com/@ignituspoietik"
          target="_blank"
          rel="noreferrer"
          className="footer-contact-pill social-tiktok"
          title="TikTok: @ignituspoietik"
        >
          <SiTiktok />
          <span>TikTok</span>
        </a>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="footer-contact-pill social-whatsapp"
          title="Join WhatsApp Group"
        >
          <SiWhatsapp />
          <span>WhatsApp</span>
        </a>

        {onNavigate && (
          <button
            type="button"
            className="footer-admin-link"
            onClick={() => onNavigate("/admin/login")}
            title="Admin access"
          >
            Admin
          </button>
        )}
      </div>
    </footer>
  );
}

export default PublicFooter;
