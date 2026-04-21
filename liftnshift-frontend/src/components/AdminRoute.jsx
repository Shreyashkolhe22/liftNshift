import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { isLoggedIn, role } = useSelector(s => s.auth);

  if (!isLoggedIn) return <Navigate to="/login"     replace />;
  if (role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  return children;
}