import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Wraps any route that requires login.
// If not logged in → redirect to /login
export default function ProtectedRoute({ children }) {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}