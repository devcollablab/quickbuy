import React, { useState } from 'react';
import { ShoppingCart, LogIn, Search, UserCircle, SearchIcon } from 'lucide-react';
import Login from './Login';
import Signup from './Signup';
import { useNavigate } from 'react-router-dom';
import CartModal from './CartModal';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
 

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search for:', searchQuery);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12">
          
          {/* Brand Name - Left */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">Shoppy</h1>
          </div>

          {/* Search Bar - Middle (Hidden on mobile) */}
          <form onSubmit={handleSearch} className="flex flex-1 mx-4 md:mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none focus:border-blue-600 bg-transparent"

              />
             
            </div>
          </form>

          {/* Cart and Login - Right */}
          <div className="flex items-center space-x-3 md:space-x-6">
          {/* Login Button - Hidden on mobile */}
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="hidden sm:flex items-center space-x-1 px-4 py-1 rounded-lg
bg-red-100
border border-red-300
text-red-700
hover:bg-red-200
transition-colors">

              <span>Login</span>
            </button>
            
            {/* Cart Button */}
            <button 
             onClick={() => setIsCartOpen(true)}
            className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <ShoppingCart size={22} />
              {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span> */}
            </button>
            
            {/* User Circle - Hidden on small mobile */}
            <button 
              onClick={() => navigate('/profile')}
              className="relative text-gray-700 hover:text-blue-600 transition-colors">
              <UserCircle size={22} />
            </button>

          </div>
        </div>

       
      </div>

      {/* Login Modal */}
      <Login
        isOpen={isLoginOpen}
        setIsOpen={setIsLoginOpen}
        onOpenSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Signup isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
    </header>
  );
}