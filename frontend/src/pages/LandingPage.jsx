import { useEffect, useState } from "react";
import {
  MdArrowForward,
  MdCheck,
  MdCode,
  MdCloudUpload,
  MdGroups,
  MdTerminal,
} from "react-icons/md";
import { motion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { getPublicCohorts } from "../lib/api";
import "./LandingPage.css";

function LandingPage({ onNavigate }) {
  const [activeCohort, setActiveCohort] = useState(null);

  useEffect(() => {
    let ignore = false;
    getPublicCohorts()
      .then((cohorts) => {
        if (!ignore && cohorts && cohorts.length > 0) {
          setActiveCohort(cohorts[0]);
        }
      })
      .catch(() => {
        // Keep fallback
      });

    return () => {
      ignore = true;
    };
  }, []);

  const reveal = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };
  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.14, delayChildren: 0.08 } },
  };
  return (
    <div className="public-page">
      <PublicHeader onNavigate={onNavigate} />
      <main>
        <section className="landing-hero">
          <motion.div
            className="hero-copy"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.p className="hero-kicker" variants={reveal}>
              IGNITUS POIETIK / ENGINEERING ACADEMY
            </motion.p>
            <motion.h1 variants={reveal}>
              Forge production-grade <em>engineering skills.</em>
            </motion.h1>
            <motion.p className="hero-lead" variants={reveal}>
              A focused, hands-on academy for builders in Ghana. Learn the
              tools, habits, and judgement that ship software people can rely
              on.
            </motion.p>
            <motion.div className="hero-actions" variants={reveal}>
              <button
                className="solid-button"
                type="button"
                onClick={() => onNavigate("/enroll")}
              >
                View open tracks <MdArrowForward />
              </button>
              <a href="#pedagogy">How we teach</a>
            </motion.div>
          </motion.div>
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.85,
              delay: 0.25,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <motion.div
              className="orbit orbit-one"
              animate={{ rotate: [-22, -18, -22] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="orbit orbit-two"
              animate={{ rotate: [38, 42, 38] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="code-window"
              animate={{ y: [0, -6, 0], rotate: [-4, -3, -4] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="window-bar">
                <span />
                <span />
                <span />
                <small>cohort-001 / ship.js</small>
              </div>
              <pre>
                <code>
                  <b>const</b> <i>builder</i> = {"{"}
                  <br /> craft: <strong>true</strong>,<br /> review:{" "}
                  <strong>true</strong>,<br /> ship: <strong>"to-prod"</strong>
                  <br />
                  {"}"};
                </code>
              </pre>
              <div className="window-footer">
                <span>● live environment</span>
                <strong>READY</strong>
              </div>
            </motion.div>
            <motion.div
              className="hero-tile"
              initial={{ opacity: 0, x: 18, rotate: 5 }}
              animate={{ opacity: 1, x: 0, rotate: 5 }}
              transition={{
                delay: 0.5,
                duration: 0.65,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <MdTerminal />
              <span>
                Build systems.
                <br />
                Think clearly.
              </span>
            </motion.div>
          </motion.div>
        </section>
        <section className="trust-strip">
          <span>BUILT FOR AMBITIOUS GHANAIAN DEVELOPERS</span>
          <span>6-8 WEEK INTENSIVES</span>
          <span>SMALL COHORTS / HIGH SIGNAL</span>
        </section>
        <section className="tracks-section" id="tracks">
          <div className="section-heading">
            <div>
              <p className="section-kicker">THE CURRICULUM</p>
              <h2>
                Choose your <em>starting line.</em>
              </h2>
            </div>
            <p>
              Two practical tracks. One standard: you leave with work you can
              show.
            </p>
          </div>
          <motion.div
            className="track-cards"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.article
              className="track-card orange-track"
              variants={reveal}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <MdCode />
              <h3>
                Web Development
                <br />
                <em>Foundations</em>
              </h3>
              <p>
                Build a sturdy frontend foundation and learn the workflow behind
                every good web product.
              </p>
              <div className="track-tags">
                <span>6 WEEKS</span>
                <span>PROJECT-BASED</span>
              </div>
              <ul>
                <li>
                  <MdCheck /> HTML, CSS &amp; JavaScript
                </li>
                <li>
                  <MdCheck /> Git &amp; collaborative workflow
                </li>
                <li>
                  <MdCheck /> Your first deployed product
                </li>
              </ul>
              <button
                type="button"
                onClick={() => onNavigate("/enroll?track=foundations")}
              >
                Explore track <MdArrowForward />
              </button>
            </motion.article>
            <motion.article
              className="track-card dark-track"
              variants={reveal}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <MdTerminal />
              <h3>
                Full-Stack
                <br />
                <em>Development</em>
              </h3>
              <p>
                Turn ideas into dependable systems with APIs, databases,
                interfaces, and deployment.
              </p>
              <div className="track-tags">
                <span>8 WEEKS</span>
                <span>PRODUCTION WORKFLOW</span>
              </div>
              <ul>
                <li>
                  <MdCheck /> Django REST &amp; React
                </li>
                <li>
                  <MdCheck /> PostgreSQL &amp; Docker
                </li>
                <li>
                  <MdCheck /> Production deployment
                </li>
              </ul>
              <button
                type="button"
                onClick={() => onNavigate("/enroll?track=fullstack")}
              >
                Explore track <MdArrowForward />
              </button>
            </motion.article>
          </motion.div>
        </section>
        <section className="pillars-section" id="pedagogy">
          <div className="section-heading">
            <div>
              <p className="section-kicker">THE POIETIK STANDARD</p>
              <h2>
                Less watching.
                <br />
                <em>More becoming.</em>
              </h2>
            </div>
            <p>
              We built the classroom around the parts of engineering that
              tutorials skip.
            </p>
          </div>
          <motion.div
            className="pillar-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.article
              variants={reveal}
              whileHover={{ y: -4, borderColor: "#ff5a19" }}
              transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <MdGroups />
              <span>01</span>
              <h3>Direct PR reviews</h3>
              <p>
                Get thoughtful, 1-on-1 feedback on the code you actually wrote.
              </p>
            </motion.article>
            <motion.article
              variants={reveal}
              whileHover={{ y: -4, borderColor: "#ff5a19" }}
              transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <MdCloudUpload />
              <span>02</span>
              <h3>Ship to production</h3>
              <p>
                Deploy real projects and learn what happens after the localhost
                screen.
              </p>
            </motion.article>
            <motion.article
              variants={reveal}
              whileHover={{ y: -4, borderColor: "#ff5a19" }}
              transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <MdTerminal />
              <span>03</span>
              <h3>No tutorial clones</h3>
              <p>
                Make decisions, solve constraints, and leave with work that is
                yours.
              </p>
            </motion.article>
          </motion.div>
        </section>
        <section className="landing-cta" id="cohorts">
          <p className="section-kicker">
            {activeCohort
              ? `${activeCohort.title.toUpperCase()}`
              : "COHORT 001"}
          </p>
          <h2>
            Your next chapter
            <br />
            <em>starts here.</em>
          </h2>
          <button
            className="solid-button"
            type="button"
            onClick={() => onNavigate("/enroll")}
          >
            Apply for admission <MdArrowForward />
          </button>
        </section>
      </main>
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}
export default LandingPage;
