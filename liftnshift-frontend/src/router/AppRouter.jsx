import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute     from "../components/AdminRoute";

import Login               from "../pages/Login";
import Register            from "../pages/Register";
import Dashboard           from "../pages/Dashboard";
import MyBookings          from "../pages/MyBookings";
import CreateBooking       from "../pages/CreateBooking";
import BookingConfirmation from "../pages/BookingConfirmation";
import BookingDetail       from "../pages/BookingDetail";
import Profile             from "../pages/Profile";
import NotFound            from "../pages/NotFound";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers     from "../pages/admin/AdminUsers";
import AdminBookings  from "../pages/admin/AdminBookings";
import AdminItems     from "../pages/admin/AdminItems";
import AdminTrucks  from "../pages/admin/AdminTrucks";
import AdminDrivers from "../pages/admin/AdminDrivers";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User */}
        <Route path="/dashboard"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/my-bookings"          element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/bookings/new"         element={<ProtectedRoute><CreateBooking /></ProtectedRoute>} />
        <Route path="/bookings/:id/confirm" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
        <Route path="/bookings/:id/detail"  element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
        <Route path="/profile"              element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/bookings"  element={<AdminRoute><AdminBookings /></AdminRoute>} />
        <Route path="/admin/items"     element={<AdminRoute><AdminItems /></AdminRoute>} />
        <Route path="/admin/trucks"  element={<AdminRoute><AdminTrucks  /></AdminRoute>} />
        <Route path="/admin/drivers" element={<AdminRoute><AdminDrivers /></AdminRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}