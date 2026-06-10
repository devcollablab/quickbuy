import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { formatPrice, getImageFallback } from "../../data/products";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import Button from "../ui/Button";
import SafeImage from "../ui/SafeImage";
import { useAuth } from "../../context/AuthContext";

export default function ProductCard({ product, index = 0 }) {
  
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToast();
  const wished = isWishlisted(product.id);
  const fallback = getImageFallback(product.images[0]);
  const { requireAuth } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) {
      showToast("Please login first", "error");
      return;
    }
    addToCart(product);
    showToast(`${product.name} ${product.volume} added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    showToast(wished ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <motion.div className="relative overflow-hidden rounded-2xl glass transition-all duration-500 group-hover:glow-gold group-hover:border-gold/40">
          {product.badge && (
            <span className="absolute top-4 left-4 z-10 px-3 py-1 text-[10px] tracking-widest uppercase bg-gold text-luxury-black rounded-full font-semibold">
              {product.badge}
            </span>
          )}
          <button
            onClick={handleWishlist}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-gold/20 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${wished ? "fill-gold text-gold" : "text-stone-500"}`} />
          </button>

          <motion.div
  className="aspect-[3/4] overflow-hidden bg-cream-dark"
  whileHover={{ scale: 1.03 }}
  transition={{ duration: 0.6 }}
>
  <SafeImage
    src={product?.images?.[0]}
    fallback={getImageFallback(product?.images?.[0])}
    alt={`${product.name} ${product.volume}`}
    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
  />

  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/25 via-transparent to-transparent pointer-events-none" />
</motion.div>

          <div className="absolute inset-x-0 bottom-0 p-4 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Button variant="primary" className="flex-1 py-2 text-xs" onClick={handleAddToCart}>
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </Button>
            <Link
              to={`/product/${product.id}`}
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="w-4 h-4 text-stone-600" />
            </Link>
          </div>
        </motion.div>

        <div className="mt-5 space-y-2">
          <p className="text-[10px] tracking-[0.25em] uppercase text-gold-dark">{product.gender}</p>
          <h3 className="font-display text-xl md:text-2xl text-stone-800 group-hover:text-gold-dark transition-colors">
            {product.name}{" "}
            <span className="text-stone-400 text-lg">{product.volume}</span>
          </h3>
          <p className="text-xs text-stone-500 line-clamp-1">
            {product.topNotes} · {product.middleNotes} · {product.baseNotes}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="font-display text-2xl text-gradient-gold">{formatPrice(product.price)}</span>
            <span className="text-xs text-stone-400">★ {product.rating}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
