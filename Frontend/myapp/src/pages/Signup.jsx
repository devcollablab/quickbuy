import React, { useState, useEffect } from "react";
import customAxios from "../components/customAxios";
import { urlGoogleLogin, urlResendotp, urlSignup, urlVerifyotp } from "../../endpoints";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

const Signup = ({ isOpen, setIsOpen, onOpenLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [timer, setTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const resetFields = () => {
    setEmail?.("");
    
    setPassword("");
    setOtp?.("");
    setShowPassword(false);
    setOtpSent?.(false);
    setPasswordError?.("");
    setTimer?.(0);
  };

  const closeModal = () => {
    setEmail("");
    setPassword("");
    setOtp("");
    setShowPassword(false);
    setOtpSent(false);
    setIsOpen(false);
    resetFields();
  };

  if (!isOpen) return null;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  // SEND OTP
  const sendOtp = async () => {
    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    if (passwordError) {
      alert("Enter strong password");
      return;
    }

    try {
      await customAxios.post(urlSignup, {
        email,
        password,
      });

      
      setToast({
        message: "OTP sent to your email 📩",
        type: "success",
      });

      setOtpSent(true);
      setTimer(60);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
      setToast({
        message: "Failed to send OTP",
        type: "error",
      });
    }
  };

  // VERIFY OTP
  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      
      setToast({
        message: "Enter OTP",
        type: "error",
      });
      return;
    }

    try {
      await customAxios.post(urlVerifyotp, {
        email,
        otp,
      });

      
      setToast({
        message: "Account created successfully 🎉",
        type: "success",
      });

      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
    }
  };

  // RESEND OTP
  const handleResendOtp = async () => {
    try {
      setResendLoading(true);

      await customAxios.post(urlResendotp, { email });

      
      setToast({
        message: "OTP resent 📩",
        type: "success",
      });

      setTimer(60);
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const id_token = credentialResponse.credential;
  
      const response = await customAxios.post(urlGoogleLogin, {
        id_token: id_token,
      });
  
      // ✅ Store tokens
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
  
      // ✅ Update auth context
      login(response.data.access_token);
  
      // ✅ Close modal
      closeModal();
  
      // ✅ Redirect to profile page
      navigate("/profile");
  
    } catch (error) {
      console.error("Google signup/login failed:", error);
    
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
  
          {/* Modal */}
          <div className="bg-[#f7f5f2]/95 backdrop-blur-md w-full max-w-xs sm:max-w-sm p-3 sm:p-4 
          rounded-2xl shadow-xl relative border border-white/40">
  
            {/* Close */}
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
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetFields();
                  onOpenLogin();
                }}
                className="text-gray-500 tracking-widest pb-2 px-4"
              >
                LOGIN
              </button>
  
              <button className="text-[#c5a46d] tracking-widest pb-2 border-b-2 border-[#c5a46d] px-4">
                REGISTER
              </button>
            </div>
  
            <form onSubmit={verifyOtp}>
  
              {/* Email */}
              <div className="mb-3">
                <label className="block text-gray-500 text-xs mb-1">
                  EMAIL
                </label>
  
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setPassword(value);
  
                      if (!passwordRegex.test(value)) {
                        setPasswordError(
                          "Password must contain uppercase, lowercase, number & special character"
                        );
                      } else {
                        setPasswordError("");
                      }
                    }}
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
  
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordError}
                  </p>
                )}
              </div>
  
              {/* Send OTP */}
              {!otpSent && (
                <button
                  type="button"
                  onClick={sendOtp}
                  className="w-full bg-[#c5a46d] text-white tracking-widest py-2 text-sm 
                  rounded-lg hover:opacity-90 hover:shadow-md transition-all duration-200"
                >
                  SEND OTP
                </button>
              )}
  
              {/* Google */}
              <div className="mt-4">
                <div className="text-center text-gray-400 text-[10px] mb-2">
                  CONTINUE WITH
                </div>
  
                <div className="flex justify-center scale-90">
                  <GoogleLogin
                    onSuccess={handleGoogleSignup}
                    onError={() => {
                      setToast({
                        message: "Google login failed",
                        type: "error",
                      });
                    }}
                  />
                </div>
  
                <div className="text-center text-gray-400 text-[10px] mt-2">
                  OR SIGN UP WITH EMAIL
                </div>
              </div>
  
              {/* OTP Section */}
              {otpSent && (
                <>
                  <div className="mb-3 mt-3">
                    <label className="block text-gray-500 text-xs mb-1">
                      OTP
                    </label>
  
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full border border-gray-300 px-3 py-2 text-sm bg-white 
                      rounded-lg focus:outline-none focus:border-[#c5a46d] focus:ring-1 focus:ring-[#c5a46d]"
                    />
                  </div>
  
                  <p className="text-xs text-gray-600 mb-3 text-center">
                    {timer > 0 ? (
                      <>Resend OTP in <span className="font-semibold">{timer}s</span></>
                    ) : (
                      <>
                        Didn't receive OTP?{" "}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-[#c5a46d] underline"
                        >
                          {resendLoading ? "Sending..." : "Resend"}
                        </button>
                      </>
                    )}
                  </p>
  
                  <button
                    type="submit"
                    className="w-full bg-[#c5a46d] text-white tracking-widest py-2 text-sm 
                    rounded-lg hover:opacity-90 hover:shadow-md transition-all duration-200"
                  >
                    VERIFY & SIGN UP
                  </button>
                </>
              )}
  
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;