import { motion } from "framer-motion";

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 5,
}));

export default function SmokeParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gold/10 blur-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            bottom: "-10%",
          }}
          animate={{
            y: [0, -900],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 0.5, 0],
            scale: [1, 2, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
