import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { formatPrice, getImageFallback } from "../../data/products";
import { useProducts } from "../../context/ProductsContext";
import SafeImage from "../ui/SafeImage";

export default function SearchBar({ open, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { catalog } = useProducts();

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
  
    const q = query.toLowerCase();
  
    return catalog
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.volume?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.gender?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, catalog]);

  const goToProduct = (id) => {
    navigate(`/product/${id}`);
    onClose();
    setQuery("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-start justify-center pt-24 px-4"
        >
          <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="relative w-full max-w-xl glass rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
              <Search className="w-5 h-5 text-gold" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fragrances..."
                className="flex-1 bg-transparent outline-none text-stone-800 placeholder:text-stone-400"
              />
              <button onClick={onClose} className="text-stone-500 hover:text-stone-800" type="button">
                <X className="w-5 h-5" />
              </button>
            </div>
            {results.length > 0 && (
              <ul className="mt-3 max-h-64 overflow-y-auto">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => goToProduct(p.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-stone-100 text-left"
                    >
                      <SafeImage
                        src={p.images[0]}
                        fallback={getImageFallback(p.images[0])}
                        alt=""
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-stone-800">
                          {p.name} {p.volume}
                        </p>
                        <p className="text-xs text-gold-dark">{formatPrice(p.price)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
