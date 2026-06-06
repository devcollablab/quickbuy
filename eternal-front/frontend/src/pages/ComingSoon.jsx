import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { comingSoonProducts } from "../data/products";
import ComingSoonCard from "../components/products/ComingSoonCard";
import SectionHeading from "../components/ui/SectionHeading";
import Button from "../components/ui/Button";
import { useToast } from "../context/ToastContext";

export default function ComingSoon() {
  const { showToast } = useToast();

  return (
    <div className="pt-28 pb-28 md:pb-16 min-h-screen">
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <Bell className="w-12 h-12 text-gold mx-auto mb-6" />
          <h1 className="font-display text-5xl md:text-7xl text-stone-800 mb-4">
            The Next <span className="text-gradient-gold">Chapter</span>
          </h1>
          <p className="text-stone-500 leading-relaxed">
            Four extraordinary fragrances are being crafted in our atelier. Join the waitlist to be notified at launch.
          </p>
          <Button
            variant="primary"
            className="mt-8"
            onClick={() => showToast("You're on the waitlist!")}
          >
            Notify Me at Launch
          </Button>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Preview"
          title="Upcoming Launches"
          subtitle="A glimpse into fragrances that will redefine luxury."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {comingSoonProducts.map((p, i) => (
            <ComingSoonCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
