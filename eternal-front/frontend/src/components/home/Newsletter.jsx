import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Button from "../ui/Button";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    showToast("Welcome to the Eternal Stand circle!");
    setEmail("");
  };

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 section-cream">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto glass-gold rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-blush/30" />
        <div className="relative z-10">
          <Mail className="w-10 h-10 text-gold mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-5xl text-stone-800 mb-4">Join the Legacy</h2>
          <p className="text-stone-500 text-sm md:text-base mb-8 max-w-md mx-auto">
            Be the first to discover new launches, exclusive offers, and fragrance stories.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-5 py-3 rounded-full bg-white border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-gold/50"
              required
            />
            <Button type="submit" variant="primary" className="shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
