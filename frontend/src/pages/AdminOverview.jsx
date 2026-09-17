import { useEffect, useState } from "react";
import {
  MdArrowForward,
  MdPayment,
  MdPeople,
  MdRefresh,
  MdSchool,
  MdVpnKey,
} from "react-icons/md";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MetricsGrid from "../components/MetricsGrid";
import { getAdminOverview } from "../lib/api";
import "./AdminPages.css";

function AdminOverview({ onNavigate, currentPath }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overview, setOverview] = useState({
    total_revenue: "GH₵0.00",
    total_students: 0,
    max_capacity: 50,
    verified_count: 0,
    pending_count: 0,
    foundations_count: 0,
    foundations_revenue: "GH₵0.00",
    fullstack_count: 0,
    fullstack_revenue: "GH₵0.00",
    recent_students: [],
    cohorts: [],
  });
  const [loading, setLoading] = useState(true);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await getAdminOverview();
      setOverview(data);
      toast.success("Overview metrics refreshed.");
    } catch {
      toast.info("Displaying cached overview metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getAdminOverview()
      .then((data) => {
        if (!ignore && data) {
          setOverview(data);
        }
      })
      .catch(() => {
        // Retain initial zero state on network error
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

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
              <p className="admin-kicker">ADMIN CONSOLE · EXECUTIVE OVERVIEW</p>
              <h1>Admissions &amp; Platform Overview</h1>
              <p>
                Live financial settlement, admissions velocity, cohort intake
                gauges, and gateway health.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="outline-button"
                type="button"
                onClick={handleRefresh}
                title="Refresh metrics"
              >
                <MdRefresh /> Refresh
              </button>
              <button
                className="admin-primary"
                type="button"
                onClick={() => onNavigate("/admin/cohorts")}
              >
                <MdSchool /> Manage Cohorts
              </button>
            </div>
          </div>

          <MetricsGrid
            totalRevenue={overview.total_revenue}
            totalStudents={overview.total_students}
            maxCap={overview.max_capacity}
            foundationsCount={overview.foundations_count}
            foundationsRevenue={overview.foundations_revenue}
            fullstackCount={overview.fullstack_count}
            fullstackRevenue={overview.fullstack_revenue}
          />

          <div className="admin-builder-grid" style={{ marginTop: "24px" }}>
            <section className="builder-card">
              <div className="card-heading">
                <div>
                  <span>COHORT INTAKE STATUS</span>
                  <h2>Active Admissions</h2>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onNavigate("/admin/cohorts")}
                >
                  Configure intakes <MdArrowForward />
                </button>
              </div>

              <div style={{ display: "grid", gap: "12px" }}>
                {overview.cohorts.length > 0 ? (
                  overview.cohorts.map((c) => (
                    <div
                      key={c.id || c.track}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        background: "#fbfcfd",
                      }}
                    >
                      <div>
                        <strong
                          style={{ fontSize: "13px", color: "var(--ink)" }}
                        >
                          {c.title}
                        </strong>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "4px",
                            fontSize: "11px",
                            color: "#64748b",
                          }}
                        >
                          <span>{c.track}</span>
                          <span>·</span>
                          <span>GH₵{c.early_bird_fee} Early-Bird</span>
                          <span>·</span>
                          <span>
                            {c.enrolled_count ?? c.student_count ?? 0} /{" "}
                            {c.max_capacity || 50} Seats Filled
                            {c.is_full
                              ? " (Capacity Full)"
                              : ` (${c.remaining_seats ?? Math.max(0, (c.max_capacity || 50) - (c.enrolled_count || 0))} left)`}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {c.is_full && (
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              background: "#fee2e2",
                              color: "#b91c1c",
                              fontSize: "10px",
                              fontWeight: "700",
                            }}
                          >
                            Cap Full
                          </span>
                        )}
                        {c.whatsapp_configured ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              background: "#dcfce7",
                              color: "#15803d",
                              fontSize: "10px",
                              fontWeight: "700",
                            }}
                          >
                            <SiWhatsapp /> WhatsApp Protected
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              background: "#fee2e2",
                              color: "#b91c1c",
                              fontSize: "10px",
                              fontWeight: "700",
                            }}
                          >
                            No WhatsApp Link
                          </span>
                        )}
                        <span
                          className={`status-pill ${c.status === "active" ? "active" : "draft"}`}
                        >
                          {c.status === "active" ? "Active" : "Draft"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      background: "#fbfcfd",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "13px", color: "var(--ink)" }}>
                        Cohort 001 — Web Foundations &amp; Full-Stack
                      </strong>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "4px",
                          fontSize: "11px",
                          color: "#64748b",
                        }}
                      >
                        <span>2 Active Tracks</span>
                        <span>·</span>
                        <span>Paystack GHS Enabled</span>
                        <span>·</span>
                        <span>Gated WhatsApp Community</span>
                      </div>
                    </div>
                    <span className="status-pill active">Active</span>
                  </div>
                )}
              </div>
            </section>

            <section className="builder-card preview-card">
              <span className="admin-kicker">
                COMMERCE &amp; ADMISSIONS GATE
              </span>
              <h2>Platform Integrations</h2>

              <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "6px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <MdPayment
                    style={{ fontSize: "20px", color: "var(--orange)" }}
                  />
                  <div style={{ fontSize: "11px" }}>
                    <strong style={{ display: "block", color: "var(--ink)" }}>
                      Paystack Payment Engine
                    </strong>
                    <span style={{ color: "#16a34a", fontWeight: "600" }}>
                      ● Live &amp; Secured (MoMo &amp; Cards Enabled)
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "6px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <SiWhatsapp style={{ fontSize: "20px", color: "#16a34a" }} />
                  <div style={{ fontSize: "11px" }}>
                    <strong style={{ display: "block", color: "var(--ink)" }}>
                      WhatsApp Cohort Group Gate
                    </strong>
                    <span style={{ color: "#0284c7", fontWeight: "600" }}>
                      ● Active · Automated for Verified Students
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "6px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <MdVpnKey
                    style={{ fontSize: "20px", color: "var(--orange)" }}
                  />
                  <div style={{ fontSize: "11px" }}>
                    <strong style={{ display: "block", color: "var(--ink)" }}>
                      Staff Session &amp; Security
                    </strong>
                    <span style={{ color: "#16a34a", fontWeight: "600" }}>
                      ● Authenticated Session Active
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="table-card" style={{ marginTop: "24px" }}>
            <div className="card-heading">
              <div>
                <span>RECENT ADMISSION ACTIVITY</span>
                <h2>Latest Student Registrations</h2>
              </div>
              <button
                className="solid-button"
                type="button"
                onClick={() => onNavigate("/admin/students")}
                style={{ padding: "8px 14px", fontSize: "11px" }}
              >
                <MdPeople /> Open Full Student Directory <MdArrowForward />
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Track</th>
                    <th>WhatsApp Number</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recent_students.length > 0 ? (
                    overview.recent_students.map((st) => (
                      <tr key={st.id || st.phone}>
                        <td>
                          <strong>{st.name}</strong>
                          <small>ID: #{st.id}</small>
                        </td>
                        <td>{st.track}</td>
                        <td>{st.phone}</td>
                        <td>{st.amount}</td>
                        <td>
                          <span
                            className={`status-pill ${st.payment_status === "paid" ? "active" : "draft"}`}
                          >
                            {st.paymentStatus ||
                              (st.payment_status === "paid"
                                ? "Verified Settled"
                                : "Pending")}
                          </span>
                        </td>
                        <td>{st.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ textAlign: "center", padding: "24px" }}
                      >
                        {loading
                          ? "Loading admission activity..."
                          : "No student registrations recorded yet."}
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

export default AdminOverview;
