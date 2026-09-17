import { MdEmail, MdPhone } from "react-icons/md";
import { SiTiktok, SiWhatsapp } from "react-icons/si";
import "./PublicFooter.css";

const WHATSAPP_NUMBER = "+233 54 813 6155";
const WHATSAPP_DIRECT_CHAT_URL =
  "https://wa.me/233548136155?text=Hello%20Ignitus%20Poietik%2C%20I%20have%20an%20inquiry%20about%20the%20academy.";

function PublicFooter() {
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
          title="Send email to ignituspoietik@gmail.com"
        >
          <MdEmail />
          <span>ignituspoietik@gmail.com</span>
        </a>

        <a
          href="tel:+233548136155"
          className="footer-contact-pill"
          title="Call admissions: +233 54 813 6155"
        >
          <MdPhone />
          <span>+233 54 813 6155</span>
        </a>

        <a
          href={WHATSAPP_DIRECT_CHAT_URL}
          target="_blank"
          rel="noreferrer"
          className="footer-contact-pill social-whatsapp"
          title={`Chat with us on WhatsApp: ${WHATSAPP_NUMBER} (Questions & Support)`}
        >
          <SiWhatsapp />
          <span>WhatsApp ({WHATSAPP_NUMBER})</span>
        </a>

        <a
          href="https://www.tiktok.com/@ignituspoietik"
          target="_blank"
          rel="noreferrer"
          className="footer-contact-pill social-tiktok"
          title="Follow us on TikTok: @ignituspoietik"
        >
          <SiTiktok />
          <span>TikTok</span>
        </a>
      </div>
    </footer>
  );
}

export default PublicFooter;
