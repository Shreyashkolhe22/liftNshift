import { configureStore } from "@reduxjs/toolkit";
import authReducer    from "./authSlice";
import bookingReducer from "./bookingSlice";
import itemReducer    from "./itemSlice";
import adminReducer   from "./adminSlice";

const store = configureStore({
  reducer: {
    auth:    authReducer,
    booking: bookingReducer,
    item:    itemReducer,
    admin:   adminReducer,
  },
});

export default store;