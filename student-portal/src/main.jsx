import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "./store";
import { persistor } from "./store";
import axios from "axios";
import { logout } from "./store/slices/authSlice";

// Configure default axios properties globally
axios.defaults.withCredentials = true;

// Add a response interceptor to handle session expiration (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired (401 Unauthorized). Logging out user.");
      store.dispatch(logout());
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
