import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { urlGetMe, urlGetProfile } from "../../endpoints";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      // ✅ basic user
      const meRes = await axios.get(urlGetMe, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ optional profile
      let profileData = {};

      try {
        const profileRes = await axios.get(urlGetProfile, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        profileData = profileRes.data;
      } catch (err) {
        // ignore if profile not created
      }

      // ✅ merged user object
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

  // ✅ auth checker
  const requireAuth = useCallback(() => {
    if (!isLoggedIn) {
      // open auth modal here if needed
      // setAuthModalOpen(true);

      return false;
    }

    return true;
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAuthenticated: isLoggedIn, // alias
        login,
        logout,
        user,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);