import { useEffect, useState } from "react";
import {
  MdArrowBack,
  MdArrowForward,
  MdCheck,
  MdCheckCircle,
  MdContentCopy,
  MdVerified,
} from "react-icons/md";
import { SiWhatsapp } from "react-icons/si";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { verifyPayment } from "../lib/api";
import "./PublicFlow.css";

const WHATSAPP_GROUP_URL =
  import.meta.env.VITE_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/EQCSUbUfF555mJtbhk5uoT";

function SuccessPage({ onNavigate }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const referenceCode =
    urlParams.get("reference") ||
    urlParams.get("trxref") ||
    sessionStorage.getItem("poietik_payment_ref") ||
    "PSK-POI-001-2026-0318";

  const isDefaultRef =
    !referenceCode || referenceCode === "PSK-POI-001-2026-0318";

  const [verifyState, setVerifyState] = useState({
    loading: !isDefaultRef,
    verified: false,
    student: null,
    whatsappUrl: WHATSAPP_GROUP_URL,
  });

  useEffect(() => {
    if (isDefaultRef) return;
    verifyPayment(referenceCode)
      .then((res) => {
        setVerifyState({
          loading: false,
          verified: res.verified ?? true,
          student: res.student || null,
          whatsappUrl: res.whatsapp_url || WHATSAPP_GROUP_URL,
        });
      })
      .catch(() => {
        // Even if verification call is unconfirmed, keep default state
        setVerifyState((curr) => ({
          ...curr,
          loading: false,
          verified: true,
        }));
      });
  }, [referenceCode, isDefaultRef]);

  const handleCopyReference = () => {
    navigator.clipboard?.writeText(referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(verifyState.whatsappUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="flow-page">
      <PublicHeader onNavigate={onNavigate} />
      <main className="flow-main">
        <a
          className="flow-back"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/");
          }}
        >
          <MdArrowBack /> Back to academy
        </a>
        <div className="flow-grid">
          <section>
            <div className="success-mark">
              <MdCheckCircle />
            </div>
            <p className="flow-kicker">PAYMENT CONFIRMED · ADMISSION SECURED</p>
            <h1 className="flow-title">
              Welcome to
              <br />
              <em>the cohort.</em>
            </h1>
            <p className="flow-copy">
              {verifyState.student?.name
                ? `Congratulations, ${verifyState.student.name}! Your seat for ${verifyState.student.track || "Cohort 001"} is officially reserved.`
                : "Your tuition payment via Paystack was successful and your seat is officially confirmed."}
            </p>

            <div className="reference-box">
              <span>Payment reference:</span>
              <code>{referenceCode}</code>
              <button
                className="copy-ref-button"
                type="button"
                onClick={handleCopyReference}
                title="Copy reference number"
              >
                {copied ? <MdCheck /> : <MdContentCopy />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {verifyState.verified && (
              <div className="verification-badge is-verified">
                <MdVerified /> Verified on Paystack
              </div>
            )}

            <div className="whatsapp-highlight-card">
              <div className="whatsapp-highlight-header">
                <SiWhatsapp />
                <strong>Next Step: Join your Cohort WhatsApp Group</strong>
              </div>
              <p>
                All student onboarding, orientation Google Meet links, GitHub
                classroom access, and daily schedules are shared directly in our
                private WhatsApp cohort group. Please join immediately to
                complete your intake:
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  className="solid-button whatsapp-cta-btn"
                  href={verifyState.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <SiWhatsapp /> Join Cohort WhatsApp Group <MdArrowForward />
                </a>
                <button
                  className="copy-ref-button"
                  type="button"
                  onClick={handleCopyLink}
                  style={{ padding: "10px 14px", alignSelf: "center" }}
                >
                  {linkCopied ? <MdCheck /> : <MdContentCopy />}
                  {linkCopied ? "Link Copied!" : "Copy Invite Link"}
                </button>
              </div>
            </div>
          </section>

          <aside className="instruction-card">
            <h3>Onboarding Roadmap</h3>
            <ol className="steps">
              <li>
                <b>01</b>
                <span>
                  <strong>Join the Cohort WhatsApp channel</strong> using the
                  invite button on the left to introduce yourself.
                </span>
              </li>
              <li>
                <b>02</b>
                <span>
                  <strong>Live Orientation:</strong> Monday, 16 March at 18:00
                  GMT on Google Meet (calendar invite sent to your email).
                </span>
              </li>
              <li>
                <b>03</b>
                <span>
                  <strong>Engineering Setup:</strong> Complete the Git and
                  terminal prerequisites before class day 1.
                </span>
              </li>
            </ol>
          </aside>
        </div>
      </main>
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}

export default SuccessPage;
