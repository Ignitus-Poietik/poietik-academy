import { MdArrowBack, MdCheckCircle, MdChat } from "react-icons/md";
import PublicHeader from "../components/PublicHeader";
import "./PublicFlow.css";

function SuccessPage({ onNavigate }) {
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
            <p className="flow-kicker">PAYMENT CONFIRMED</p>
            <h1 className="flow-title">
              Welcome to
              <br />
              <em>the cohort.</em>
            </h1>
            <p className="flow-copy">
              Your seat is confirmed. Keep this page close while you complete
              the final onboarding steps below.
            </p>
            <span className="reference">PSK-POI-001-2026-0318</span>
            <button className="solid-button" type="button">
              <MdChat /> Join Cohort WhatsApp Group
            </button>
          </section>
          <aside className="instruction-card">
            <h3>Next steps</h3>
            <ol className="steps">
              <li>
                <b>01</b>
                <span>
                  Join the cohort WhatsApp group for announcements and daily
                  check-ins.
                </span>
              </li>
              <li>
                <b>02</b>
                <span>
                  Orientation is scheduled for{" "}
                  <strong>Monday, 16 March at 18:00 GMT</strong> on Google Meet.
                </span>
              </li>
              <li>
                <b>03</b>
                <span>
                  Watch your inbox for the GitHub organization invite and
                  starter repository.
                </span>
              </li>
            </ol>
          </aside>
        </div>
      </main>
    </div>
  );
}
export default SuccessPage;
