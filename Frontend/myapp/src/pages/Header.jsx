import React, { useState } from "react";
import { ShoppingCart, UserCircle, ChevronDown } from "lucide-react";
import Login from "./Login";
import Signup from "./Signup";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  debugger;
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate("/explore", {
        state: { search: searchQuery },
      });
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  const handleCartClick = () => {
    if (!isLoggedIn) {
      alert("Please login first");
      setIsLoginOpen(true); // ✅ optional: auto open login modal
      return;
    }
  
    navigate("/cart");
  };
  

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12">
          
          {/* Brand */}
          <div className="flex-shrink-0">
            <h1
              onClick={() => navigate("/")}
              className="text-2xl font-bold text-gray-900 cursor-pointer"
            >
              Shoppy
            </h1>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 mx-4 md:mx-8">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none focus:border-blue-600 bg-transparent"
            />
          </form>

          {/* Right Side */}
          <div className="flex items-center space-x-4 md:space-x-6">

            {/* LOGIN OR USER */}
            {isLoggedIn ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600"
                >
                  <UserCircle size={22} />
                  <span>
                  {user?.full_name  || "User"}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="hidden sm:flex items-center px-4 py-1 rounded-lg
                bg-red-100 border border-red-300 text-red-700
                hover:bg-red-200 transition"
              >
                Login
              </button>
            )}

            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="relative text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart size={22} />
            </button>

            {/* Profile icon (mobile quick access) */}
            <button
              onClick={() => navigate("/profile")}
              className="text-gray-700 hover:text-blue-600 transition-colors sm:hidden"
            >
              <UserCircle size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Login
        isOpen={isLoginOpen}
        setIsOpen={setIsLoginOpen}
        onOpenSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <Signup isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
    </header>
  );
}
