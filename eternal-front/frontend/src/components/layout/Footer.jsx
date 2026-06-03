import { Link } from "react-router-dom";
import { Share2, Globe, MessageCircle, Play, Mail, MapPin, Phone } from "lucide-react";

const social = [
  { icon: Share2, href: "#", label: "Instagram" },
  { icon: Globe, href: "#", label: "Facebook" },
  { icon: MessageCircle, href: "#", label: "Twitter" },
  { icon: Play, href: "#", label: "Youtube" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-cream-dark border-t border-gold/15 pt-16 pb-28 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Link to="/" className="font-display text-3xl text-stone-800">
              <span className="text-gradient-gold">Eternal</span> Stand
            </Link>
            <p className="mt-4 text-stone-500 text-sm leading-relaxed">
              Crafting timeless fragrances for those who dare to leave a legacy.
            </p>
            <div className="flex gap-3 mt-6">
              {social.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-gold/20 hover:text-gold-dark text-stone-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold-dark mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><Link to="/collection" className="hover:text-gold-dark">Collection</Link></li>
              <li><Link to="/about" className="hover:text-gold-dark">About Us</Link></li>
              <li><Link to="/coming-soon" className="hover:text-gold-dark">Coming Soon</Link></li>
              <li><Link to="/contact" className="hover:text-gold-dark">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold-dark mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><Link to="/collection?filter=men" className="hover:text-gold-dark">Men&apos;s</Link></li>
              <li><Link to="/collection?filter=women" className="hover:text-gold-dark">Women&apos;s</Link></li>
              <li><Link to="/collection?filter=combo" className="hover:text-gold-dark">Gift Sets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold-dark mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold" /> hello@eternalstand.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold" /> +91 98765 43210</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" /> Mumbai, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Eternal Stand. All rights reserved.</p>
          <p>Fragrance that leaves a legacy.</p>
        </div>
      </div>
    </footer>
  );
}
