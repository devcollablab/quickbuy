import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import Button from "../ui/Button";

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authView,
    setAuthView,

    login,
    signup,
    verifyOtp,
    resendOtp,

    forgotPassword,
    resetPassword,

    googleLogin,
  } = useAuth();

  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const close = () => {
    setAuthModalOpen(false);

    setEmail("");
    setPassword("");
    setOtp("");

    setResetOtp("");
    setNewPassword("");

    setShowPassword(false);

    setAuthView("login");
  };

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  // ---------------------------------------
  // LOGIN
  // ---------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await login(email, password);

      showToast("Welcome back!");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // SIGNUP SEND OTP
  // ---------------------------------------
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!passwordRegex.test(password)) {
      showToast(
        "Password must contain uppercase, lowercase, number & special character",
        "error"
      );

      return;
    }

    setLoading(true);

    try {
      await signup(email, password);

      showToast("OTP sent to your email");

      setAuthView("signupOtp");
    } catch (err) {
      showToast(
        err?.response?.data?.detail || "Failed to send OTP",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // VERIFY OTP
  // ---------------------------------------
  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp) {
      showToast("Enter OTP", "error");

      return;
    }

    setLoading(true);

    try {
      await verifyOtp(otp);

      showToast("Account created successfully 🎉");

      close();
    } catch (err) {
      showToast(
        err?.response?.data?.detail || "OTP verification failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // RESEND OTP
  // ---------------------------------------
  const handleResend = async () => {
    try {
      await resendOtp();

      showToast("OTP resent 📩");
    } catch (err) {
      showToast(
        err?.response?.data?.detail || "Failed to resend OTP",
        "error"
      );
    }
  };

  // ---------------------------------------
  // GOOGLE LOGIN
  // ---------------------------------------
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);

      await googleLogin(credentialResponse.credential);

      showToast("Google login successful");
    } catch (err) {
      showToast("Google login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // FORGOT PASSWORD
  // ---------------------------------------
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await forgotPassword(email);

      showToast("Password reset OTP sent");

      setAuthView("resetPassword");
    } catch (err) {
      showToast(
        err?.response?.data?.detail || "Failed to send reset OTP",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // RESET PASSWORD
  // ---------------------------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await resetPassword({
        email,
        otp: resetOtp,
        new_password: newPassword,
      });

      showToast("Password reset successful");

      setAuthView("login");
    } catch (err) {
      showToast(
        err?.response?.data?.detail || "Password reset failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass rounded-2xl p-8 relative"
          >
            {/* CLOSE */}
            <button
              onClick={close}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* TITLE */}
            <h2 className="font-display text-3xl text-stone-800 mb-2">
              {authView === "login" && "Sign In"}

              {authView === "signup" && "Create Account"}

              {authView === "signupOtp" && "Verify Email"}

              {authView === "forgotPassword" && "Forgot Password"}

              {authView === "resetPassword" && "Reset Password"}
            </h2>

            {/* SUBTITLE */}
            <p className="text-stone-500 text-sm mb-6">
              {authView === "signupOtp"
                ? "Enter the OTP sent to your email"
                : authView === "forgotPassword"
                ? "We'll send you an OTP to reset your password"
                : authView === "resetPassword"
                ? "Enter OTP and your new password"
                : "Connect to your account"}
            </p>

            {/* LOGIN */}
            {authView === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white outline-none"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-500"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <button
                  type="button"
                  onClick={() => setAuthView("forgotPassword")}
                  className="w-full text-sm text-gold-dark"
                >
                  Forgot Password?
                </button>

                <p className="text-center text-sm text-stone-500">
                  New here?{" "}
                  <button
                    type="button"
                    className="text-gold-dark"
                    onClick={() => setAuthView("signup")}
                  >
                    Create account
                  </button>
                </p>
              </form>
            )}

            {/* SIGNUP + OTP */}
            {(authView === "signup" ||
              authView === "signupOtp") && (
              <form
                onSubmit={
                  authView === "signup"
                    ? handleSignup
                    : handleVerify
                }
                className="space-y-4"
              >
                {/* EMAIL */}
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={authView === "signupOtp"}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white outline-none disabled:bg-stone-100"
                />

                {/* PASSWORD */}
                {authView === "signup" && (
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-500"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                )}

                {/* OTP */}
                {authView === "signupOtp" && (
                  <input
                    type="text"
                    required
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white outline-none"
                  />
                )}

                {/* SEND OTP */}
                {authView === "signup" && (
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading
                      ? "Sending OTP..."
                      : "Send OTP"}
                  </Button>
                )}

                {/* VERIFY OTP */}
                {authView === "signupOtp" && (
                  <>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading
                        ? "Verifying..."
                        : "Verify OTP"}
                    </Button>

                    <button
                      type="button"
                      onClick={handleResend}
                      className="w-full text-sm text-gold-dark"
                    >
                      Resend OTP
                    </button>
                  </>
                )}

                <p className="text-center text-sm text-stone-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-gold-dark"
                    onClick={() => setAuthView("login")}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* FORGOT PASSWORD */}
            {authView === "forgotPassword" && (
              <form
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white outline-none"
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading
                    ? "Sending..."
                    : "Send Reset OTP"}
                </Button>

                <p className="text-center text-sm text-stone-500">
                  Remembered your password?{" "}
                  <button
                    type="button"
                    className="text-gold-dark"
                    onClick={() => setAuthView("login")}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* RESET PASSWORD */}
            {authView === "resetPassword" && (
              <form
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <input
                  type="text"
                  required
                  placeholder="OTP"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white outline-none"
                />

                <input
                  type="password"
                  required
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white outline-none"
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading
                    ? "Resetting..."
                    : "Reset Password"}
                </Button>

                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full text-sm text-gold-dark"
                >
                  Resend OTP
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}