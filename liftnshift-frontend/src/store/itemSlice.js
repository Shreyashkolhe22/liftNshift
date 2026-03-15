import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

// ── ASYNC THUNKS ─────────────────────────────────────────────────────────────

export const fetchPredefinedItems = createAsyncThunk(
  "item/fetchPredefined",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/api/predefined-items");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load catalog"
      );
    }
  }
);

export const fetchItemsByBooking = createAsyncThunk(
  "item/fetchByBooking",
  async (bookingId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/api/bookings/${bookingId}/items`
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load items"
      );
    }
  }
);

export const addItemToBooking = createAsyncThunk(
  "item/add",
  async ({ bookingId, predefinedItemId, customName, quantity, size }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/api/bookings/items", {
        bookingId,
        predefinedItemId,
        customName,
        quantity,
        size,
      });
      return res.data; // returns updated BookingDto
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to add item"
      );
    }
  }
);

export const deleteItem = createAsyncThunk(
  "item/delete",
  async ({ bookingId, itemId }, thunkAPI) => {
    try {
      await axiosInstance.delete(
        `/api/bookings/${bookingId}/items/${itemId}`
      );
      return itemId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete item"
      );
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  "item/updateQty",
  async ({ bookingId, itemId, quantity }, thunkAPI) => {
    try {
      await axiosInstance.put(
        `/api/bookings/${bookingId}/items/${itemId}/quantity`,
        null,
        { params: { quantity } }
      );
      return { itemId, quantity };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update quantity"
      );
    }
  }
);

// ── SLICE ────────────────────────────────────────────────────────────────────

const itemSlice = createSlice({
  name: "item",
  initialState: {
    catalog: [],        // predefined items from /api/predefined-items
    bookingItems: [],   // items for currently viewed booking
    loading: false,
    error: null,
  },
  reducers: {
    clearItems(state) {
      state.bookingItems = [];
    },
    clearItemError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Predefined catalog ──
    builder
      .addCase(fetchPredefinedItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPredefinedItems.fulfilled, (state, action) => {
        state.loading = false;
        state.catalog = action.payload;
      })
      .addCase(fetchPredefinedItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Items by booking ──
    builder
      .addCase(fetchItemsByBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItemsByBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingItems = action.payload;
      })
      .addCase(fetchItemsByBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Add item ──
    builder
      .addCase(addItemToBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToBooking.fulfilled, (state) => {
        state.loading = false;
        // Items list will be re-fetched via fetchItemsByBooking after add
      })
      .addCase(addItemToBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Delete item ──
    builder
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.bookingItems = state.bookingItems.filter(
          (i) => i.id !== action.payload
        );
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── Update quantity ──
    builder
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        const { itemId, quantity } = action.payload;
        const item = state.bookingItems.find((i) => i.id === itemId);
        if (item) item.quantity = quantity;
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearItems, clearItemError } = itemSlice.actions;
export default itemSlice.reducer;