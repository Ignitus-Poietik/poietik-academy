import { useState } from "react";
import { MdArrowBack, MdErrorOutline, MdLock, MdLogin } from "react-icons/md";
import { adminLogin } from "../lib/api";
import { toast } from "react-toastify";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      await adminLogin(credentials);
      sessionStorage.setItem("poietik_admin_user", credentials.username);
      toast.success("Authentication successful! Welcome to the Admin Console.");
      onNavigate("/admin/overview");
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please try again.");
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

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter username"
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
        </div>
      </main>
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}

export default AdminLogin;
