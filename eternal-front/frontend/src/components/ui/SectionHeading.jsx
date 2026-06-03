import { motion } from "framer-motion";

export default function SectionHeading({ label, title, subtitle, align = "center" }) {
  const alignClass = align === "left" ? "text-left" : "text-center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className={`mb-12 md:mb-16 ${alignClass}`}
    >
      {label && (
        <span className="text-gold-dark text-xs tracking-[0.3em] uppercase font-medium block mb-3">
          {label}
        </span>
      )}
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-stone-800">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-stone-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
