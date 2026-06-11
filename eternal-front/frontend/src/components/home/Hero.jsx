import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Button from "../ui/Button";
import SmokeParticles from "./SmokeParticles";
import SafeImage from "../ui/SafeImage";
import { IMG } from "../../data/products";
import { useState, useEffect } from "react";

export default function Hero() {
  const banners = [
    
    IMG.banner1,
    IMG.banner2,
    
  ];

  const [currentBanner, setCurrentBanner] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  }, 3000); // change every 3 sec

  return () => clearInterval(interval);
}, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-cream">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${IMG.hero})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-cream/85 to-cream" />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,169,98,0.15)_0%,_transparent_65%)]"
        aria-hidden
      />

      <FloatingOrbs />
      <SmokeParticles />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-32">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gold-dark text-xs md:text-sm tracking-[0.4em] uppercase mb-6 font-medium"
        >
          Luxury Fragrances
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-stone-800"
        >
          <span className="text-gradient-gold">Eternal</span>
          <br />
          <span>Stand</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-lg md:text-xl text-stone-600 font-light tracking-wide max-w-xl mx-auto"
        >
          Fragrance that leaves a legacy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/collection">
            <Button variant="primary">Explore Collection</Button>
          </Link>
          <Link to="/collection?filter=men">
            <Button variant="outline">Shop Now</Button>
          </Link>
        </motion.div>

        <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.2 }}
  className="w-full mt-16"
>
  <SafeImage
    src={banners[currentBanner]}
    alt={`Banner ${currentBanner + 1}`}
    className="w-full max-w-7xl mx-auto h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] object-cover rounded-xl shadow-2xl"
  />
</motion.div>

        
      </div>


      <motion.a
        href="#featured"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-stone-400 hover:text-gold transition-colors z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </motion.a>
    </section>
  );
}

function FloatingOrbs() {
  return (
    <>
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blush/40 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-gold/15 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </>
  );
}
