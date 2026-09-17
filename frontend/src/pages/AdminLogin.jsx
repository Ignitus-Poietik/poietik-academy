import { useState } from "react";
import { MdArrowBack, MdErrorOutline, MdLock, MdLogin } from "react-icons/md";
import { adminLogin } from "../lib/api";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import "./AdminLogin.css";

function AdminLogin({ onNavigate }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [status, setStatus] = useState({ loading: false, error: "" });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const fillDefaultCredentials = () => {
    setCredentials({
      username: "admin",
      password: "PoietikAdmin2026!",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      await adminLogin(credentials);
      sessionStorage.setItem("poietik_admin_user", credentials.username);
      onNavigate("/admin/students");
    } catch (err) {
      setStatus({
        loading: false,
        error: err.message || "Invalid credentials. Please try again.",
      });
    }
  };

  return (
    <div className="flow-page admin-login-page">
      <PublicHeader onNavigate={onNavigate} />
      <main className="flow-main login-container">
        <a
          className="flow-back"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("/");
          }}
        >
          <MdArrowBack /> Back to academy
        </a>

        <div className="login-card">
          <div className="login-header">
            <div className="login-icon-badge">
              <MdLock />
            </div>
            <p className="flow-kicker">STAFF ONLY · SECURE PORTAL</p>
            <h1>Admin Console Login</h1>
            <p className="login-subtext">
              Manage cohort registration, track incoming payments, and view the
              student roster.
            </p>
          </div>

          <div className="credentials-helper-card">
            <div className="helper-header">
              <strong>Your Admin Credentials</strong>
              <button
                type="button"
                className="fill-btn"
                onClick={fillDefaultCredentials}
              >
                Auto-fill
              </button>
            </div>
            <div className="helper-details">
              <div>
                <span>Username:</span> <code>admin</code>
              </div>
              <div>
                <span>Password:</span> <code>PoietikAdmin2026!</code>
              </div>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={credentials.username}
                onChange={handleChange}
                placeholder="e.g. admin"
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {status.error && (
              <div className="form-error" role="alert">
                <MdErrorOutline />
                <span>{status.error}</span>
              </div>
            )}

            <button
              className="solid-button login-btn"
              type="submit"
              disabled={status.loading}
            >
              <MdLogin />{" "}
              {status.loading
                ? "Authenticating..."
                : "Sign in to Admin Console"}
            </button>
          </form>

          <div className="login-footer-links">
            <span>Prefer Django native admin?</span>
            <a
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              rel="noreferrer"
            >
              Open Django Admin Portal (/admin/)
            </a>
          </div>
        </div>
      </main>
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}

export default AdminLogin;
