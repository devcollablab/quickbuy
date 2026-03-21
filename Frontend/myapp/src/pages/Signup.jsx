import React, { useState, useEffect } from "react";
import customAxios from "../components/customAxios";
import { urlResendotp, urlSignup, urlVerifyotp } from "../../endpoints";

const Signup = ({ isOpen, setIsOpen, onOpenLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [timer, setTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

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

      alert("OTP sent to your email 📩");

      setOtpSent(true);
      setTimer(60);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // VERIFY OTP
  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {
      await customAxios.post(urlVerifyotp, {
        email,
        otp,
      });

      alert("Account created successfully 🎉");

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

      alert("OTP resent 📩");

      setTimer(60);
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
  
      <div className="bg-[#f7f5f2] w-full max-w-md sm:max-w-lg p-6 sm:p-10 shadow-xl relative rounded-sm">
  
        {/* Close */}
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
  
          <button
            onClick={() => {
              setIsOpen(false);
              resetFields();
              onOpenLogin();
            }}
            className="text-gray-500 tracking-widest pb-3 px-6 sm:px-10"
          >
            LOGIN
          </button>
  
          <button className="text-[#c5a46d] tracking-widest pb-3 border-b-2 border-[#c5a46d] px-6 sm:px-10">
            REGISTER
          </button>
  
        </div>
  
        <form onSubmit={verifyOtp}>
  
          {/* Email */}
          <div className="mb-5 sm:mb-6">
  
            <label className="block text-gray-500 tracking-widest text-xs sm:text-sm mb-2">
              EMAIL
            </label>
  
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="w-full bg-[#c5a46d] text-white tracking-widest py-2.5 sm:py-3 text-sm sm:text-base hover:opacity-90 transition"
            >
              SEND OTP
            </button>
          )}
  
          {/* OTP */}
          {otpSent && (
            <>
              <div className="mb-5 sm:mb-6 mt-3 sm:mt-4">
  
                <label className="block text-gray-500 tracking-widest text-xs sm:text-sm mb-2">
                  OTP
                </label>
  
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 bg-white focus:outline-none focus:border-[#c5a46d]"
                />
  
              </div>
  
              <p className="text-xs sm:text-sm text-gray-600 mb-4 text-center">
  
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
                className="w-full bg-[#c5a46d] text-white tracking-widest py-2.5 sm:py-3 text-sm sm:text-base hover:opacity-90 transition"
              >
                VERIFY & SIGN UP
              </button>
            </>
          )}
  
        </form>
      </div>
    </div>
  );
};

export default Signup;