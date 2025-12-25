import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import studentProfileReducer from "./slices/studentProfileSlice";
import jobReducer from "./slices/jobSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  auth: authReducer,
  studentProfile: studentProfileReducer,
  jobs: jobReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "studentProfile"], // persist these slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
