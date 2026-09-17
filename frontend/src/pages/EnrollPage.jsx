import { useEffect, useState } from "react";
import { MdArrowBack, MdErrorOutline, MdLock } from "react-icons/md";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { getPublicCohorts, initializePayment } from "../lib/api";
import "./PublicFlow.css";

function EnrollPage({ onNavigate }) {
  const requestedTrack = new URLSearchParams(window.location.search).get(
    "track",
  );
  const [cohorts, setCohorts] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    whatsapp_number: "",
  });
  const [checkoutState, setCheckoutState] = useState({
    loading: false,
    error: "",
  });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => {
    getPublicCohorts()
      .then((openCohorts) => {
        setCohorts(openCohorts);
        const requested = openCohorts.find((cohort) =>
          cohort.track.toLowerCase().includes(requestedTrack || ""),
        );
        setSelectedSlug(requested?.slug || openCohorts[0]?.slug || "");
      })
      .catch((error) =>
        setCheckoutState((current) => ({ ...current, error: error.message })),
      );
  }, [requestedTrack]);
  useEffect(() => {
    const updateCountdown = () => {
      const selected = cohorts.find((cohort) => cohort.slug === selectedSlug);
      const difference = Math.max(
        new Date(selected?.registration_end || Date.now()) - new Date(),
        0,
      );
      const totalMinutes = Math.floor(difference / 60000);
      setTimeLeft({
        days: Math.floor(totalMinutes / 1440),
        hours: Math.floor((totalMinutes % 1440) / 60),
        minutes: totalMinutes % 60,
      });
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 60000);
    return () => window.clearInterval(timer);
  }, [cohorts, selectedSlug]);
  const updateField = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  const submitEnrollment = async (event) => {
    event.preventDefault();
    setCheckoutState({ loading: true, error: "" });
    try {
      const callbackUrl = `${window.location.origin}/enrollment/success`;
      const result = await initializePayment({
        ...form,
        cohort_slug: selectedSlug,
        callback_url: callbackUrl,
      });
      if (result.reference) {
        sessionStorage.setItem("poietik_payment_ref", result.reference);
      }
      if (result.authorization_url) {
        window.location.assign(result.authorization_url);
      } else {
        onNavigate(`/enrollment/success?reference=${result.reference || ""}`);
      }
    } catch (error) {
      setCheckoutState({ loading: false, error: error.message });
    }
  };
  const details = cohorts.find((cohort) => cohort.slug === selectedSlug);
  const duration = details?.track.toLowerCase().includes("foundation")
    ? "6 weeks"
    : "8 weeks";
  const formatDate = (value) =>
    value
      ? new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(value))
      : "To be announced";
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
            <p className="flow-kicker">
              {details ? `${details.title} / ADMISSIONS` : "ADMISSIONS"}
            </p>
            <h1 className="flow-title">
              Reserve your
              <br />
              <em>seat.</em>
            </h1>
            <p className="flow-copy">
              You are one payment away from joining a focused room of builders.
              Complete your details and we will send your onboarding pack
              immediately.
            </p>
            <form className="form-card" onSubmit={submitEnrollment}>
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="full_name"
                  value={form.full_name}
                  onChange={updateField}
                  placeholder="e.g. Kwame Mensah"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  type="email"
                  placeholder="e.g. kwame@example.com"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="phone">WhatsApp mobile number</label>
                <input
                  id="phone"
                  name="whatsapp_number"
                  value={form.whatsapp_number}
                  onChange={updateField}
                  placeholder="+233 24 000 0000 or 024 000 0000"
                  pattern="^(\+?233|0)[0-9\s-]{8,14}$"
                  title="Please enter a valid phone number (e.g. +233 24 123 4567 or 024 123 4567)"
                  required
                />
                <small className="field-hint">
                  Accepts MTN MoMo, Telecel Cash, and AT Money numbers
                </small>
              </div>
              <div className="field">
                <label>Choose your track</label>
                <div className="radio-grid">
                  {cohorts.map((cohort) => {
                    const isSelected = selectedSlug === cohort.slug;
                    return (
                      <label
                        className={`radio-option ${isSelected ? "is-selected" : ""}`}
                        key={cohort.slug}
                      >
                        <input
                          type="radio"
                          name="cohort_track"
                          value={cohort.slug}
                          checked={isSelected}
                          onChange={() => setSelectedSlug(cohort.slug)}
                        />
                        <div className="radio-content">
                          <strong className="track-title">
                            {cohort.track}
                          </strong>
                          <span className="track-duration">
                            {cohort.track.toLowerCase().includes("foundation")
                              ? "6-Week Intensive"
                              : "8-Week Intensive"}
                          </span>
                        </div>
                        <span className="radio-fee">
                          GH₵{cohort.early_bird_fee || cohort.fee}
                        </span>
                      </label>
                    );
                  })}
                  {cohorts.length === 0 && (
                    <div className="loading-cohorts">
                      <span>Loading available tracks...</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="solid-button pay-button"
                type="submit"
                disabled={checkoutState.loading || !details}
              >
                <MdLock />{" "}
                {checkoutState.loading
                  ? "Starting secure checkout..."
                  : "Pay via Paystack"}
              </button>
              {checkoutState.error && (
                <div className="form-error" role="alert">
                  <MdErrorOutline />
                  <span>{checkoutState.error}</span>
                </div>
              )}
              <p className="payment-note">
                Secure checkout · Mobile Money (MTN, Telecel, AT) · Visa /
                Mastercard
              </p>
            </form>
          </section>
          <aside className="summary-card">
            <p>YOUR SELECTED TRACK</p>
            <h2>{details?.track || "Open cohort"}</h2>
            <div className="countdown">
              <span>
                <strong>{timeLeft.days}</strong> days
              </span>
              <span>
                <strong>{timeLeft.hours}</strong> hrs
              </span>
              <span>
                <strong>{timeLeft.minutes}</strong> min
              </span>
            </div>
            <div className="summary-fee">
              <strong>
                {details ? `GH₵${details.early_bird_fee}` : "Tuition"}
              </strong>
              <span>early-bird</span>
            </div>
            <ul className="summary-list">
              <li>
                <span>Duration</span>
                {duration}
              </li>
              <li>
                <span>Starts</span>
                {formatDate(details?.registration_start)}
              </li>
              <li>
                <span>Seats remaining</span>12
              </li>
            </ul>
          </aside>
        </div>
      </main>
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}
export default EnrollPage;
