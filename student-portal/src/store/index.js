import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import jobReducer from "./slices/jobSlice";
import studentProfileReducer from "./slices/studentProfileSlice";
import apiSlice from "./api/apiSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist user auth state
};

const rootReducer = combineReducers({
  auth: authReducer,
  jobs: jobReducer,
  studentProfile: studentProfileReducer,
  [apiSlice.reducerPath]: apiSlice.reducer, // Add RTK Query reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiSlice.middleware), // Concat RTK Query middleware
});

export const persistor = persistStore(store);
