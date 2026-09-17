import { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MetricsGrid from "../components/MetricsGrid";
import RosterPanel from "../components/RosterPanel";
import "./AdminPages.css";

const initialStudents = [
  {
    id: "001",
    initials: "KM",
    name: "Kwame Mensah",
    email: "kwame.mensah@dev.accra.gh",
    phone: "+233 24 123 4567",
    track: "Full-Stack Dev",
    amount: "GH₵650.00",
    paymentStatus: "Verified Settled",
    date: "04 Mar 2026",
  },
  {
    id: "002",
    initials: "AS",
    name: "Ama Serwaa",
    email: "ama.serwaa@knust.alumni.gh",
    phone: "+233 50 987 6543",
    track: "Web Foundations",
    amount: "GH₵400.00",
    paymentStatus: "Verified Settled",
    date: "02 Mar 2026",
  },
  {
    id: "003",
    initials: "KA",
    name: "Kofi Asante",
    email: "kofi.asante@techie.gh",
    phone: "+233 20 555 0198",
    track: "Full-Stack Dev",
    amount: "GH₵650.00",
    paymentStatus: "Verified Settled",
    date: "28 Feb 2026",
  },
  {
    id: "004",
    initials: "EY",
    name: "Esi Yeboah",
    email: "esi.yeboah@design.gh",
    phone: "+233 27 444 8102",
    track: "Web Foundations",
    amount: "GH₵400.00",
    paymentStatus: "Verified Settled",
    date: "24 Feb 2026",
  },
  {
    id: "005",
    initials: "YA",
    name: "Yaw Acheampong",
    email: "yaw.ach@accra.io",
    phone: "+233 24 991 2304",
    track: "Full-Stack Dev",
    amount: "GH₵650.00",
    paymentStatus: "Pending Reconciliation",
    date: "23 Feb 2026",
  },
  {
    id: "006",
    initials: "AB",
    name: "Abena Boateng",
    email: "abena.b@builder.gh",
    phone: "+233 55 312 8841",
    track: "Web Foundations",
    amount: "GH₵400.00",
    paymentStatus: "Verified Settled",
    date: "20 Feb 2026",
  },
  {
    id: "007",
    initials: "DA",
    name: "David Annan",
    email: "david.annan@legon.edu.gh",
    phone: "+233 20 882 1190",
    track: "Full-Stack Dev",
    amount: "GH₵650.00",
    paymentStatus: "Verified Settled",
    date: "18 Feb 2026",
  },
  {
    id: "008",
    initials: "PO",
    name: "Priscilla Osei",
    email: "priscilla.osei@codex.gh",
    phone: "+233 24 670 4411",
    track: "Web Foundations",
    amount: "GH₵400.00",
    paymentStatus: "Verified Settled",
    date: "15 Feb 2026",
  },
];

function AdminStudents({ onNavigate, currentPath }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("All Tracks");
  const [payment, setPayment] = useState("All Payment Status");

  const filteredStudents = useMemo(() => {
    return initialStudents.filter((student) => {
      const matchSearch =
        search === "" ||
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()) ||
        student.phone.includes(search);

      const matchTrack =
        track === "All Tracks" ||
        (track === "Full-Stack Dev" && student.track.includes("Full-Stack")) ||
        (track === "Web Foundations" && student.track.includes("Foundations"));

      const matchPayment =
        payment === "All Payment Status" || student.paymentStatus === payment;

      return matchSearch && matchTrack && matchPayment;
    });
  }, [search, track, payment]);

  return (
    <div className="admin-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={onNavigate}
        currentPath={currentPath}
      />
      <main className="admin-main">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <div className="admin-content">
          <div className="admin-page-heading">
            <div>
              <p className="admin-kicker">COHORT 001 / REGISTRAR</p>
              <h1>Student Roster &amp; Metrics</h1>
              <p>
                Enrollment, fee clearance, and academic progress for the current
                intake.
              </p>
            </div>
          </div>
          <MetricsGrid
            totalRevenue="GH₵21,500.00"
            totalStudents={40}
            maxCap={50}
            foundationsCount={18}
            foundationsRevenue="GH₵7,200.00"
            fullstackCount={22}
            fullstackRevenue="GH₵14,300.00"
          />
          <RosterPanel
            students={filteredStudents}
            search={search}
            onSearch={setSearch}
            track={track}
            onTrackChange={setTrack}
            payment={payment}
            onPaymentChange={setPayment}
            totalCount={40}
          />
        </div>
      </main>
    </div>
  );
}

export default AdminStudents;
