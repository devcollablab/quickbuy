import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white font-semibold hover:shadow-[0_0_30px_rgba(201,169,98,0.35)]",
  outline:
    "border border-gold/60 text-gold-dark hover:bg-gold/10 hover:border-gold bg-white/50",
  ghost: "text-stone-600 hover:text-gold-dark hover:bg-stone-100",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  as: Component = motion.button,
  ...props
}) {
  return (
    <Component
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm tracking-widest uppercase transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
