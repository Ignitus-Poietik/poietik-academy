import { MdCheckCircle, MdDownload, MdSearch } from "react-icons/md";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./AdminPages.css";

const roster = [
  {
    initials: "KM",
    name: "Kwame Mensah",
    email: "kwame.mensah@dev.accra.gh",
    phone: "+233 24 123 4567",
    track: "Full-Stack Dev",
    amount: "GH₵650.00",
    reference: "PSK-001-032",
    date: "04 Mar 2026",
  },
  {
    initials: "AS",
    name: "Ama Serwaa",
    email: "ama.serwaa@knust.alumni.gh",
    phone: "+233 50 987 6543",
    track: "Web Foundations",
    amount: "GH₵400.00",
    reference: "PSK-001-029",
    date: "02 Mar 2026",
  },
  {
    initials: "KA",
    name: "Kofi Asante",
    email: "kofi.asante@techie.gh",
    phone: "+233 20 555 0198",
    track: "Full-Stack Dev",
    amount: "GH₵650.00",
    reference: "PSK-001-021",
    date: "28 Feb 2026",
  },
  {
    initials: "EY",
    name: "Esi Yeboah",
    email: "esi.yeboah@design.gh",
    phone: "+233 27 444 8102",
    track: "Web Foundations",
    amount: "GH₵400.00",
    reference: "PSK-001-017",
    date: "24 Feb 2026",
  },
];
function AdminStudents() {
  return (
    <div className="admin-shell">
      <Sidebar />
      <main className="admin-main">
        <Topbar />
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
            <button className="admin-primary">
              <MdDownload /> Export to CSV
            </button>
          </div>
          <div className="admin-metrics">
            <Metric
              label="Total revenue"
              value="GH₵21,500"
              note="+18% vs target"
            />
            <Metric
              label="Students enrolled"
              value="40 / 50"
              note="80% capacity"
            />
            <Metric label="Foundations" value="18" note="45% of cohort" />
            <Metric label="Full-Stack" value="22" note="55% of cohort" />
          </div>
          <section className="table-card roster-admin">
            <div className="filter-bar">
              <label className="admin-search">
                <MdSearch />
                <input placeholder="Search by name or phone" />
              </label>
              <select>
                <option>All tracks</option>
                <option>Full-Stack Dev</option>
                <option>Web Foundations</option>
              </select>
              <select>
                <option>All payment status</option>
                <option>Paid</option>
                <option>Pending</option>
              </select>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table roster-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>WhatsApp / Phone</th>
                    <th>Enrolled track</th>
                    <th>Amount paid</th>
                    <th>Paystack reference</th>
                    <th>Registration date</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((student) => (
                    <tr key={student.reference}>
                      <td>
                        <div className="admin-student">
                          <span>{student.initials}</span>
                          <strong>{student.name}</strong>
                        </div>
                      </td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>
                        <span className="track-tag">{student.track}</span>
                      </td>
                      <td>
                        <strong>{student.amount}</strong>
                        <small className="paid-status">
                          <MdCheckCircle /> Paid
                        </small>
                      </td>
                      <td className="reference-cell">{student.reference}</td>
                      <td>{student.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
function Metric({ label, value, note }) {
  return (
    <article className="admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
export default AdminStudents;
