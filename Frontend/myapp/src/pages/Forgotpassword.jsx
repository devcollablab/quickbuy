import React, { useState, useEffect } from "react";
import customAxios from "../components/customAxios";
import { urlForgotpass, urlResendotp, urlResetpass } from "../../endpoints";

const Forgotpassword = ({ isOpen, setIsOpen }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
const [timer, setTimer] = useState(0);

useEffect(() => {
  let interval;

  if (timer > 0) {
    interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  }

  return () => clearInterval(interval);
}, [timer]);

  const closeModal = () => {
    setEmail("");
    setPassword("");
    setOtp("");
    setShowPassword(false);
    setOtpSent(false);
    setIsOpen(false);
  };
  
  if (!isOpen) return null;

  // 1️⃣ Send OTP
  const sendOtp = async () => {
    debugger;
    if (!email) {
      alert("Email required");
      return;
    }
  
    if (passwordError) {
      alert("Please enter a strong password");
      return;
    }
  
    try {
      await customAxios.post(urlForgotpass, {
        email,
      });
  
      alert("OTP sent to your email");
      setOtpSent(true);
      setTimer(60);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    }
  };
  

  // 2️⃣ Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {
      await customAxios.post(urlResetpass, {
        email,
        otp,
        new_password: password,
      });

      alert("password reset successfully 🎉");
      // reset fields
setEmail("");
setPassword("");
setOtp("");
setShowPassword(false);
setOtpSent(false);
      setIsOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
    }
  };

  const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  
  const handleResendOtp = async () => {
    if (!email) {
      alert("Email required");
      return;
    }
  
    try {
      setResendLoading(true);
  
      await customAxios.post(urlResendotp, {
        email,
      });
  
      alert("OTP resent successfully 📩");
      setTimer(60); // ✅ restart timer
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="flex flex-col md:flex-row">

          {/* LEFT */}
          <div className="bg-blue-500 text-white p-8 md:w-1/2">
            <h1 className="text-3xl font-bold mb-4">Reset Password</h1>
            <p className="text-blue-100">
              Get access to Orders, Wishlist and more
            </p>
          </div>

          {/* RIGHT */}
          <div className="p-8 md:w-1/2 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-xl"
            >
              ✕
            </button>

            <form onSubmit={verifyOtp}>
              {/* Email */}
              <div className="mb-5">
                <label className="font-semibold text-sm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
              </div>

             

              {/* Send OTP */}
              {!otpSent && (
                <button
                  type="button"
                  onClick={sendOtp}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg mb-4"
                >
                  Send OTP
                </button>
              )}

              {/* OTP */}
              {otpSent && (
                
                    <>
                      {/* Password */}
                      <div className="mb-5">
                        <label className="font-semibold text-sm">New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPassword(value);
                  
                              if (!passwordRegex.test(value)) {
                                setPasswordError(
                                  "Password must be 8+ chars with uppercase, lowercase, number & special character"
                                );
                              } else {
                                setPasswordError("");
                              }
                            }}
                            className="w-full px-4 py-3 pr-12 border rounded-lg"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-sm"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                  
                      {passwordError && (
                        <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                      )}
                    </>
                  )}
                  
  <>
    <div className="mb-5">
      <label className="font-semibold text-sm">OTP</label>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg"
        required
      />
    </div>

    {/* ✅ Resend OTP text */}
    <p className="text-sm text-gray-600 mb-4 text-center">
  {timer > 0 ? (
    <span>
      Resend OTP in <span className="font-semibold">{timer}s</span>
    </span>
  ) : (
    <>
      Didn't receive OTP?{" "}
      <button
        type="button"
        onClick={handleResendOtp}
        disabled={resendLoading}
        className="text-blue-600 font-semibold hover:underline"
      >
        {resendLoading ? "Sending..." : "Resend OTP"}
      </button>
    </>
  )}
</p>


    <button
      type="submit"
      className="w-full bg-orange-500 text-white py-3 rounded-lg"
    >
      Reset password
    </button>
  </>


            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgotpassword;
