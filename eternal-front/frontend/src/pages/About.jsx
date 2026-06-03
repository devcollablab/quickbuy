import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SectionHeading from "../components/ui/SectionHeading";
import ScrollReveal from "../components/ui/ScrollReveal";
import Button from "../components/ui/Button";
import SafeImage from "../components/ui/SafeImage";
import { IMG } from "../data/products";

export default function About() {
  return (
    <div className="pt-24 pb-28 md:pb-16 min-h-screen bg-cream">
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <SafeImage
          src={IMG.lifestyle}
          fallback={IMG.lifestyleFallback}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-cream/75" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center px-4 max-w-3xl"
        >
          <p className="text-gold-dark text-xs tracking-[0.4em] uppercase mb-4">Our Story</p>
          <h1 className="font-display text-5xl md:text-7xl text-stone-800 mb-6">
            The Legacy of <span className="text-gradient-gold">Eternal Stand</span>
          </h1>
          <p className="text-stone-600 leading-relaxed">
            Born from a passion for olfactory artistry, Eternal Stand crafts fragrances that transcend moments — becoming memories etched in time.
          </p>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading
          label="Philosophy"
          title="Where Scent Becomes Legacy"
          subtitle="We believe fragrance is the invisible signature of greatness."
        />

        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <ScrollReveal>
            <SafeImage
              src="/images/petal-floral.jpg"
              fallback={IMG.heroFallback}
              alt="Perfume craftsmanship"
              className="rounded-2xl w-full aspect-[4/3] object-cover glow-gold"
            />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="space-y-6 text-stone-600 leading-relaxed">
              <p>
                Every Eternal Stand bottle is a testament to meticulous craftsmanship. We source premium oils from the finest regions, blending tradition with innovation.
              </p>
              <p>
                Inspired by the houses of Paris and Milan, our design language speaks luxury — warm elegance, golden accents, and bottles that belong on the finest vanities.
              </p>
              <p>
                From Smoky&apos;s adventurous woody depth to Petal Desire&apos;s floral warmth, each fragrance tells a story waiting to become yours.
              </p>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Premium Oils", desc: "Ethically sourced, long-lasting ingredients from master perfumers." },
            { title: "Artisan Blending", desc: "Small-batch production ensuring consistency and exclusivity." },
            { title: "Timeless Design", desc: "Bottles and packaging worthy of the legacy they hold." },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <div className="glass rounded-2xl p-8 text-center hover:border-gold/30 transition-colors">
                <h3 className="font-display text-2xl text-gold-dark mb-3">{item.title}</h3>
                <p className="text-stone-500 text-sm">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="text-center mt-20">
          <Link to="/collection">
            <Button variant="primary">Explore Our Collection</Button>
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
