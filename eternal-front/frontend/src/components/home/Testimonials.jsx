import { Star, Quote } from "lucide-react";
import { testimonials } from "../../data/products";
import SectionHeading from "../ui/SectionHeading";

export default function Testimonials() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto section-white">
      <SectionHeading
        label="Voices of Legacy"
        title="What Our Clients Say"
        subtitle="Stories from those who wear Eternal Stand."
      />
      <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="min-w-[280px] md:min-w-0 snap-center glass rounded-2xl p-6 md:p-8 flex flex-col"
          >
            <Quote className="w-8 h-8 text-gold/40 mb-4" />
            <p className="text-stone-600 text-sm leading-relaxed flex-1">{t.text}</p>
            <div className="flex gap-1 mt-4 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-gold text-gold" />
              ))}
            </div>
            <div>
              <p className="font-display text-lg text-stone-800">{t.name}</p>
              <p className="text-xs text-stone-400">{t.location} · {t.product}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
