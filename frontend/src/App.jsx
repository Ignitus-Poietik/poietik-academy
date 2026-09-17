import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import EnrollPage from "./pages/EnrollPage";
import SuccessPage from "./pages/SuccessPage";
import AdminCohorts from "./pages/AdminCohorts";
import AdminStudents from "./pages/AdminStudents";
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
  if (path === "/admin/cohorts") screen = <AdminCohorts />;
  if (path === "/admin/students") screen = <AdminStudents />;
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={path}
          className="route-screen"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        >
          {screen}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}

export default App;
