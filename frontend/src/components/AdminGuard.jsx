import { useEffect, useState } from "react";
import { adminMe } from "../lib/api";
import { toast } from "react-toastify";

function AdminGuard({ children, onNavigate }) {
  const [authState, setAuthState] = useState({
    checking: true,
    authenticated: false,
  });

  useEffect(() => {
    let ignore = false;
    adminMe()
      .then((res) => {
        if (!ignore) {
          if (res && res.authenticated && res.user && res.user.is_staff) {
            setAuthState({ checking: false, authenticated: true });
          } else {
            setAuthState({ checking: false, authenticated: false });
            toast.warn("Administrative session required. Please sign in.");
            if (onNavigate) onNavigate("/admin/login");
            else window.location.href = "/admin/login";
          }
        }
      })
      .catch(() => {
        if (!ignore) {
          setAuthState({ checking: false, authenticated: false });
          toast.warn("Please sign in to access the Admin Console.");
          if (onNavigate) onNavigate("/admin/login");
          else window.location.href = "/admin/login";
        }
      });

    return () => {
      ignore = true;
    };
  }, [onNavigate]);

  if (authState.checking) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#f8fafc",
          color: "#475569",
          gap: "12px",
          fontFamily: "var(--font-sans, system-ui)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid #ffcfb7",
            borderTopColor: "var(--orange, #ff5a19)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <strong style={{ fontSize: "14px", color: "var(--ink, #1e293b)" }}>
          Poietik Admin Console
        </strong>
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          Verifying administrative credentials...
        </span>
      </div>
    );
  }

  if (!authState.authenticated) {
    return null;
  }

  return children;
}

export default AdminGuard;
