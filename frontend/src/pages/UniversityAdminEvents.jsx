import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ManageEvents from "./ManageEvents";

/** University-wide event administration; coordinator workspace remains club-scoped. */
export default function UniversityAdminEvents() {
  const { user } = useAuth();
  if (user?.role !== "UNIVERSITY_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }
  return <ManageEvents />;
}
