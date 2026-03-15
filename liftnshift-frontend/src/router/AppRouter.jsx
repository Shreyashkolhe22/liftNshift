import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Pages
import Login    from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";

// These pages will be built next — placeholder imports for now
// import Landing        from "../pages/Landing";
// import CreateBooking  from "../pages/CreateBooking";
// import BookingDetail  from "../pages/BookingDetail";
// import AddItems       from "../pages/AddItems";
// import Profile        from "../pages/Profile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ───────────────────────────────────── */}
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* ── Protected routes ────────────────────────────────── */}
        {/*
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/bookings/new" element={
          <ProtectedRoute><CreateBooking /></ProtectedRoute>
        } />
        <Route path="/bookings/:id" element={
          <ProtectedRoute><BookingDetail /></ProtectedRoute>
        } />
        <Route path="/bookings/:id/items" element={
          <ProtectedRoute><AddItems /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        */}

        {/* ── Fallback ─────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}