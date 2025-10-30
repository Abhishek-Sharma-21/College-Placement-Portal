import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import studentProfileReducer from "./slices/studentProfileSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    studentProfile: studentProfileReducer,
  },
});
