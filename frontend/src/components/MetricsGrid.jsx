import {
  MdAccountBalanceWallet,
  MdCheckCircle,
  MdGroup,
  MdLayers,
  MdTrendingUp,
} from "react-icons/md";
import "./MetricsGrid.css";

function MetricCard({
  className = "",
  label,
  value,
  detail,
  icon: Icon,
  children,
}) {
  return (
    <article className={`metric-card ${className}`}>
      <div>
        <span className="metric-label">{label}</span>
        <strong>
          {value} <small>{detail}</small>
        </strong>
      </div>
      <Icon className="metric-icon" />
      {children}
    </article>
  );
}

function MetricsGrid({
  totalRevenue = "GH₵21,500.00",
  totalStudents = 40,
  maxCap = 50,
  foundationsCount = 18,
  foundationsRevenue = "GH₵7,200.00",
  fullstackCount = 22,
  fullstackRevenue = "GH₵14,300.00",
}) {
  const capacityPercent = Math.min(
    100,
    Math.round((totalStudents / (maxCap || 50)) * 100),
  );
  const foundationsPercent = totalStudents
    ? Math.round((foundationsCount / totalStudents) * 100)
    : 0;
  const fullstackPercent = totalStudents
    ? Math.round((fullstackCount / totalStudents) * 100)
    : 0;

  return (
    <section className="metric-grid" aria-label="Cohort metrics">
      <MetricCard
        className="revenue"
        label="Total Revenue Collected"
        value={totalRevenue}
        icon={MdAccountBalanceWallet}
      >
        <div className="metric-note">
          <MdTrendingUp /> +18% vs target{" "}
          <span>
            <MdCheckCircle /> Verified
          </span>
        </div>
      </MetricCard>
      <MetricCard
        label="Total Students Enrolled"
        value={totalStudents}
        detail={`/ ${maxCap} Max Cap`}
        icon={MdGroup}
      >
        <div className="progress-row">
          <span>Capacity filled</span>
          <strong>{capacityPercent}%</strong>
        </div>
        <div className="progress">
          <span style={{ width: `${capacityPercent}%` }} />
        </div>
      </MetricCard>
      <MetricCard
        className="track-card foundations"
        label="Foundations Track"
        value={foundationsCount}
        detail="Students"
        icon={MdLayers}
      >
        <div className="track-meta">
          <strong>{foundationsRevenue}</strong>
          <span>{foundationsPercent}% of cohort</span>
        </div>
      </MetricCard>
      <MetricCard
        className="track-card fullstack"
        label="Full-Stack Track"
        value={fullstackCount}
        detail="Students"
        icon={MdLayers}
      >
        <div className="track-meta">
          <strong>{fullstackRevenue}</strong>
          <span>{fullstackPercent}% of cohort</span>
        </div>
      </MetricCard>
    </section>
  );
}

export default MetricsGrid;
