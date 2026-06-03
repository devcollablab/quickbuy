import { marqueeSlogans } from "../../data/products";

export default function Marquee() {
  const text = [...marqueeSlogans, ...marqueeSlogans].join("  ✦  ");

  return (
    <div className="py-6 border-y border-gold/20 bg-blush-light overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="text-sm md:text-base tracking-[0.2em] uppercase text-gold-dark font-light px-4">
          {text}
        </span>
        <span className="text-sm md:text-base tracking-[0.2em] uppercase text-gold-dark font-light px-4" aria-hidden>
          {text}
        </span>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
