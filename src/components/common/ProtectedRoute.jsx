import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children, admin = false, allowedRoles }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile || !profile.is_active) return <Navigate to="/login" replace />;
  const roles = admin ? ["admin"] : allowedRoles;
  if (roles && !roles.includes(profile.role)) return <Navigate to="/" replace />;
  return children || <Outlet />;
}
