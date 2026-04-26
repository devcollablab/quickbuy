import React, { useState,useEffect } from "react";
import customAxios from "../components/customAxios";
import { urlGoogleLogin, urlLogin } from "../../endpoints";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import { GoogleLogin } from "@react-oauth/google";


const Login = ({ isOpen, setIsOpen, onOpenSignup, onOpenForgot }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const { login } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      resetFields();
    }
  }, [isOpen]);

  const resetFields = () => {
    
    setUsername?.("");
    setPassword("");
    
    setShowPassword(false);
    
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      
      setToast({
        message: "Please enter email and password",
        type: "error"
      });
      return;
    }

    try {
      const response = await customAxios.post(urlLogin, {
        email: username,
        password: password,
      });

      setToast({
        message: "Login Successsful",
        type: "success"
      });

      setTimeout(() => {
        setIsOpen(false);
      }, 1500);

      // store tokens
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);

      login(response.data.access_token);

      // reset fields
      setUsername("");
      setPassword("");

      setIsOpen(false);
    } catch (error) {
      console.error("Login failed:", error);

      const message =
        error.response?.data?.detail;

        setToast({
          message: "Invalid email or password",
          type: "error"
        });
    }
  };

  const closeModal = () => {
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setIsOpen(false);
    resetFields();
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const id_token = credentialResponse.credential;
  
      const response = await customAxios.post(urlGoogleLogin, {
        id_token: id_token,
      });
  
      // store tokens
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
  
      login(response.data.access_token);
  
      setToast({
        message: "Google Login Successful",
        type: "success",
      });
  
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
  
    } catch (error) {
      console.error("Google login failed:", error);
  
      setToast({
        message: "Google login failed",
        type: "error",
      });
    }
  };
  

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "" })}
      />
  
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2">
  
          {/* Smaller Modal */}
          <div className="bg-[#f7f5f2]/95 backdrop-blur-md w-full max-w-xs sm:max-w-sm p-3 sm:p-4 
rounded-2xl shadow-xl relative border border-white/40">
  
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 cursor-pointer text-gray-500 text-base"
            >
              ✕
            </button>
  
            {/* Brand */}
            <h1 className="text-center text-lg sm:text-xl tracking-[3px] mb-4 font-serif">
              LUXE<span className="text-[#c5a46d]">SCENTS</span>
            </h1>
  
            {/* Tabs */}
            <div className="flex justify-center mb-4 border-b text-xs">
  
              <button className="text-[#c5a46d] tracking-widest pb-2 border-b-2 border-[#c5a46d] px-4">
                LOGIN
              </button>
  
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetFields();
                  onOpenSignup();
                }}
                className="text-gray-500 tracking-widest pb-2 px-4"
              >
                REGISTER
              </button>
  
            </div>
  
            {/* Form */}
            <form onSubmit={handleLogin}>
  
              {/* Email */}
              <div className="mb-3">
                <label className="block text-gray-500 text-xs mb-1">
                  EMAIL
                </label>
  
                <input
                  type="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 px-3 py-2 text-sm bg-white 
rounded-lg focus:outline-none focus:border-[#c5a46d] focus:ring-1 focus:ring-[#c5a46d]"
                />
              </div>
  
              {/* Password */}
              <div className="mb-3">
                <label className="block text-gray-500 text-xs mb-1">
                  PASSWORD
                </label>
  
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm bg-white 
rounded-lg focus:outline-none focus:border-[#c5a46d] focus:ring-1 focus:ring-[#c5a46d]"
                  />
  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
  
              {/* Links */}
              <div className="text-right mb-3 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    resetFields();
                    onOpenForgot();
                  }}
                  className="text-[#c5a46d] text-xs underline"
                >
                  Forgot password?
                </button>
  
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    resetFields();
                    onOpenSignup();
                  }}
                  className="block text-xs text-gray-500 underline"
                >
                  New User REGISTER Here..!
                </button>
              </div>
  
              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-[#c5a46d] text-white tracking-widest py-2 text-sm 
rounded-lg hover:opacity-90 hover:shadow-md transition-all duration-200"
              >
                LOGIN
              </button>
  
              {/* Google Login */}
              <div className="mt-4">
                <div className="text-center text-gray-400 text-[10px] mb-2">
                  OR
                </div>
  
                <div className="flex justify-center scale-90">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      setToast({
                        message: "Google login failed",
                        type: "error",
                      });
                    }}
                  />
                </div>
              </div>
  
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;