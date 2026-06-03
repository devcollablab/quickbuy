import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-cream flex flex-col items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="font-display text-5xl md:text-7xl text-gradient-gold mb-4"
      >
        Eternal Stand
      </motion.div>
      <motion.div className="w-32 h-0.5 bg-stone-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gold"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
      </motion.div>
      <p className="mt-6 text-xs tracking-[0.3em] uppercase text-stone-400">Loading legacy...</p>
    </motion.div>
  );
}
