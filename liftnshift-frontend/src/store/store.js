import { configureStore } from "@reduxjs/toolkit";
import authReducer    from "./authSlice";
import bookingReducer from "./bookingSlice";
import itemReducer    from "./itemSlice";

const store = configureStore({
  reducer: {
    auth:    authReducer,
    booking: bookingReducer,
    item:    itemReducer,
  },
});

export default store;