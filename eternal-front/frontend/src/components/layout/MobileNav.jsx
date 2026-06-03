import { NavLink } from "react-router-dom";
import { Home, Grid3X3, Sparkles, Info, Mail } from "lucide-react";

const links = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/collection", icon: Grid3X3, label: "Shop" },
  { to: "/coming-soon", icon: Sparkles, label: "Soon" },
  { to: "/about", icon: Info, label: "About" },
  { to: "/contact", icon: Mail, label: "Contact" },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 safe-area-pb">
      <div className="flex justify-around items-center py-2 px-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
                isActive ? "text-gold" : "text-white/50"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] tracking-wider uppercase">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
