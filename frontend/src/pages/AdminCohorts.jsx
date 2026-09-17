import { useEffect, useState } from "react";
import {
  MdAdd,
  MdCheck,
  MdContentCopy,
  MdDelete,
  MdEdit,
  MdSave,
  MdTimerOff,
} from "react-icons/md";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  deleteAdminCohort,
  getAdminCohorts,
  saveAdminCohort,
} from "../lib/api";
import "./AdminPages.css";

const defaultCohortForm = {
  id: null,
  title: "Cohort 001 — Web Foundations",
  track: "Web Development Foundations",
  slug: "foundations",
  max_capacity: 50,
  enrolled_count: 0,
  remaining_seats: 50,
  is_full: false,
  base_fee: 600,
  early_bird_fee: 400,
  registration_start: "2026-02-20",
  registration_end: "2026-03-16",
  status: "active",
  syllabus:
    "## Week 1 — The builder workflow\n- Git, GitHub, and project setup\n- Semantic HTML and accessible structure\n\n## Week 2 — Styling systems\n- CSS layout, responsive interfaces, and review",
  whatsapp_url: "https://chat.whatsapp.com/EQCSUbUfF555mJtbhk5uoT",
};

function AdminCohorts({ onNavigate, currentPath }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState(defaultCohortForm);

  useEffect(() => {
    let ignore = false;
    getAdminCohorts()
      .then((data) => {
        if (!ignore && data && data.length > 0) {
          setCohorts(data);
          const first = data[0];
          setForm({
            id: first.id,
            title: first.title,
            track: first.track,
            slug: first.slug,
            max_capacity: Number(first.max_capacity) || 50,
            enrolled_count: Number(first.enrolled_count) || 0,
            remaining_seats: first.remaining_seats ?? 50,
            is_full: Boolean(first.is_full),
            base_fee: Number(first.base_fee) || 600,
            early_bird_fee: Number(first.early_bird_fee) || 400,
            registration_start: first.registration_start
              ? first.registration_start.slice(0, 10)
              : "2026-02-20",
            registration_end: first.registration_end
              ? first.registration_end.slice(0, 10)
              : "2026-03-16",
            status: first.status || "active",
            syllabus: first.syllabus || defaultCohortForm.syllabus,
            whatsapp_url: first.whatsapp_url || defaultCohortForm.whatsapp_url,
          });
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load cohorts from server.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectCohort = (item) => {
    setForm({
      id: item.id,
      title: item.title,
      track: item.track,
      slug: item.slug,
      max_capacity: Number(item.max_capacity) || 50,
      enrolled_count: Number(item.enrolled_count) || 0,
      remaining_seats: item.remaining_seats ?? 50,
      is_full: Boolean(item.is_full),
      base_fee: Number(item.base_fee) || 600,
      early_bird_fee: Number(item.early_bird_fee) || 400,
      registration_start: item.registration_start
        ? item.registration_start.slice(0, 10)
        : "2026-02-20",
      registration_end: item.registration_end
        ? item.registration_end.slice(0, 10)
        : "2026-03-16",
      status: item.status || "active",
      syllabus: item.syllabus || defaultCohortForm.syllabus,
      whatsapp_url: item.whatsapp_url || defaultCohortForm.whatsapp_url,
    });
    toast.info(`Editing: ${item.title}`);
  };

  const handleNewCohort = () => {
    setForm({
      id: null,
      title: "Cohort 002 — Full-Stack Engineering",
      track: "Full-Stack Development",
      slug: "fullstack-002",
      max_capacity: 50,
      enrolled_count: 0,
      remaining_seats: 50,
      is_full: false,
      base_fee: 850,
      early_bird_fee: 650,
      registration_start: new Date().toISOString().slice(0, 10),
      registration_end: new Date(Date.now() + 60 * 86400000)
        .toISOString()
        .slice(0, 10),
      status: "active",
      syllabus: "Full-Stack engineering curriculum with Django REST and React.",
      whatsapp_url: "https://chat.whatsapp.com/EQCSUbUfF555mJtbhk5uoT",
    });
    toast.info("Created template for a new cohort admission.");
  };

  const handleIncreaseCapacity = (delta) => {
    setForm((prev) => {
      const current = Number(prev.max_capacity) || 50;
      const updated = Math.max(1, current + delta);
      toast.info(`Capacity cap adjusted to ${updated} seats.`);
      return { ...prev, max_capacity: updated };
    });
  };

  const handleQuickIncreaseInTable = async (e, cohort, delta) => {
    e.stopPropagation();
    try {
      const newCap = (Number(cohort.max_capacity) || 50) + delta;
      await saveAdminCohort({ ...cohort, max_capacity: newCap });
      toast.success(`Increased ${cohort.title} cap to ${newCap} seats.`);
      const refreshed = await getAdminCohorts();
      setCohorts(refreshed);
      if (form.id === cohort.id) {
        setForm((prev) => ({
          ...prev,
          max_capacity: newCap,
          remaining_seats: Math.max(0, newCap - (prev.enrolled_count || 0)),
          is_full: (prev.enrolled_count || 0) >= newCap,
        }));
      }
    } catch (err) {
      toast.error(err.message || "Failed to update capacity.");
    }
  };

  const handleEndEarlyBird = () => {
    setForm((prev) => ({
      ...prev,
      early_bird_fee: prev.base_fee,
    }));
    toast.info(
      `Early-bird closed. Rate updated to standard tuition (GH₵${form.base_fee}). Click Save to apply.`,
    );
  };

  const handleDeleteCohort = async (cohortId, cohortTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the admission cohort "${cohortTitle}"? This will permanently delete this cohort admission.`,
      )
    ) {
      return;
    }
    try {
      await deleteAdminCohort(cohortId);
      toast.success(`Admission cohort "${cohortTitle}" deleted successfully.`);
      const refreshed = await getAdminCohorts();
      setCohorts(refreshed);
      if (form.id === cohortId) {
        if (refreshed.length > 0) {
          handleSelectCohort(refreshed[0]);
        } else {
          handleNewCohort();
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete cohort.");
    }
  };

  const validateCohortForm = () => {
    if (!form.title || form.title.trim().length < 3) {
      toast.error("Cohort title must be at least 3 characters long.");
      return false;
    }
    if (!form.track || form.track.trim().length < 3) {
      toast.error("Track name must be at least 3 characters long.");
      return false;
    }
    const cap = Number(form.max_capacity);
    if (isNaN(cap) || cap < 1 || !Number.isInteger(cap)) {
      toast.error(
        "Student capacity cap must be a whole number of at least 1 seat.",
      );
      return false;
    }
    if (form.id && form.enrolled_count && cap < form.enrolled_count) {
      toast.error(
        `Capacity cap (${cap}) cannot be lower than currently enrolled students (${form.enrolled_count}). Increase the cap to at least ${form.enrolled_count}.`,
      );
      return false;
    }
    if (Number(form.base_fee) < 0 || isNaN(Number(form.base_fee))) {
      toast.error("Standard tuition fee cannot be negative.");
      return false;
    }
    if (Number(form.early_bird_fee) < 0 || isNaN(Number(form.early_bird_fee))) {
      toast.error("Early-bird tuition fee cannot be negative.");
      return false;
    }
    if (form.registration_start && form.registration_end) {
      if (new Date(form.registration_end) < new Date(form.registration_start)) {
        toast.error("Registration deadline cannot be earlier than start date.");
        return false;
      }
    }
    if (form.whatsapp_url && form.whatsapp_url.trim()) {
      try {
        const parsed = new URL(form.whatsapp_url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          toast.error("WhatsApp invitation link must start with https://");
          return false;
        }
      } catch {
        toast.error("Please enter a valid WhatsApp invitation URL.");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateCohortForm()) {
      return;
    }
    setSaving(true);
    try {
      const saved = await saveAdminCohort(form);
      toast.success(`Cohort "${saved.title}" saved successfully!`);
      const refreshed = await getAdminCohorts();
      setCohorts(refreshed);
      setForm((prev) => ({
        ...prev,
        id: saved.id,
        max_capacity: saved.max_capacity || prev.max_capacity,
        enrolled_count: saved.enrolled_count ?? prev.enrolled_count,
        remaining_seats: saved.remaining_seats ?? prev.remaining_seats,
        is_full: saved.is_full ?? prev.is_full,
      }));
    } catch (err) {
      toast.error(err.message || "Failed to save cohort configuration.");
    } finally {
      setSaving(false);
    }
  };

  const publicEnrollLink = `${window.location.origin}/enroll?track=${form.slug || "foundations"}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(publicEnrollLink);
    setCopied(true);
    toast.success("Enrolment link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isEarlyBirdEnded = Number(form.early_bird_fee) >= Number(form.base_fee);

  return (
    <div className="admin-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={onNavigate}
        currentPath={currentPath}
      />
      <main className="admin-main">
        <Topbar onMenu={() => setSidebarOpen(true)} onNavigate={onNavigate} />
        <div className="admin-content">
          <div className="admin-page-heading">
            <div>
              <p className="admin-kicker">ADMISSIONS &amp; CURRICULUM</p>
              <h1>Manage Cohort Admissions</h1>
              <p>
                Configure intake schedules, tuition fees, gated WhatsApp links,
                and early-bird deadlines.
              </p>
            </div>
            <div>
              <button
                className="outline-button"
                type="button"
                onClick={handleNewCohort}
              >
                <MdAdd /> New Cohort Intake
              </button>
            </div>
          </div>

          <div className="admin-builder-grid">
            <section className="builder-card">
              <div className="card-heading">
                <div>
                  <span>INTAKE CONFIGURATION</span>
                  <h2>
                    {form.id ? `Edit ${form.title}` : "New Cohort Intake"}
                  </h2>
                </div>
                <span
                  className={`status-pill ${form.status === "active" ? "active" : "draft"}`}
                >
                  {form.status === "active"
                    ? "Publicly Active"
                    : "Draft (Hidden)"}
                </span>
              </div>

              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>Cohort Title</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Cohort 001 — Web Foundations"
                    required
                  />
                </label>

                <label className="admin-field">
                  <span>Track Name</span>
                  <input
                    name="track"
                    value={form.track}
                    onChange={handleChange}
                    placeholder="e.g. Web Development Foundations"
                    required
                  />
                </label>

                <label className="admin-field">
                  <span>URL Slug</span>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="e.g. foundations"
                  />
                </label>

                <label className="admin-field">
                  <span>Standard Tuition Fee (GH₵)</span>
                  <input
                    name="base_fee"
                    type="number"
                    value={form.base_fee}
                    onChange={handleChange}
                  />
                </label>

                <label className="admin-field">
                  <span>Current Registration Fee / Early-Bird (GH₵)</span>
                  <input
                    name="early_bird_fee"
                    type="number"
                    value={form.early_bird_fee}
                    onChange={handleChange}
                  />
                  {!isEarlyBirdEnded ? (
                    <button
                      type="button"
                      onClick={handleEndEarlyBird}
                      className="outline-button"
                      style={{
                        marginTop: "6px",
                        fontSize: "10px",
                        padding: "4px 8px",
                      }}
                      title="End early-bird discount and set current fee to standard fee"
                    >
                      <MdTimerOff /> Early-Bird Period Over? Apply Standard GH₵
                      {form.base_fee}
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#16a34a",
                        fontWeight: "600",
                        marginTop: "4px",
                      }}
                    >
                      ● Standard tuition rate active (early-bird period ended)
                    </span>
                  )}
                </label>

                <label className="admin-field">
                  <span>Registration Starts</span>
                  <input
                    name="registration_start"
                    type="date"
                    value={form.registration_start}
                    onChange={handleChange}
                  />
                </label>

                <label className="admin-field">
                  <span>Registration Deadline</span>
                  <input
                    name="registration_end"
                    type="date"
                    value={form.registration_end}
                    onChange={handleChange}
                  />
                </label>

                <div className="admin-field">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <strong>Student Capacity Cap (Seats)</strong>
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: form.is_full ? "#dc2626" : "#16a34a",
                        fontWeight: "600",
                      }}
                    >
                      {form.enrolled_count || 0} enrolled /{" "}
                      {form.max_capacity || 50} cap
                      {form.is_full
                        ? " (Full)"
                        : ` (${Math.max(0, (form.max_capacity || 50) - (form.enrolled_count || 0))} left)`}
                    </span>
                  </div>
                  <input
                    name="max_capacity"
                    type="number"
                    min="1"
                    max="10000"
                    value={form.max_capacity}
                    onChange={handleChange}
                    required
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginTop: "6px",
                      alignItems: "center",
                    }}
                  >
                    <small style={{ fontSize: "10px", color: "#64748b" }}>
                      Quick expand:
                    </small>
                    <button
                      type="button"
                      className="outline-button"
                      style={{ fontSize: "10px", padding: "2px 7px" }}
                      onClick={() => handleIncreaseCapacity(5)}
                      title="Increase capacity cap by 5 seats"
                    >
                      +5 seats
                    </button>
                    <button
                      type="button"
                      className="outline-button"
                      style={{ fontSize: "10px", padding: "2px 7px" }}
                      onClick={() => handleIncreaseCapacity(10)}
                      title="Increase capacity cap by 10 seats"
                    >
                      +10 seats
                    </button>
                    <button
                      type="button"
                      className="outline-button"
                      style={{ fontSize: "10px", padding: "2px 7px" }}
                      onClick={() => handleIncreaseCapacity(25)}
                      title="Increase capacity cap by 25 seats"
                    >
                      +25 seats
                    </button>
                  </div>
                </div>

                <label className="admin-field wide">
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <SiWhatsapp style={{ color: "#16a34a" }} />
                    <strong>Cohort WhatsApp Group Invite Link</strong> (Visible
                    only to students who have paid)
                  </span>
                  <input
                    name="whatsapp_url"
                    type="url"
                    value={form.whatsapp_url}
                    onChange={handleChange}
                    placeholder="https://chat.whatsapp.com/EQCSUbUfF555mJtbhk5uoT"
                    required
                  />
                  <small style={{ color: "#728391", fontSize: "11px" }}>
                    🛡️ Security: This link is encrypted and protected. It is
                    never exposed publicly and is strictly unlocked on the
                    confirmation page after Paystack tuition payment is
                    verified.
                  </small>
                </label>
              </div>

              <label className="toggle-row" style={{ marginTop: "16px" }}>
                <span>
                  <strong>Open for Public Admission</strong>
                  <small>
                    When active, prospective students can select this track and
                    complete Paystack enrollment.
                  </small>
                </span>
                <input
                  type="checkbox"
                  name="status"
                  checked={form.status === "active"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.checked ? "active" : "draft",
                    }))
                  }
                />
              </label>

              <label className="admin-field" style={{ marginTop: "14px" }}>
                <span>Course Syllabus &amp; Key Modules</span>
                <textarea
                  name="syllabus"
                  value={form.syllabus}
                  onChange={handleChange}
                  rows={4}
                />
              </label>

              <div className="generated-link">
                <div>
                  <span>PUBLIC ENROLMENT LINK</span>
                  <strong>{publicEnrollLink}</strong>
                </div>
                <button type="button" onClick={handleCopyLink}>
                  {copied ? <MdCheck /> : <MdContentCopy />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                <button
                  className={`save-button ${saving ? "is-saved" : ""}`}
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{ flex: 1 }}
                >
                  {saving ? <MdCheck /> : <MdSave />}
                  {saving
                    ? "Saving configuration..."
                    : "Save Cohort Configuration"}
                </button>

                {form.id && (
                  <button
                    type="button"
                    className="outline-button"
                    style={{
                      color: "#dc2626",
                      borderColor: "#fca5a5",
                      background: "#fff5f5",
                    }}
                    onClick={() => handleDeleteCohort(form.id, form.title)}
                    title="Delete this admission intake"
                  >
                    <MdDelete /> Delete Admission
                  </button>
                )}
              </div>
            </section>

            <section className="builder-card preview-card">
              <span className="admin-kicker">APPLICANT PREVIEW</span>
              <h2>What Applicants See</h2>
              <div className="preview-window">
                <p>{form.title.toUpperCase()} / ADMISSIONS</p>
                <h3>
                  {form.track}
                  <br />
                  <em>Intensive.</em>
                </h3>
                <strong>
                  GH₵{form.early_bird_fee}{" "}
                  <small>
                    {isEarlyBirdEnded ? "standard tuition" : "early-bird"}
                  </small>
                </strong>
                <span>
                  Starts:{" "}
                  {form.registration_start
                    ? new Date(form.registration_start).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" },
                      )
                    : "Upcoming"}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: form.is_full ? "#dc2626" : "#475569",
                  }}
                >
                  Capacity:{" "}
                  <strong>
                    {form.enrolled_count || 0} / {form.max_capacity || 50}
                  </strong>{" "}
                  seats filled
                  {form.is_full
                    ? " (Admissions Full)"
                    : ` (${Math.max(0, (form.max_capacity || 50) - (form.enrolled_count || 0))} remaining)`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate && onNavigate(`/enroll?track=${form.slug}`)
                  }
                >
                  Reserve your seat
                </button>
              </div>

              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "8px",
                  padding: "14px",
                  marginTop: "16px",
                  fontSize: "11px",
                }}
              >
                <strong
                  style={{
                    color: "#15803d",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <SiWhatsapp /> Post-Payment Access
                </strong>
                <p style={{ color: "#166534", margin: "6px 0 0" }}>
                  Students who successfully pay GH₵{form.early_bird_fee} will
                  receive their access token and unlock:
                  <br />
                  <code
                    style={{
                      background: "#dcfce7",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {form.whatsapp_url || "Not configured"}
                  </code>
                </p>
              </div>
            </section>
          </div>

          <section className="table-card">
            <div className="card-heading">
              <div>
                <span>MANAGED COHORTS ({cohorts.length})</span>
                <h2>Active Intake Admissions</h2>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cohort / Track</th>
                    <th>Capacity &amp; Seats</th>
                    <th>Current Fee</th>
                    <th>Standard Fee</th>
                    <th>Status</th>
                    <th>WhatsApp Link</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((item) => {
                    const isSelected =
                      form.id === item.id || form.slug === item.slug;
                    const itemEarlyEnded =
                      Number(item.early_bird_fee) >= Number(item.base_fee);

                    return (
                      <tr
                        key={item.id || item.slug}
                        style={{
                          background: isSelected ? "#fffaf4" : undefined,
                          cursor: "pointer",
                        }}
                        onClick={() => handleSelectCohort(item)}
                      >
                        <td>
                          <strong>{item.title}</strong>
                          <small>
                            {item.track} · Deadline:{" "}
                            {item.registration_end
                              ? new Date(
                                  item.registration_end,
                                ).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "TBA"}
                          </small>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <strong>
                              {item.enrolled_count || 0} /{" "}
                              {item.max_capacity || 50}
                            </strong>
                            {item.is_full ? (
                              <span
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: "#fee2e2",
                                  color: "#b91c1c",
                                  fontWeight: "700",
                                }}
                              >
                                Full
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: "#dcfce7",
                                  color: "#15803d",
                                  fontWeight: "600",
                                }}
                              >
                                {item.remaining_seats ??
                                  Math.max(
                                    0,
                                    (item.max_capacity || 50) -
                                      (item.enrolled_count || 0),
                                  )}{" "}
                                left
                              </span>
                            )}
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            <button
                              type="button"
                              className="outline-button"
                              style={{ fontSize: "10px", padding: "2px 6px" }}
                              onClick={(e) =>
                                handleQuickIncreaseInTable(e, item, 5)
                              }
                              title="Quickly add 5 more seats to this cohort"
                            >
                              +5 Seats
                            </button>
                          </div>
                        </td>
                        <td>
                          <strong>GH₵{item.early_bird_fee}</strong>
                          <small
                            style={{
                              color: itemEarlyEnded ? "#16a34a" : "#d97706",
                            }}
                          >
                            {itemEarlyEnded ? "Standard Rate" : "Early-Bird"}
                          </small>
                        </td>
                        <td>GH₵{item.base_fee}</td>
                        <td>
                          <span
                            className={`status-pill ${item.status === "active" ? "active" : "draft"}`}
                          >
                            {item.status === "active" ? "Active" : "Draft"}
                          </span>
                        </td>
                        <td>
                          {item.whatsapp_url ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "#16a34a",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              <SiWhatsapp /> Configured
                            </span>
                          ) : (
                            <span
                              style={{ color: "#9ca3af", fontSize: "11px" }}
                            >
                              Not set
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              className="outline-button"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCohort(item);
                              }}
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                              title="Edit intake"
                            >
                              <MdEdit /> Edit
                            </button>
                            <button
                              className="outline-button"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCohort(item.id, item.title);
                              }}
                              style={{
                                padding: "4px 8px",
                                fontSize: "11px",
                                color: "#dc2626",
                                borderColor: "#fca5a5",
                                background: "#fff5f5",
                              }}
                              title="Delete admission cohort"
                            >
                              <MdDelete /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {cohorts.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No cohorts configured yet. Click "New Cohort Intake"
                        above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminCohorts;
