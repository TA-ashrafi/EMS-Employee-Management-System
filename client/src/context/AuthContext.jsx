import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const resSession = await API.get("/api/auth/session");
        const sessionUser = resSession.data.user;
        setUser(sessionUser);
        localStorage.setItem("user", JSON.stringify(sessionUser));

        const resProfile = await API.get("/api/profile");
        setProfile(resProfile.data);
      } catch (err) {
        console.error("Session restoration failed:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, [token]);

  const login = async (email, password, role_type) => {
    const res = await API.post("/api/auth/login", { email, password, role_type });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    try {
      const resProfile = await API.get("/api/profile");
      setProfile(resProfile.data);
    } catch {
      setProfile(null);
    }
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const resProfile = await API.get("/api/profile");
      setProfile(resProfile.data);
    } catch (err) {
      console.error("Refresh profile error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
