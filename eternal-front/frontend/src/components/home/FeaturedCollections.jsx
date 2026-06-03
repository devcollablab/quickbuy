import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import ScrollReveal from "../ui/ScrollReveal";
import SafeImage from "../ui/SafeImage";
import { collections } from "../../data/products";

export default function FeaturedCollections() {
  return (
    <section id="featured" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto section-white">
      <SectionHeading
        label="Curated For You"
        title="Featured Collections"
        subtitle="Explore our signature lines crafted for distinct personalities and moments."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {collections.map((col, i) => (
          <ScrollReveal key={col.id} delay={i * 0.1}>
            <Link to={col.path} className="group block relative overflow-hidden rounded-2xl aspect-[4/5] md:aspect-[3/4] shadow-lg">
              <SafeImage
                src={col.image}
                fallback={col.fallback}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent" />
              <div className="absolute inset-0 border border-white/20 rounded-2xl group-hover:border-gold/50 transition-colors pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <p className="text-gold-light text-xs tracking-widest uppercase mb-2">{col.subtitle}</p>
                <h3 className="font-display text-3xl md:text-4xl mb-4">{col.title}</h3>
                <span className="inline-flex items-center gap-2 text-sm text-white/90 group-hover:text-gold-light transition-colors">
                  Discover <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
