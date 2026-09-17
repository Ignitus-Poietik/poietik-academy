import { useEffect, useState, useMemo } from "react";
import { MdDashboard, MdRefresh } from "react-icons/md";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import RosterPanel from "../components/RosterPanel";
import { deleteAdminStudent, getAdminStudents } from "../lib/api";
import "./AdminPages.css";

function AdminStudents({ onNavigate, currentPath }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("All Tracks");
  const [payment, setPayment] = useState("All Payment Status");

  const handleRefresh = async (showToast = true) => {
    try {
      setLoading(true);
      const data = await getAdminStudents();
      if (data && data.students) {
        setStudents(data.students);
      }
      if (showToast) toast.success("Student directory refreshed.");
    } catch {
      toast.error("Unable to reach server to refresh directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the student admission record for "${studentName}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteAdminStudent(studentId);
      toast.success(`Student admission for "${studentName}" deleted.`);
      handleRefresh(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete student admission.");
    }
  };

  useEffect(() => {
    let ignore = false;
    getAdminStudents()
      .then((data) => {
        if (!ignore && data && data.students) {
          setStudents(data.students);
        }
      })
      .catch(() => {
        // Keep empty array on error
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = students.length;
    const verified = students.filter(
      (s) =>
        s.paymentStatus === "Verified Settled" || s.payment_status === "paid",
    ).length;
    const pending = total - verified;
    const fullstack = students.filter((s) =>
      s.track.toLowerCase().includes("full"),
    ).length;
    const foundations = students.filter((s) =>
      s.track.toLowerCase().includes("foundation"),
    ).length;

    return { total, verified, pending, fullstack, foundations };
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        search === "" ||
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()) ||
        student.phone.includes(search);

      const matchTrack =
        track === "All Tracks" ||
        (track === "Full-Stack Dev" &&
          student.track.toLowerCase().includes("full")) ||
        (track === "Web Foundations" &&
          student.track.toLowerCase().includes("foundation"));

      const matchPayment =
        payment === "All Payment Status" ||
        student.paymentStatus === payment ||
        (payment === "Verified Settled" && student.payment_status === "paid") ||
        (payment === "Pending Reconciliation" &&
          student.payment_status !== "paid");

      return matchSearch && matchTrack && matchPayment;
    });
  }, [students, search, track, payment]);

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
              <p className="admin-kicker">COHORT REGISTRAR · DIRECTORY</p>
              <h1>Student Directory &amp; Roster</h1>
              <p>
                Search, filter, inspect clearance status, and export student
                enrollment records.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="outline-button"
                type="button"
                onClick={handleRefresh}
                title="Refresh directory"
              >
                <MdRefresh /> Refresh
              </button>
              <button
                className="admin-primary"
                type="button"
                onClick={() => onNavigate("/admin/overview")}
              >
                <MdDashboard /> Admin Overview
              </button>
            </div>
          </div>

          <div className="directory-stats-row">
            <div className="directory-stat-card">
              <span className="stat-label">Total Registered</span>
              <strong className="stat-value">{stats.total}</strong>
              <span className="stat-sub">Active cohort admissions</span>
            </div>
            <div className="directory-stat-card">
              <span className="stat-label">Verified Settled</span>
              <strong className="stat-value text-green">
                {stats.verified}
              </strong>
              <span className="stat-sub">Paid via Paystack / MoMo</span>
            </div>
            <div className="directory-stat-card">
              <span className="stat-label">Pending Verification</span>
              <strong className="stat-value text-amber">{stats.pending}</strong>
              <span className="stat-sub">Awaiting clearance</span>
            </div>
            <div className="directory-stat-card">
              <span className="stat-label">Track Distribution</span>
              <strong className="stat-value">
                {stats.fullstack} / {stats.foundations}
              </strong>
              <span className="stat-sub">Full-Stack / Foundations</span>
            </div>
          </div>

          <RosterPanel
            students={filteredStudents}
            search={search}
            onSearch={setSearch}
            track={track}
            onTrackChange={setTrack}
            payment={payment}
            onPaymentChange={setPayment}
            totalCount={students.length}
            loading={loading}
            onDeleteStudent={handleDeleteStudent}
          />
        </div>
      </main>
    </div>
  );
}

export default AdminStudents;
