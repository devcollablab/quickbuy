import { stats, IMG } from "../../data/products";
import ScrollReveal from "../ui/ScrollReveal";
import SafeImage from "../ui/SafeImage";

export default function StatsSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden section-white">
      <SafeImage
        src={IMG.lifestyle}
        fallback={IMG.lifestyleFallback}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15"
        aria-hidden
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.15}>
              <div className="text-center glass rounded-2xl p-10 md:p-12 border-gold/15 hover:border-gold/35 transition-colors">
                <p className="font-display text-5xl md:text-6xl text-gradient-gold mb-3">{stat.value}</p>
                <p className="text-sm tracking-[0.2em] uppercase text-stone-500">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
