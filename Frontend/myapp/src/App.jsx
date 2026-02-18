import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./pages/Header";
import Navigation from "./pages/Navigation";
import Banner from "./pages/Banner";
import Grid from "./pages/Grid";
import Footer from "./pages/Footer";
import Explore from "./pages/Explore";
import UserProfile from "./pages/Userprofile";
import Adminlogin from "./pages/Adminlogin";
import Adminsite from "./pages/Adminsite";
import Productview from "./pages/Productview";
import Signup from "./pages/Signup";
import CartPage from "./pages/CartPage";
import Forgotpassword from "./pages/Forgotpassword";


const Home = () => (
  <>
    <Banner />
    <Navigation />
    <Grid />
  </>
);

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/adminlogin" element={<Adminlogin />} />
        <Route path="/adminsite" element={<Adminsite />} />
        <Route path="/products/:id" element={<Productview />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
