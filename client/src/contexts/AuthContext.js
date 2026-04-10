import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 When app loads, check if token exists and fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const res = await axios.get("http://localhost:5000/api/auth/me"); // ✅ auth route use kar
          setCurrentUser(res.data.user); // backend se { user } aata hai
        }
      } catch (err) {
        console.error("❌ Failed to fetch user:", err.message);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Login
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      setCurrentUser(res.data.user); // ✅ backend se user return hona chahiye
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during login");
      throw err;
    }
  };

  // ✅ Register
  const register = async (userData) => {
    try {
      setError(null);
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        userData
      );

      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      setCurrentUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred during registration"
      );
      throw err;
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
