import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import {  urlGetProfile } from "../../endpoints";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // On app load
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    debugger;
    try {
      const res = await axios.get(urlGetProfile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.full_name);
      setIsLoggedIn(true);
    } catch (error) {
      logout(); // token invalid or expired
    }
  };

  const login = async (token) => {
    localStorage.setItem("access_token", token);
    await fetchUser(token);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
