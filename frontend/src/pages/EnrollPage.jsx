import { useEffect, useState } from "react";
import { MdArrowBack, MdLock } from "react-icons/md";
import PublicHeader from "../components/PublicHeader";
import { initializePayment } from "../lib/api";
import "./PublicFlow.css";

function EnrollPage({ onNavigate }) {
  const [track, setTrack] = useState("foundations");
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
    const updateCountdown = () => {
      const difference = Math.max(
        new Date("2026-03-18T18:00:00+00:00") - new Date(),
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
  }, []);
  const updateField = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  const submitEnrollment = async (event) => {
    event.preventDefault();
    setCheckoutState({ loading: true, error: "" });
    try {
      const result = await initializePayment({
        ...form,
        cohort_slug: "cohort-001",
      });
      if (result.authorization_url)
        window.location.assign(result.authorization_url);
      else onNavigate("/enrollment/success");
    } catch (error) {
      setCheckoutState({ loading: false, error: error.message });
    }
  };
  const details =
    track === "foundations"
      ? {
          name: "Web Development Foundations",
          fee: "GH₵400",
          duration: "6 weeks",
          start: "18 March 2026",
        }
      : {
          name: "Full-Stack Development",
          fee: "GH₵650",
          duration: "8 weeks",
          start: "18 March 2026",
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
            <p className="flow-kicker">COHORT 001 / ADMISSIONS</p>
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
                  placeholder="Your name"
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
                  placeholder="you@example.com"
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
                  placeholder="+233 24 000 0000"
                  pattern="\\+233[0-9 ]{9,}"
                  required
                />
              </div>
              <div className="field">
                <label>Choose your track</label>
                <div className="radio-grid">
                  <label className="radio-option">
                    <input
                      type="radio"
                      checked={track === "foundations"}
                      onChange={() => setTrack("foundations")}
                    />{" "}
                    Web Development Foundations <span>GH₵400</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      checked={track === "fullstack"}
                      onChange={() => setTrack("fullstack")}
                    />{" "}
                    Full-Stack Development <span>GH₵650</span>
                  </label>
                </div>
              </div>
              <button
                className="solid-button pay-button"
                type="submit"
                disabled={checkoutState.loading}
              >
                <MdLock />{" "}
                {checkoutState.loading
                  ? "Starting secure checkout..."
                  : "Pay via Paystack"}
              </button>
              {checkoutState.error && (
                <p className="form-error" role="alert">
                  {checkoutState.error}
                </p>
              )}
              <p className="payment-note">
                Secure checkout · Mobile Money (MTN, Telecel, AT) · Card
              </p>
            </form>
          </section>
          <aside className="summary-card">
            <p>YOUR SELECTED TRACK</p>
            <h2>{details.name}</h2>
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
              <strong>{details.fee}</strong>
              <span>early-bird</span>
            </div>
            <ul className="summary-list">
              <li>
                <span>Duration</span>
                {details.duration}
              </li>
              <li>
                <span>Starts</span>
                {details.start}
              </li>
              <li>
                <span>Seats remaining</span>12
              </li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
export default EnrollPage;
