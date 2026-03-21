import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from 'react';


import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';

import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

import About from './pages/About';
import IntroAnimation from './components/IntroAnimation';
import Explore from "./pages/Explore";
import UserProfile from "./pages/Userprofile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Forgotpassword from "./pages/Forgotpassword";

const App = () => {
const [showIntro, setShowIntro] = useState(true);

// Check if it's the first load
useEffect(() => {
  const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
  if (hasSeenIntro) {
    setShowIntro(false);
  } else {
    sessionStorage.setItem('hasSeenIntro', 'true');
  }
}, []);

return (
  <>
    {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
    <div className={`app-container ${showIntro ? 'hidden-overflow' : ''}`}>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Explore />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/forgotpassword" element={<Forgotpassword />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </>
);
}
export default App;



