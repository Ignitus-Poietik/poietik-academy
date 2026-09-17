import { useState, useMemo } from "react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdDelete,
  MdDownload,
  MdExpandMore,
  MdSearch,
  MdChatBubbleOutline,
  MdCheckCircle,
  MdHourglassEmpty,
} from "react-icons/md";
import { toast } from "react-toastify";
import "./RosterPanel.css";

function RosterPanel({
  students = [],
  search = "",
  onSearch = () => {},
  track = "All Tracks",
  onTrackChange = () => {},
  payment = "All Payment Status",
  onPaymentChange = () => {},
  totalCount = 0,
  loading = false,
  onDeleteStudent = () => {},
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Derive total pages
  const totalPages = Math.max(1, Math.ceil(students.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  // Paginated window
  const paginatedStudents = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return students.slice(start, start + pageSize);
  }, [students, safePage, pageSize]);

  const startIndex = students.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, students.length);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExport = () => {
    if (!students || students.length === 0) {
      toast.warn("No student records to export.");
      return;
    }
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Track",
      "Amount Paid",
      "Status",
      "Date",
    ];
    const rows = students.map((s) => [
      s.id,
      `"${s.name}"`,
      s.email,
      `"${s.phone}"`,
      `"${s.track}"`,
      `"${s.amount}"`,
      `"${s.paymentStatus || s.payment_status}"`,
      `"${s.date || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `poietik_roster_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${students.length} student records to CSV!`);
  };

  // Generate pagination buttons
  const pageNumbers = [];
  const maxButtons = 5;
  let startBtn = Math.max(1, safePage - Math.floor(maxButtons / 2));
  let endBtn = Math.min(totalPages, startBtn + maxButtons - 1);
  if (endBtn - startBtn + 1 < maxButtons) {
    startBtn = Math.max(1, endBtn - maxButtons + 1);
  }
  for (let i = startBtn; i <= endBtn; i++) {
    pageNumbers.push(i);
  }

  return (
    <section className="roster-panel">
      <div className="panel-toolbar">
        <label className="search-box">
          <MdSearch />
          <input
            value={search}
            onChange={(event) => {
              onSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search name, email, or WhatsApp number"
          />
        </label>
        <label className="select-wrap">
          <select
            value={track}
            onChange={(event) => {
              onTrackChange(event.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(event) => {
              onPaymentChange(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option>All Payment Status</option>
            <option>Verified Settled</option>
            <option>Pending Reconciliation</option>
          </select>
          <MdExpandMore />
        </label>
        <label className="select-wrap page-size-select">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            title="Rows per page"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <MdExpandMore />
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email Address</th>
              <th>WhatsApp Number</th>
              <th>Track</th>
              <th>Amount Paid</th>
              <th>Payment Clearance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student) => {
              const isPaid =
                student.payment_status === "paid" ||
                student.paymentStatus === "Verified Settled";

              return (
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
                      className={`track-pill ${
                        student.track.toLowerCase().includes("full")
                          ? "fullstack-pill"
                          : ""
                      }`}
                    >
                      {student.track}
                    </span>
                  </td>
                  <td>
                    <strong>{student.amount}</strong>
                  </td>
                  <td>
                    {isPaid ? (
                      <span className="status status-verified">
                        <MdCheckCircle /> Verified Settled
                      </span>
                    ) : (
                      <span className="status status-pending">
                        <MdHourglassEmpty /> Pending Clearance
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="delete-student-btn"
                      onClick={() => onDeleteStudent(student.id, student.name)}
                      title={`Delete admission record for ${student.name}`}
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && <p className="empty-state">Loading enrolled students...</p>}

        {!loading && students.length === 0 && (
          <p className="empty-state">
            No student enrollment records found matching the active criteria.
          </p>
        )}
      </div>

      <div className="panel-footer">
        <div className="footer-summary">
          {students.length > 0 ? (
            <span>
              Showing <strong>{startIndex}</strong> to{" "}
              <strong>{endIndex}</strong> of <strong>{students.length}</strong>{" "}
              students
              {totalCount > students.length && (
                <span> (filtered from {totalCount} total)</span>
              )}
            </span>
          ) : (
            <span>0 students found</span>
          )}
        </div>

        <div className="pagination-bar">
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                type="button"
                className="page-nav-btn"
                disabled={safePage <= 1}
                onClick={() => handlePageChange(safePage - 1)}
                title="Previous Page"
              >
                <MdChevronLeft /> Prev
              </button>

              {pageNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`page-num-btn ${safePage === num ? "is-active" : ""}`}
                  onClick={() => handlePageChange(num)}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                className="page-nav-btn"
                disabled={safePage >= totalPages}
                onClick={() => handlePageChange(safePage + 1)}
                title="Next Page"
              >
                Next <MdChevronRight />
              </button>
            </div>
          )}

          <button
            type="button"
            className="roster-export-btn"
            onClick={handleExport}
            title="Download CSV export"
          >
            <MdDownload /> Export CSV ({students.length})
          </button>
        </div>
      </div>
    </section>
  );
}

export default RosterPanel;
