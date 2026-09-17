import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import EnrollPage from "./pages/EnrollPage";
import SuccessPage from "./pages/SuccessPage";
import AdminCohorts from "./pages/AdminCohorts";
import AdminStudents from "./pages/AdminStudents";
import AdminOverview from "./pages/AdminOverview";
import AdminLogin from "./pages/AdminLogin";
import AdminGuard from "./components/AdminGuard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const ADMIN_PATHS = [
  "/admin",
  "/admin/",
  "/admin/overview",
  "/admin/cohorts",
  "/admin/students",
];

function App() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const navigate = (nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath.split("?")[0]);
    window.scrollTo(0, 0);
  };

  const isAdminRoute = ADMIN_PATHS.includes(path) || path.startsWith("/admin/");
  const isAdminLogin = path === "/admin/login";

  // Public pages — full-page slide-fade animation
  let publicScreen = null;
  if (!isAdminRoute && !isAdminLogin) {
    if (path === "/enroll") publicScreen = <EnrollPage onNavigate={navigate} />;
    else if (path === "/enrollment/success")
      publicScreen = <SuccessPage onNavigate={navigate} />;
    else publicScreen = <LandingPage onNavigate={navigate} />;
  }

  // Admin page content (no wrapper animation — CSS handles it on admin-content)
  let adminScreen = null;
  if (isAdminRoute && !isAdminLogin) {
    if (path === "/admin" || path === "/admin/" || path === "/admin/overview") {
      adminScreen = (
        <AdminOverview onNavigate={navigate} currentPath="/admin/overview" />
      );
    } else if (path === "/admin/cohorts") {
      adminScreen = <AdminCohorts onNavigate={navigate} currentPath={path} />;
    } else if (path === "/admin/students") {
      adminScreen = <AdminStudents onNavigate={navigate} currentPath={path} />;
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Admin login — simple, no animation */}
      {isAdminLogin && <AdminLogin onNavigate={navigate} />}

      {/* Admin routes — sidebar is rendered INSIDE each page component and stays stable.
          No AnimatePresence here. The .admin-content div uses a CSS keyframe fade-in. */}
      {isAdminRoute && !isAdminLogin && (
        <AdminGuard onNavigate={navigate}>{adminScreen}</AdminGuard>
      )}

      {/* Public pages — full page slide-fade */}
      {!isAdminRoute && !isAdminLogin && (
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            className="route-screen"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {publicScreen}
          </motion.div>
        </AnimatePresence>
      )}
    </MotionConfig>
  );
}

export default App;
