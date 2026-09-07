import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import API_URL from "@/lib/api";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import MainRoute from "./Routes/MainRoute";

/**
 * On every page load, verify the httpOnly cookie against the backend.
 * - Success → restore Redux auth state from the live session.
 * - Failure → dispatch logout() to clear any stale isAuthenticated:true
 *             that redux-persist may have saved to localStorage.
 *
 * Without this, a user whose cookie expired would still see protected pages
 * because redux-persist had saved isAuthenticated:true locally.
 */
function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });
        // Cookie is valid — restore/confirm auth state in Redux
        dispatch(loginSuccess({ user: data, token: null }));
      } catch {
        // Cookie is missing or expired — wipe stale localStorage state
        dispatch(logout());
      } finally {
        setIsInitializing(false);
      }
    };

    verifySession();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return <MainRoute />;
}

export default App;

