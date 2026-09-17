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

function MetricsGrid() {
  return (
    <section className="metric-grid" aria-label="Cohort metrics">
      <MetricCard
        className="revenue"
        label="Total Revenue Collected"
        value="GH₵21,500.00"
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
        value="40"
        detail="/ 50 Max Cap"
        icon={MdGroup}
      >
        <div className="progress-row">
          <span>Capacity filled</span>
          <strong>80%</strong>
        </div>
        <div className="progress">
          <span />
        </div>
      </MetricCard>
      <MetricCard
        className="track-card foundations"
        label="Foundations Track"
        value="18"
        detail="Students"
        icon={MdLayers}
      >
        <div className="track-meta">
          <strong>GH₵7,200.00</strong>
          <span>45% of cohort</span>
        </div>
      </MetricCard>
      <MetricCard
        className="track-card fullstack"
        label="Full-Stack Track"
        value="22"
        detail="Students"
        icon={MdLayers}
      >
        <div className="track-meta">
          <strong>GH₵14,300.00</strong>
          <span>55% of cohort</span>
        </div>
      </MetricCard>
    </section>
  );
}

export default MetricsGrid;
