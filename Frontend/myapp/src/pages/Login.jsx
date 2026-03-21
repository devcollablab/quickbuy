import React, { useState,useEffect } from "react";
import customAxios from "../components/customAxios";
import { urlLogin } from "../../endpoints";
import { useAuth } from "../context/AuthContext";
import CustomAlert from "../components/CustomAlert";


const Login = ({ isOpen, setIsOpen, onOpenSignup, onOpenForgot }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });

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
      alert("Please enter email and password");
      return;
    }

    try {
      const response = await customAxios.post(urlLogin, {
        email: username,
        password: password,
      });

      setAlert({
        message: "Login Successful",
        type: "success",
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
        error.response?.data?.detail || "Invalid email or password";

      alert(message);
    }
  };

  const closeModal = () => {
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setIsOpen(false);
    resetFields();
  };

  

  return (
    <>
    <CustomAlert
      message={alert.message}
      type={alert.type}
      onClose={() => setAlert({ message: "" })}
    />
    {isOpen && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
  
      <div className="bg-[#f7f5f2] w-full max-w-md sm:max-w-lg p-6 sm:p-10 shadow-xl relative rounded-sm">
  
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 text-lg sm:text-xl"
        >
          ✕
        </button>
  
        {/* Brand */}
        <h1 className="text-center text-2xl sm:text-3xl tracking-[4px] sm:tracking-[6px] mb-8 sm:mb-10 font-serif">
          LUXE<span className="text-[#c5a46d]">SCENTS</span>
        </h1>
  
        {/* Tabs */}
        <div className="flex justify-center mb-8 sm:mb-10 border-b text-sm sm:text-base">
  
          <button className="text-[#c5a46d] tracking-widest pb-3 border-b-2 border-[#c5a46d] px-6 sm:px-10">
            LOGIN
          </button>
  
          <button
            onClick={() => {
              setIsOpen(false);
              resetFields();
              onOpenSignup();
            }}
            className="text-gray-500 tracking-widest pb-3 px-6 sm:px-10"
          >
            REGISTER
          </button>
  
        </div>
  
        {/* Form */}
        <form onSubmit={handleLogin}>
  
          {/* Email */}
          <div className="mb-5 sm:mb-6">
  
            <label className="block text-gray-500 tracking-widest text-xs sm:text-sm mb-2">
              EMAIL
            </label>
  
            <input
              type="email"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 bg-white focus:outline-none focus:border-[#c5a46d]"
            />
  
          </div>
  
          {/* Password */}
          <div className="mb-5 sm:mb-6">
  
            <label className="block text-gray-500 tracking-widest text-xs sm:text-sm mb-2">
              PASSWORD
            </label>
  
            <div className="relative">
  
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 bg-white focus:outline-none focus:border-[#c5a46d]"
              />
  
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 sm:top-3 text-xs sm:text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
  
            </div>
  
          </div>
  
          {/* Forgot Password */}
          <div className="text-right mb-5 sm:mb-6">
  
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                resetFields();
                onOpenForgot();
              }}
              className="text-[#c5a46d] text-xs sm:text-sm underline"
            >
              Forgot password?
            </button>
  
          </div>
  
          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#c5a46d] text-white tracking-widest py-2.5 sm:py-3 text-sm sm:text-base hover:opacity-90 transition"
          >
            LOGIN
          </button>
  
        </form>
  
      </div>
    </div>
    )}
    </>
  );
};

export default Login;