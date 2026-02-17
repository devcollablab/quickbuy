import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { urlGetMe, urlGetProfile } from "../../endpoints";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // will contain full_name

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      // ✅ get basic user
      const meRes = await axios.get(urlGetMe, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ get profile (ONLY ONCE)
      let profileData = {};
      try {
        const profileRes = await axios.get(urlGetProfile, {
          headers: { Authorization: `Bearer ${token}` },
        });
        profileData = profileRes.data;
      } catch (err) {
        // profile may not exist yet — ignore
      }

      // ✅ MERGED USER OBJECT
      setUser({
        ...meRes.data,
        ...profileData,
      });

      setIsLoggedIn(true);
    } catch (error) {
      logout();
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
