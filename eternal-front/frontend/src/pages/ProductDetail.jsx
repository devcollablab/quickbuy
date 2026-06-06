import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Truck, Shield, Star, Minus, Plus } from "lucide-react";
import { formatPrice, productReviews } from "../data/products";
import { api, endpoints, getErrorMessage } from "../lib/api";
import { mapApiProductDetail, parseProductRouteId } from "../lib/productMapper";
import SafeImage from "../components/ui/SafeImage";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { useProducts } from "../context/ProductsContext";
import ProductCard from "../components/products/ProductCard";
import Button from "../components/ui/Button";
import SectionHeading from "../components/ui/SectionHeading";
import { useAuth } from "../context/AuthContext";
import customAxios from "../components/customAxios";
import { urlGetProductById } from "../../endpoints";


export default function ProductDetail() {
  const { id } = useParams();
  const { getById, getRelated, catalog } = useProducts();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToast();

  const catalogProduct = getById(id);
  const { requireAuth } = useAuth();


  useEffect(() => {
    let cancelled = false;
  
    async function load() {
      setLoading(true);
  
      try {
        // Show catalog data immediately (optional)
        const fromCatalog = getById(id);
  
        if (fromCatalog && !cancelled) {
          setDetail({
            ...fromCatalog,
            images: fromCatalog.images || [],
          });
  
          setSelectedVariant(fromCatalog);
        }
  
        const { productId } = parseProductRouteId(id);
  
        if (!productId) {
          return;
        }
  
        debugger;
  
        const productResponse = await customAxios.get(
          urlGetProductById(productId)
        );
  
        console.log("DETAIL API:", productResponse.data);
  
        const mapped = mapApiProductDetail(productResponse.data);
  
        console.log("MAPPED:", mapped);
  
        if (!cancelled) {
          setDetail(mapped);
  
          const match =
            mapped?.variants?.find((v) => v.id === id) ||
            mapped?.variants?.find(
              (v) => v.variantId === Number(id?.split("-")[1])
            ) ||
            mapped?.variants?.[0];
  
          setSelectedVariant(match);
        }
      } catch (err) {
        if (!cancelled) {
          showToast(getErrorMessage(err), "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
  
    load();
  
    return () => {
      cancelled = true;
    };
  }, [id, catalog, getById, showToast]);
  const sizeVariants = useMemo(() => {
    if (detail?.variants?.length) return detail.variants;
    return catalogProduct ? [catalogProduct] : [];
  }, [detail, catalogProduct]);

  const display = selectedVariant || catalogProduct;
  const displayImages =
  display?.images?.length > 0
    ? display.images
    : ["/placeholder-product.jpg"];

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
  }, [id, display?.id]);

  if (loading) {
    return (
      <motion.div className="pt-32 text-center min-h-screen text-stone-500">
        Loading fragrance...
      </motion.div>
    );
  }

  if (!display) {
    return (
      <motion.div className="pt-32 text-center min-h-screen">
        <p className="text-stone-500 mb-4">Product not found</p>
        <Link to="/collection">
          <Button variant="outline">Back to Collection</Button>
        </Link>
      </motion.div>
    );
  }

  const related = getRelated(display, 4);
  const wished = isWishlisted(display.id);


const handleAddToCart = () => {
  if (!requireAuth()) {
    showToast("Please login first", "error");
    return;
  }

  addToCart(display, quantity);
  showToast(`${display.name} added to cart`);
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 pb-32 md:pb-16 min-h-screen bg-cream"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-2xl overflow-hidden glass glow-gold"
            >
              <SafeImage
  src={displayImages?.[selectedImage]}
  alt={display.name}
  className="w-full h-full object-cover"
/>
            </motion.div>
            <div className="flex gap-3 mt-4">
  {(displayImages || []).map((img, i) => (
    <button
      key={i}
      type="button"
      onClick={() => setSelectedImage(i)}
      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
        selectedImage === i
          ? "border-gold"
          : "border-transparent opacity-60"
      }`}
    >
      <SafeImage
        src={img}
        alt=""
        className="w-full h-full object-cover"
      />
    </button>
  ))}
</div>
          </div>

          <div className="lg:pt-8">
            {display.badge && (
              <span className="inline-block px-3 py-1 text-[10px] tracking-widest uppercase bg-gold/20 text-gold-dark rounded-full mb-4">
                {display.badge}
              </span>
            )}
            <p className="text-gold-dark text-xs tracking-[0.3em] uppercase">{display.gender}</p>
            <h1 className="font-display text-4xl md:text-6xl mt-2 mb-2 text-stone-800">
              {display.name}
            </h1>
            <p className="text-stone-500 text-lg mb-4">{display.volume}</p>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(display.rating) ? "fill-gold text-gold" : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-stone-500">({display.reviews} reviews)</span>
            </div>
            <p className="font-display text-4xl text-gradient-gold mb-6">
              {formatPrice(display.price)}
            </p>
            <p className="text-stone-600 leading-relaxed mb-8">{display.description}</p>

            <div className="glass rounded-xl p-5 mb-6 space-y-3">
              <h3 className="text-xs tracking-widest uppercase text-gold-dark">Fragrance Notes</h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-stone-700">
                <div>
                  <p className="text-stone-400 text-xs">Top</p>
                  <p>{display.topNotes}</p>
                </div>
                <div>
                  <p className="text-stone-400 text-xs">Heart</p>
                  <p>{display.middleNotes}</p>
                </div>
                <div>
                  <p className="text-stone-400 text-xs">Base</p>
                  <p>{display.baseNotes}</p>
                </div>
              </div>
            </div>

            {sizeVariants.length > 1 && (
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-gold-dark mb-3">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizeVariants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        display.id === v.id
                          ? "border-gold bg-gold/10 text-gold-dark"
                          : "border-stone-200 hover:border-gold/40"
                      }`}
                    >
                      {v.volume}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <p className="text-xs tracking-widest uppercase text-gold-dark">Quantity</p>
              <div className="flex items-center glass rounded-full">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center">{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => q + 1)} className="p-3">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-green-600">
                ● In Stock ({display.stockCount ?? "—"} left)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button variant="primary" className="flex-1" onClick={handleAddToCart}>
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </Button>
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(display);
                  showToast(wished ? "Removed from wishlist" : "Added to wishlist");
                }}
                className="w-14 h-14 rounded-full glass flex items-center justify-center hover:bg-gold/10"
              >
                <Heart className={`w-5 h-5 ${wished ? "fill-gold text-gold" : ""}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 glass rounded-lg p-4">
                <Truck className="w-5 h-5 text-gold" />
                <div>
                  <p className="font-medium">Fast Delivery</p>
                  <p className="text-stone-400 text-xs">3-5 business days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 glass rounded-lg p-4">
                <Shield className="w-5 h-5 text-gold" />
                <div>
                  <p className="font-medium">Authentic</p>
                  <p className="text-stone-400 text-xs">100% genuine oils</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <section className="mt-20">
          <SectionHeading label="Reviews" title="Customer Reviews" align="left" />
          <div className="grid md:grid-cols-3 gap-6">
            {productReviews.map((r) => (
              <div key={r.author} className="glass rounded-xl p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-stone-600 text-sm mb-4">{r.text}</p>
                <p className="text-sm font-medium">{r.author}</p>
                <p className="text-xs text-stone-400">{r.date}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHeading label="You May Also Like" title="Related Fragrances" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      </div>

      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 glass border-t border-stone-200 z-30">
        <Button variant="primary" className="w-full" onClick={handleAddToCart}>
          Add to Cart — {formatPrice(display.price * quantity)}
        </Button>
      </div>
    </motion.div>
  );
}
