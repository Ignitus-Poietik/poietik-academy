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
import "./LandingPage.css";

function LandingPage({ onNavigate }) {
  const reveal = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };
  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18, delayChildren: 0.12 } },
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
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.15, delay: 0.45, ease: "easeOut" }}
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <motion.div
              className="code-window"
              animate={{ y: [0, -8, 0], rotate: [-4, -3, -4] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
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
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="track-number">01 / FOUNDATION</div>
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
                <span>GH₵400 EARLY-BIRD</span>
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
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="track-number">02 / ADVANCED</div>
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
                <span>GH₵650 EARLY-BIRD</span>
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
              whileHover={{ y: -5, borderColor: "#ff5a19" }}
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
              whileHover={{ y: -5, borderColor: "#ff5a19" }}
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
              whileHover={{ y: -5, borderColor: "#ff5a19" }}
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
          <p className="section-kicker">COHORT 001 / ACCRA</p>
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
      <footer className="public-footer">
        <span>© 2026 Ignitus Poietik</span>
        <span>Engineering education for the builders ahead.</span>
        <div>
          <a href="mailto:hello@poietik.academy">Contact</a>
          <a href="#">WhatsApp</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;
