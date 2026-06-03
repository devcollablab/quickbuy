import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../ui/SafeImage";

export default function ComingSoonCard({ product, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <Link to="/coming-soon" className="block">
        <div className="relative overflow-hidden rounded-2xl aspect-[3/4] glass">
          <SafeImage
            src={product.image}
            fallback={product.fallback}
            alt={product.name}
            className="w-full h-full object-cover blur-[2px] scale-110 opacity-90"
          />
          <div className="absolute inset-0 bg-cream/40" />
          <span className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gold text-white text-[10px] tracking-widest uppercase font-bold rounded-full z-10 shadow-md">
            Coming Soon
          </span>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="font-display text-2xl md:text-3xl text-stone-800 mb-2">{product.name}</h3>
            <p className="text-sm text-stone-600">{product.tagline}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
