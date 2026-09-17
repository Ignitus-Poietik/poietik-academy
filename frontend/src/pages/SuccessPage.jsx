import { useEffect, useState } from "react";
import {
  MdArrowBack,
  MdArrowForward,
  MdCheck,
  MdCheckCircle,
  MdContentCopy,
  MdLock,
  MdRefresh,
  MdVerified,
} from "react-icons/md";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "react-toastify";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { verifyPayment } from "../lib/api";
import "./PublicFlow.css";

function SuccessPage({ onNavigate }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [manualRef, setManualRef] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const queryRef =
    urlParams.get("reference") ||
    urlParams.get("trxref") ||
    sessionStorage.getItem("poietik_payment_ref") ||
    "";

  const [referenceCode, setReferenceCode] = useState(queryRef);

  const [verifyState, setVerifyState] = useState({
    loading: !!queryRef,
    verified: false,
    student: null,
    whatsappUrl: null,
    message: queryRef
      ? ""
      : "No payment reference detected. Please verify your payment reference below.",
  });

  useEffect(() => {
    if (!queryRef) return;
    let isMounted = true;
    verifyPayment(queryRef)
      .then((res) => {
        if (!isMounted) return;
        if (res.verified && res.whatsapp_url) {
          setVerifyState({
            loading: false,
            verified: true,
            student: res.student || null,
            whatsappUrl: res.whatsapp_url,
            message: "",
          });
          toast.success("Payment confirmed! WhatsApp group unlocked.");
        } else {
          setVerifyState({
            loading: false,
            verified: false,
            student: null,
            whatsappUrl: null,
            message:
              res.message || "Payment has not been completed or verified yet.",
          });
          toast.warn(
            "Payment unverified. The WhatsApp group link remains locked.",
          );
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setVerifyState({
          loading: false,
          verified: false,
          student: null,
          whatsappUrl: null,
          message: err.message || "Unable to verify payment reference.",
        });
        toast.error(err.message || "Verification request failed.");
      });
    return () => {
      isMounted = false;
    };
  }, [queryRef]);

  const handleManualVerify = async (e) => {
    e.preventDefault();
    const ref = manualRef.trim();
    if (!ref) {
      toast.error("Please enter your Paystack payment reference.");
      return;
    }
    setManualLoading(true);
    setReferenceCode(ref);
    setVerifyState((curr) => ({ ...curr, loading: true }));
    try {
      const res = await verifyPayment(ref);
      if (res.verified && res.whatsapp_url) {
        setVerifyState({
          loading: false,
          verified: true,
          student: res.student || null,
          whatsappUrl: res.whatsapp_url,
          message: "",
        });
        toast.success("Payment confirmed! WhatsApp group unlocked.");
      } else {
        setVerifyState({
          loading: false,
          verified: false,
          student: null,
          whatsappUrl: null,
          message:
            res.message || "Payment has not been completed or verified yet.",
        });
        toast.warn(
          "Payment unverified. The WhatsApp group link remains locked.",
        );
      }
    } catch (err) {
      setVerifyState({
        loading: false,
        verified: false,
        student: null,
        whatsappUrl: null,
        message: err.message || "Unable to verify payment reference.",
      });
      toast.error(err.message || "Verification request failed.");
    } finally {
      setManualLoading(false);
    }
  };

  const handleCopyReference = () => {
    if (!referenceCode) return;
    navigator.clipboard?.writeText(referenceCode);
    setCopied(true);
    toast.success("Payment reference copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!verifyState.whatsappUrl) return;
    navigator.clipboard?.writeText(verifyState.whatsappUrl);
    setLinkCopied(true);
    toast.success("WhatsApp group invite link copied to clipboard!");
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
            <p className="flow-kicker">ADMISSION STATUS &amp; VERIFICATION</p>
            <h1 className="flow-title">
              {verifyState.verified ? (
                <>
                  Welcome to
                  <br />
                  <em>the cohort.</em>
                </>
              ) : (
                <>
                  Tuition
                  <br />
                  <em>Verification.</em>
                </>
              )}
            </h1>

            <p className="flow-copy">
              {verifyState.verified && verifyState.student?.name ? (
                <>
                  Congratulations, <strong>{verifyState.student.name}</strong>!
                  Your seat for{" "}
                  <strong>{verifyState.student.track || "Cohort 001"}</strong>{" "}
                  has been paid and confirmed.
                </>
              ) : verifyState.verified ? (
                "Your tuition payment was confirmed on Paystack and your admission is secured."
              ) : (
                "The private cohort WhatsApp group link is restricted exclusively to students whose Paystack tuition payment has been completed."
              )}
            </p>

            {referenceCode && (
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
            )}

            {verifyState.verified && (
              <div className="verification-badge is-verified">
                <MdVerified /> Verified on Paystack (GHS Paid)
              </div>
            )}

            {/* UNLOCKED: Visible ONLY to students who have paid */}
            {verifyState.verified && verifyState.whatsappUrl && (
              <div className="whatsapp-highlight-card">
                <div className="whatsapp-highlight-header">
                  <SiWhatsapp />
                  <strong>
                    Important Next Step: Join your Cohort WhatsApp Group
                  </strong>
                </div>
                <p>
                  Welcome aboard! Please click the button below to join your
                  private cohort WhatsApp group immediately. This is where your
                  instructors share the live Google Meet orientation link,
                  GitHub classroom invitations, syllabus modules, and daily
                  check-ins:
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <a
                    className="solid-button whatsapp-cta-btn"
                    href={verifyState.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      toast.info("Opening cohort WhatsApp group invite...")
                    }
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
            )}

            {/* LOCKED: If not paid or verification pending */}
            {!verifyState.verified && !verifyState.loading && (
              <div
                style={{
                  background: "#fffbeb",
                  border: "1.5px solid #fde68a",
                  borderRadius: "10px",
                  padding: "24px",
                  margin: "24px 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#92400e",
                    marginBottom: "10px",
                  }}
                >
                  <MdLock style={{ fontSize: "22px" }} />
                  <strong style={{ fontSize: "14px" }}>
                    Cohort WhatsApp Link is Locked
                  </strong>
                </div>
                <p
                  style={{
                    color: "#b45309",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    margin: "0 0 16px",
                  }}
                >
                  This invite link is reserved strictly for students who have
                  paid tuition. If you just finished payment via Paystack or
                  Mobile Money, enter your transaction reference below to verify
                  and unlock your access immediately:
                </p>
                <form
                  onSubmit={handleManualVerify}
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    value={manualRef}
                    onChange={(e) => setManualRef(e.target.value)}
                    placeholder="e.g. POI-1-XXXXXXXXXX"
                    style={{
                      flex: 1,
                      minWidth: "220px",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "13px",
                    }}
                  />
                  <button
                    className="solid-button"
                    type="submit"
                    disabled={manualLoading}
                    style={{ padding: "10px 18px", fontSize: "12px" }}
                  >
                    <MdRefresh />{" "}
                    {manualLoading ? "Verifying..." : "Verify & Unlock"}
                  </button>
                </form>
              </div>
            )}

            {verifyState.loading && (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "13px",
                }}
              >
                Checking Paystack payment status...
              </div>
            )}
          </section>

          <aside className="instruction-card">
            <h3>Onboarding Roadmap</h3>
            <ol className="steps">
              <li>
                <b>01</b>
                <span>
                  <strong>Join the Cohort WhatsApp channel</strong> once tuition
                  is verified to introduce yourself to peers and mentors.
                </span>
              </li>
              <li>
                <b>02</b>
                <span>
                  <strong>Live Orientation:</strong> Monday, 16 March at 18:00
                  GMT on Google Meet (link pinned in the WhatsApp group).
                </span>
              </li>
              <li>
                <b>03</b>
                <span>
                  <strong>Engineering Setup:</strong> Complete your local Git
                  and VS Code configuration before the first live build session.
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
