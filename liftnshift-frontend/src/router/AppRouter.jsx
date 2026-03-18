import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import MyBookings from "../pages/MyBookings";
import CreateBooking from "../pages/CreateBooking";
import BookingConfirmation from "../pages/BookingConfirmation";
import BookingDetail from "../pages/BookingDetail";
import NotFound from "../pages/NotFound";

// import Profile from "../pages/Profile";  ← add when built

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected ─────────────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/my-bookings" element={
          <ProtectedRoute><MyBookings /></ProtectedRoute>
        } />

        <Route path="/bookings/new" element={
          <ProtectedRoute><CreateBooking /></ProtectedRoute>
        } />

        <Route path="/bookings/:id/confirm" element={
          <ProtectedRoute><BookingConfirmation /></ProtectedRoute>
        } />

        <Route path="/bookings/:id/detail" element={
          <ProtectedRoute><BookingDetail /></ProtectedRoute>
        } />

        {/*
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        */}

        {/* ── 404 ───────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}