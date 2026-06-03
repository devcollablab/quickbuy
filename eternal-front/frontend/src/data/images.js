/** Local paths in /public/images — drop your photos here with these filenames. */
export const LOCAL = {
  heroBrand: "/images/hero-brand.png",
  collectionPink: "/images/collection-pink.png",
  lifestyleBoutique: "/images/lifestyle-boutique.png",
  smokyMens: "/images/smoky-mens.png",
  petalFloral: "/images/petal-floral.png",
  petalRose: "/images/petal-rose.png",
  lifestyleHand: "/images/lifestyle-hand.png",
  comboGift: "/images/combo-gift.png",
  comingSoon1: "/images/coming-soon-1.jpg",
  comingSoon2: "/images/coming-soon-2.png",
};

/** Fallback URLs when local files are not present yet */
export const FALLBACK = {
  heroBrand:
    "https://res.cloudinary.com/dukrxsnrf/image/upload/v1777744616/wg2lg4ostorpfc50su1r.png",
  collectionPink:
    "https://res.cloudinary.com/dukrxsnrf/image/upload/v1777744616/wg2lg4ostorpfc50su1r.png",
  lifestyleBoutique:
    "https://res.cloudinary.com/dukrxsnrf/image/upload/v1777744616/wg2lg4ostorpfc50su1r.png",
  smokyMens:
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=2340&auto=format&fit=crop",
  petalFloral:
    "https://images.unsplash.com/photo-1458538977777-0549b2370168?q=80&w=2348&auto=format&fit=crop",
  petalRose:
    "https://images.unsplash.com/photo-1458538977777-0549b2370168?q=80&w=2348&auto=format&fit=crop",
  lifestyleHand:
    "https://res.cloudinary.com/dukrxsnrf/image/upload/v1777744616/wg2lg4ostorpfc50su1r.png",
  comboGift:
    "https://res.cloudinary.com/dukrxsnrf/image/upload/v1777744616/wg2lg4ostorpfc50su1r.png",
  comingSoon1:
    "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80",
  comingSoon2:
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=2340&auto=format&fit=crop",
};

export function img(key) {
  return LOCAL[key] || FALLBACK[key];
}

export function imgList(...keys) {
  return keys.map((k) => img(k));
}
