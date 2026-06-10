import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/products/ProductCard";
import SafeImage from "../components/ui/SafeImage";
import { IMG } from "../data/products";
import { useProducts } from "../context/ProductsContext";

const filters = [
  { id: "all", label: "All" },
  { id: "men", label: "Men's" },
  { id: "women", label: "Women's" },
  
];

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get("filter") || "all";
  const { catalog, loading, error, filterByUiCategory, refetch } = useProducts();

  const filtered = useMemo(
    () => filterByUiCategory(activeFilter),
    [activeFilter, filterByUiCategory, catalog]
  );

  const setFilter = (id) => {
    if (id === "all") setSearchParams({});
    else setSearchParams({ filter: id });
  };

  return (
    <motion.div className="pt-28 pb-28 md:pb-16 min-h-screen bg-cream">
      <section className="relative py-16 md:py-24 px-4 overflow-hidden">
        <SafeImage
          src={IMG.lifestyle}
          fallback={IMG.lifestyleFallback}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-cream/80 to-cream" />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl text-stone-800 mb-4"
          >
            Our <span className="text-gradient-gold">Collection</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-stone-600 max-w-xl mx-auto"
          >
            {loading ? "Loading..." : `${filtered.length} signature fragrances`}
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 glass rounded-lg text-center text-stone-600">
            <p>Could not reach API: {error}</p>
            <button onClick={refetch} className="text-gold-dark mt-2 underline">
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2 rounded-full text-xs tracking-widest uppercase transition-all ${
                activeFilter === f.id
                  ? "bg-gold text-white font-semibold shadow-md"
                  : "glass text-stone-600 hover:border-gold/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-stone-500 py-20">Loading collection...</p>
        ) : (
          <div className="max-w-4xl mx-auto">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-10 justify-items-center">
    {filtered.map((p, i) => (
      <ProductCard key={p.id} product={p} index={i} />
    ))}
  </div>
</div>
        )}
      </div>
    </motion.div>
  );
}
