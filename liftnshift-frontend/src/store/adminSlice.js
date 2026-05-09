import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

// ── THUNKS ────────────────────────────────────────────────────────

export const fetchDashboard = createAsyncThunk(
  "admin/dashboard",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/api/admin/dashboard");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/api/admin/users");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`);
      return userId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const makeAdmin = createAsyncThunk(
  "admin/makeAdmin",
  async (userId, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(`/api/admin/users/${userId}/make-admin`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const fetchAllBookings = createAsyncThunk(
  "admin/fetchBookings",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/api/admin/bookings");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  "admin/updateBookingStatus",
  async ({ bookingId, status }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(
        `/api/admin/bookings/${bookingId}/status?status=${status}`
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const deleteBooking = createAsyncThunk(
  "admin/deleteBooking",
  async (bookingId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/api/admin/bookings/${bookingId}`);
      return bookingId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const fetchAllItems = createAsyncThunk(
  "admin/fetchItems",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/api/admin/items");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const addItem = createAsyncThunk(
  "admin/addItem",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/api/admin/items", data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const updateItem = createAsyncThunk(
  "admin/updateItem",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/api/admin/items/${id}`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const deleteItem = createAsyncThunk(
  "admin/deleteItem",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/api/admin/items/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

// ── SLICE ──────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    dashboard: null,
    users:     [],
    bookings:  [],
    items:     [],
    loading:   false,
    error:     null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const pending = (s) => { s.loading = true; s.error = null; };
    const reject  = (s, a) => { s.loading = false; s.error = a.payload; };

    builder
      // dashboard
      .addCase(fetchDashboard.pending,   pending)
      .addCase(fetchDashboard.fulfilled, (s, a) => { s.loading = false; s.dashboard = a.payload; })
      .addCase(fetchDashboard.rejected,  reject)

      // users
      .addCase(fetchAllUsers.pending,   pending)
      .addCase(fetchAllUsers.fulfilled, (s, a) => { s.loading = false; s.users = a.payload; })
      .addCase(fetchAllUsers.rejected,  reject)
      .addCase(deleteUser.fulfilled,    (s, a) => { s.users = s.users.filter(u => u.id !== a.payload); })
      .addCase(makeAdmin.fulfilled,     (s, a) => { s.users = s.users.map(u => u.id === a.payload.id ? a.payload : u); })

      // bookings
      .addCase(fetchAllBookings.pending,   pending)
      .addCase(fetchAllBookings.fulfilled, (s, a) => { s.loading = false; s.bookings = a.payload; })
      .addCase(fetchAllBookings.rejected,  reject)
      .addCase(updateBookingStatus.fulfilled, (s, a) => { s.bookings = s.bookings.map(b => b.id === a.payload.id ? a.payload : b); })
      .addCase(deleteBooking.fulfilled,      (s, a) => { s.bookings = s.bookings.filter(b => b.id !== a.payload); })

      // items
      .addCase(fetchAllItems.pending,   pending)
      .addCase(fetchAllItems.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchAllItems.rejected,  reject)
      .addCase(addItem.fulfilled,    (s, a) => { s.items.push(a.payload); })
      .addCase(updateItem.fulfilled, (s, a) => { s.items = s.items.map(i => i.id === a.payload.id ? a.payload : i); })
      .addCase(deleteItem.fulfilled, (s, a) => { s.items = s.items.filter(i => i.id !== a.payload); });
  },
});

export default adminSlice.reducer;