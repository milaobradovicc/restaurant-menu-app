import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasValidToken } from "../api";

export default function ProtectedRoute() {
  const location = useLocation();
  return hasValidToken() ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
