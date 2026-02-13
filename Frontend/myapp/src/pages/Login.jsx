import React, { useState } from 'react';
import customAxios from '../components/customAxios';
import { urlLogin } from '../../endpoints';
import { useAuth } from '../context/AuthContext';


const Login = ({ isOpen, setIsOpen, onOpenSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!username || !password) {
      alert("Please enter email and password");
      return;
    }
  
    try {
      debugger;
      const response = await customAxios.post(urlLogin, {
        email: username,
        password: password,
      });
      alert("Login successfully 🎉");
      console.log("Login success:", response.data);
  
      // 🔐 Store tokens
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      login(response.data.access_token);
  
      // Reset & close modal
      setUsername("");
      setPassword("");
      setIsOpen(false);
  
    } catch (error) {
      console.error("Login failed:", error);
  
      const message =
        error.response?.data?.detail || // FastAPI uses 'detail'
        "Invalid email or password";
  
      alert(message);
    }
  };
  

  const closeModal = () => {
    setUsername("");
    setPassword("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Login Modal */}
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Blue Section */}
          <div className="bg-blue-500 text-white p-6 md:p-12 w-full md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Login</h1>
              <p className="text-sm md:text-lg text-blue-100 mb-4 md:mb-8">
                Get access to your Orders, Wishlist and Recommendations
              </p>
            </div>

            {/* Illustration Placeholder */}
            <div className="flex justify-center hidden md:flex">
              <svg
                className="w-48 h-48 text-blue-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-6 md:p-12 w-full md:w-1/2 relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>

            <form onSubmit={handleLogin}>
              {/* Username Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Username or Email
                </label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
               
                <a href="#" className="text-blue-500 hover:text-blue-700 text-sm font-semibold">
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition duration-300 mb-4 text-sm md:text-base"
              >
                Login
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-gray-600 text-sm">
                New to Shoppy?{' '}
                <button
  type="button"
  onClick={() => {
    if (typeof onOpenSignup === 'function') {
      onOpenSignup();
    } else {
      // fallback: close this modal
      setIsOpen(false);
    }
  }}
  className="outline-none border-0 bg-transparent text-blue-500 hover:text-blue-700 font-semibold"
>
  Create an account
</button>
              </p>
            </form>

            {/* Terms & Conditions */}
            <p className="text-xs text-gray-500 text-center mt-6">
              By continuing, you agree to Shoppy's{' '}
              <a href="#" className="text-blue-500 hover:text-blue-700">
                Terms of Use
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-500 hover:text-blue-700">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;