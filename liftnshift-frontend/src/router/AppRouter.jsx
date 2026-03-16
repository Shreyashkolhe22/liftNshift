import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import MyBookings from "../pages/MyBookings";
import CreateBooking from "../pages/CreateBooking";
import BookingConfirmation from "../pages/BookingConfirmation";
import BookingDetail from "../pages/BookingDetail";

// import Profile from "../pages/Profile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ─────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected ──────────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/my-bookings" element={
          <ProtectedRoute><MyBookings /></ProtectedRoute>
        } />

        <Route path="/bookings/new" element={
          <ProtectedRoute><CreateBooking /></ProtectedRoute>
        } />

        {/* Confirmation — shown after Step 2 finishes */}
        <Route path="/bookings/:id/confirm" element={
          <ProtectedRoute><BookingConfirmation /></ProtectedRoute>
        } />

        {/* Detail — reached from My Bookings "View Details" */}
        <Route path="/bookings/:id/detail" element={
          <ProtectedRoute><BookingDetail /></ProtectedRoute>
        } />

        {/*
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        */}

        {/* ── Fallback ───────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}