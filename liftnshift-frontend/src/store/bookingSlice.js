import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

// ── ASYNC THUNKS ─────────────────────────────────────────────────────────────

export const fetchMyBookings = createAsyncThunk(
  "booking/fetchMy",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/api/bookings");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch bookings"
      );
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  "booking/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/api/bookings/${id}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Booking not found"
      );
    }
  }
);

export const createBooking = createAsyncThunk(
  "booking/create",
  async ({ pickupAddress, dropAddress }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/api/bookings", {
        pickupAddress,
        dropAddress,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create booking"
      );
    }
  }
);

export const deleteBooking = createAsyncThunk(
  "booking/delete",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/api/bookings/${id}`);
      return id; // return id so we can remove it from state
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete booking"
      );
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  "booking/updateStatus",
  async ({ bookingId, status }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(
        `/api/bookings/${bookingId}/status`,
        { status }
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update status"
      );
    }
  }
);

// ── SLICE ────────────────────────────────────────────────────────────────────

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    bookings: [],       // list of all my bookings
    selected: null,     // currently viewed booking detail
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedBooking(state) {
      state.selected = null;
    },
    clearBookingError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch all ──
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Fetch one ──
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Create ──
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload); // add to top of list
        state.selected = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Delete ──
    builder
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter((b) => b.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── Update status ──
    builder
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        state.bookings = state.bookings.map((b) =>
          b.id === updated.id ? updated : b
        );
        if (state.selected?.id === updated.id) state.selected = updated;
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSelectedBooking, clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;