import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("auth_token", res.data.token);
      localStorage.setItem("auth_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      const apiError = err.response?.data?.error;

      const message =
        typeof apiError === "string"
          ? apiError
          : typeof apiError?.message === "string"
            ? apiError.message
            : "Unable to sign in. Please try again.";

      return {
        success: false,
        error: message,
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  const value = { user, login, logout, isAuthenticated, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
