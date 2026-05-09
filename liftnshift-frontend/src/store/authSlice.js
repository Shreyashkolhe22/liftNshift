import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role || "USER");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ name, email, phone, password }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/api/auth/register", {
        name, email, phone, password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role || "USER");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token:      localStorage.getItem("token") || null,
    role:       localStorage.getItem("role")  || "USER",
    isLoggedIn: !!localStorage.getItem("token"),
    loading:    false,
    error:      null,
  },
  reducers: {
    logout(state) {
      state.token      = null;
      state.isLoggedIn = false;
      state.role       = "USER";
      state.error      = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading    = false;
        s.token      = a.payload.token;
        s.isLoggedIn = true;
        s.role       = a.payload.role || "USER";
      })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(registerUser.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading    = false;
        s.token      = a.payload.token;
        s.isLoggedIn = true;
        s.role       = a.payload.role || "USER";
      })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;