import {
  MdCalendarToday,
  MdChatBubbleOutline,
  MdCheckCircle,
  MdDownload,
  MdExpandMore,
  MdSearch,
} from "react-icons/md";
import "./RosterPanel.css";

function RosterPanel({
  students,
  search,
  onSearch,
  track,
  onTrackChange,
  payment,
  onPaymentChange,
}) {
  return (
    <section className="roster-panel">
      <div className="panel-toolbar">
        <label className="search-box">
          <MdSearch />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search name, email, or phone"
          />
        </label>
        <label className="select-wrap">
          <select
            value={track}
            onChange={(event) => onTrackChange(event.target.value)}
          >
            <option>All Tracks</option>
            <option>Full-Stack Dev</option>
            <option>Web Foundations</option>
          </select>
          <MdExpandMore />
        </label>
        <label className="select-wrap">
          <select
            value={payment}
            onChange={(event) => onPaymentChange(event.target.value)}
          >
            <option>All Payment Status</option>
            <option>Verified Settled</option>
            <option>Pending Reconciliation</option>
          </select>
          <MdExpandMore />
        </label>
        <div className="cohort-date">
          <MdCalendarToday />
          <span>
            Cohort
            <br />
            <strong>Sep - Oct 2026</strong>
          </span>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email Address</th>
              <th>WhatsApp / Phone</th>
              <th>Track</th>
              <th>Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  <div className="student-cell">
                    <span className="student-avatar">{student.initials}</span>
                    <span>
                      <strong>{student.name}</strong>
                      <small>#{student.id}</small>
                    </span>
                  </div>
                </td>
                <td>{student.email}</td>
                <td>
                  <span className="phone">
                    <MdChatBubbleOutline />
                    {student.phone}
                  </span>
                </td>
                <td>
                  <span
                    className={`track-pill ${student.track === "Full-Stack Dev" ? "fullstack-pill" : ""}`}
                  >
                    {student.track}
                  </span>
                </td>
                <td>
                  <strong>{student.amount}</strong>
                  <span className="status">
                    <MdCheckCircle /> Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <p className="empty-state">No students match these filters.</p>
        )}
      </div>
      <div className="panel-footer">
        <span>Showing {students.length} of 40 enrolled students</span>
        <button type="button">
          <MdDownload /> Export current view
        </button>
      </div>
    </section>
  );
}

export default RosterPanel;
