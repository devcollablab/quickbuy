import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, Heart, Sun, Moon, User, LogOut } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import SearchBar from "./SearchBar";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/collection", label: "Collection" },
  { to: "/about", label: "About" },
  { to: "/coming-soon", label: "Coming Soon" },
  { to: "/contact", label: "Contact" },
  { to: "/profile", label: "profile" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, setIsOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const { toggleTheme, isDark } = useTheme();
  const { user, openAuth, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass py-3 shadow-md" : "bg-cream/80 backdrop-blur-md py-5 md:py-6"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl md:text-3xl tracking-wide text-stone-800">
            <span className="text-gradient-gold">Eternal</span> Stand
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-xs tracking-[0.2em] uppercase transition-colors ${
                    isActive ? "text-gold-dark font-medium" : "text-stone-600 hover:text-gold-dark"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3 text-stone-700">
            {!authLoading && (
              user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-stone-500 max-w-[120px] truncate">{user?.email?.split("@")[0]}</span>
                  {/* <button
                    type="button"
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-stone-100"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button> */}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs tracking-widest uppercase rounded-full border border-gold/40 hover:bg-gold/10"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              )
            )}
            <button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-stone-100" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            {/* <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-stone-100" aria-label="Toggle theme">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button> */}
            <button onClick={() => navigate("/collection")} className="p-2 rounded-full hover:bg-stone-100 relative" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {wishCount}
                </span>
              )}
            </button>
            <button
  onClick={() => {
    
    setIsOpen(true);
  }}
  className="p-2 rounded-full hover:bg-stone-100 relative"
  aria-label="Cart"
>
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2" aria-label="Menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <motion.div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm glass p-8 flex flex-col"
            >
              <button onClick={() => setMenuOpen(false)} className="self-end p-2 text-stone-600">
                <X className="w-6 h-6" />
              </button>
              <div className="mt-6 mb-4 border-b border-stone-200 pb-4">
                {user ? (
                  <button
                    type="button"
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="text-sm text-stone-600 hover:text-gold-dark"
                  >
                    Sign out ({user.email})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { openAuth("login"); setMenuOpen(false); }}
                    className="text-sm text-gold-dark tracking-widest uppercase"
                  >
                    Sign In
                  </button>
                )}
              </div>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="block py-4 text-2xl font-display border-b border-stone-200 text-stone-800 hover:text-gold-dark"
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
