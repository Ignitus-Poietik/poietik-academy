import { useState } from "react";
import { MdAdd, MdContentCopy, MdMoreVert, MdSave } from "react-icons/md";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./AdminPages.css";

function AdminCohorts() {
  const [active, setActive] = useState(true);
  return (
    <AdminFrame>
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">ADMIN CONSOLE</p>
          <h1>Cohort Configuration</h1>
          <p>
            Shape the public intake experience and keep every cohort link in one
            place.
          </p>
        </div>
        <button className="admin-primary">
          <MdAdd /> New cohort
        </button>
      </div>
      <div className="admin-builder-grid">
        <section className="builder-card">
          <div className="card-heading">
            <div>
              <span>COHORT DETAILS</span>
              <h2>Link builder</h2>
            </div>
            <span className={`status-pill ${active ? "active" : "draft"}`}>
              {active ? "Active" : "Draft"}
            </span>
          </div>
          <div className="admin-form-grid">
            <label className="admin-field wide">
              <span>Cohort title</span>
              <input defaultValue="Cohort 001 / Early-Bird Alpha" />
            </label>
            <label className="admin-field">
              <span>Track name</span>
              <select defaultValue="Web Development Foundations">
                <option>Web Development Foundations</option>
                <option>Full-Stack Development</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Fee (GH₵)</span>
              <input defaultValue="400" type="number" />
            </label>
            <label className="admin-field">
              <span>Registration starts</span>
              <input defaultValue="2026-02-20" type="date" />
            </label>
            <label className="admin-field">
              <span>Registration ends</span>
              <input defaultValue="2026-03-16" type="date" />
            </label>
          </div>
          <label className="toggle-row">
            <span>
              <strong>Early-bird discount</strong>
              <small>Show the discounted fee on the public page.</small>
            </span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="admin-field">
            <span>Course syllabus</span>
            <textarea
              defaultValue={
                "## Week 1 — The builder workflow\n- Git, GitHub, and project setup\n- Semantic HTML and accessible structure\n\n## Week 2 — Styling systems\n- CSS layout, responsive interfaces, and review"
              }
            />
          </label>
          <div className="generated-link">
            <div>
              <span>PUBLIC ENROLMENT LINK</span>
              <strong>poietik.academy/enroll/cohort-001</strong>
            </div>
            <button>
              <MdContentCopy /> Copy link
            </button>
          </div>
          <button className="save-button">
            <MdSave /> Save cohort configuration
          </button>
        </section>
        <section className="builder-card preview-card">
          <span className="admin-kicker">PUBLIC PREVIEW</span>
          <h2>What applicants see</h2>
          <div className="preview-window">
            <p>COHORT 001 / ADMISSIONS</p>
            <h3>
              Web Development
              <br />
              <em>Foundations.</em>
            </h3>
            <strong>
              GH₵400 <small>early-bird</small>
            </strong>
            <span>6 weeks · starts 18 March 2026</span>
            <button>Reserve your seat</button>
          </div>
          <label className="toggle-row">
            <span>
              <strong>Registration status</strong>
              <small>Visible on the public enrolment page.</small>
            </span>
            <button
              className={`switch ${active ? "on" : ""}`}
              type="button"
              onClick={() => setActive(!active)}
            >
              <span />
            </button>
          </label>
        </section>
      </div>
      <section className="table-card">
        <div className="card-heading">
          <div>
            <span>MANAGED COHORTS</span>
            <h2>Active intake links</h2>
          </div>
          <button className="text-button">View archived</button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Track</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Active link</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Cohort 001 / Early-Bird Alpha</strong>
                  <small>Registration ends 16 Mar 2026</small>
                </td>
                <td>Web Foundations</td>
                <td>GH₵400</td>
                <td>
                  <span className="status-pill active">Active</span>
                </td>
                <td>poietik.academy/enroll/cohort-001</td>
                <td>
                  <button className="icon-button">
                    <MdMoreVert />
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Cohort 001 / Full-Stack</strong>
                  <small>Registration ends 16 Mar 2026</small>
                </td>
                <td>Full-Stack Dev</td>
                <td>GH₵650</td>
                <td>
                  <span className="status-pill draft">Draft</span>
                </td>
                <td>Not published</td>
                <td>
                  <button className="icon-button">
                    <MdMoreVert />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </AdminFrame>
  );
}

function AdminFrame({ children }) {
  return (
    <div className="admin-shell">
      <Sidebar />
      <main className="admin-main">
        <Topbar />
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
export default AdminCohorts;
