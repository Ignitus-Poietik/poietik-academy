import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import EnrollPage from "./pages/EnrollPage";
import SuccessPage from "./pages/SuccessPage";
import AdminCohorts from "./pages/AdminCohorts";
import AdminStudents from "./pages/AdminStudents";
import AdminLogin from "./pages/AdminLogin";
import "./App.css";

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
  let screen = <LandingPage onNavigate={navigate} />;
  if (path === "/enroll") screen = <EnrollPage onNavigate={navigate} />;
  if (path === "/enrollment/success")
    screen = <SuccessPage onNavigate={navigate} />;
  if (path === "/admin/login") screen = <AdminLogin onNavigate={navigate} />;
  if (path === "/admin" || path === "/admin/")
    screen = (
      <AdminStudents onNavigate={navigate} currentPath="/admin/students" />
    );
  if (path === "/admin/cohorts")
    screen = <AdminCohorts onNavigate={navigate} currentPath={path} />;
  if (path === "/admin/students")
    screen = <AdminStudents onNavigate={navigate} currentPath={path} />;
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={path}
          className="route-screen"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {screen}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}

export default App;
