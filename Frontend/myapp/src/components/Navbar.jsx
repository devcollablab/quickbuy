import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ChevronDown } from 'lucide-react';
import '../styles/Navbar.css';
import { urlGetProducts } from '../../endpoints';
import customAxios from './customAxios';
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch products from backend
useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customAxios.get(urlGetProducts);

      if (response.status === 200 && response.data) {
        setProducts(response.data);
        console.log("products", response.data);
      } else {
        console.error("Failed to fetch products");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);


  
  const searchResults =
  searchQuery.trim() === ""
    ? []
    : products
        .filter(
          (p) =>
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        
        {/* Mobile menu toggle */}
        <button 
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          LUXE SCENTS
        </Link>

        {/* Desktop Navigation */}
        <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link></li>
          
          {/* Categories Dropdown */}
          <li 
            className="dropdown"
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={() => setIsCategoryOpen(false)}
          >
            <span className="dropdown-link">
              Categories <ChevronDown size={16} />
            </span>
            {isCategoryOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/shop?category=Men">Men</Link></li>
                <li><Link to="/shop?category=Women">Women</Link></li>
                <li><Link to="/shop?category=Unisex">Unisex</Link></li>
                <li><Link to="/shop?category=Luxury Collection">Luxury Collection</Link></li>
                <li><Link to="/shop?category=New Arrivals">New Arrivals</Link></li>
                <li><Link to="/shop?category=Best Sellers">Best Sellers</Link></li>
              </ul>
            )}
          </li>
          
          <li><Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
          <li><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>
        </ul>

        {/* Icons */}
        <div className="nav-icons">
          <button 
            className="icon-btn search-btn" 
            aria-label="Search"
            onClick={() => {
              setIsSearchOpen(true);
              setTimeout(() => document.getElementById('search-input')?.focus(), 100);
            }}
          >
            <Search size={22} />
          </button>
          <Link to="/profile" className="icon-btn profile-icon" aria-label="Profile">
  <User size={22} />
  {!user && <span className="login-tag">Login</span>}
</Link>
          <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
            <ShoppingBag size={22} />
            <span className="cart-badge">{}</span>
          </Link>
        </div>
      </div>

      {/* Full-Screen Search Overlay */}
      <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`}>
        <div className="search-overlay-content">
          <button 
            className="close-search-btn" 
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
          >
            <X size={32} />
          </button>
          
          <div className="search-input-wrapper">
            <Search size={28} className="search-input-icon" />
            <input 
              id="search-input"
              type="text" 
              placeholder="Search for fragrances, notes, or categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>

          {searchQuery && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                <ul>
                  {searchResults.map(p => (
                    <li key={p.id}>
                      <Link 
                        to={`/product/${p.id}`} 
                        className="search-result-item"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <img src={p.image_url} alt={p.name} />
                        <div className="search-result-info">
                          <h4>{p.name}</h4>
                          <p>{p.category} - ${p.price}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-results">
                  <p>No products found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
