import { img, imgList, FALLBACK, LOCAL } from "./images";

const smokyBase = {
  name: "Smoky",
  category: "men",
  gender: "Men's",
  description:
    "A bold masculine fragrance that opens with adventure-fruity notes, evolves through vibrant citrus, and settles into a deep woody base. Crafted for the modern gentleman who commands every room.",
  topNotes: "Adventure-fruity",
  middleNotes: "Citrus",
  baseNotes: "Woody",
  imageKeys: ["smokyMens", "lifestyleHand", "lifestyleBoutique"],
  rating: 4.9,
  reviews: 2847,
  badge: "Best Seller",
};

const petalBase = {
  name: "Petal Desire",
  category: "women",
  gender: "Women's",
  description:
    "An enchanting floral symphony that blooms with a luxurious bouquet, dances through delicate floral notes, and warms into a woody embrace. Timeless femininity in every drop.",
  topNotes: "Floral bouquet",
  middleNotes: "Floral Notes",
  baseNotes: "Woody warm",
  imageKeys: ["petalFloral", "petalRose", "collectionPink"],
  rating: 4.8,
  reviews: 3124,
  badge: "Editor's Pick",
};

const smokyPrices = { "30mL": 369, "50mL": 429, "100mL": 619 };
const petalPrices = { "30mL": 419, "50mL": 499, "100mL": 679 };

function withImages(base) {
  const images = imgList(...base.imageKeys);
  const { imageKeys, ...rest } = base;
  return { ...rest, images };
}

function createVariants(base, prices, slug) {
  const productBase = withImages(base);
  return ["30mL", "50mL", "100mL"].map((volume) => ({
    ...productBase,
    id: `${slug}-${volume.replace("mL", "")}`,
    slug,
    volume,
    price: prices[volume],
    inStock: true,
    stockCount: Math.floor(Math.random() * 30) + 12,
  }));
}

export const products = [
  ...createVariants(smokyBase, smokyPrices, "smoky"),
  ...createVariants(petalBase, petalPrices, "petal-desire"),
  {
    ...withImages({
      name: "Men + Women Combo",
      category: "combo",
      gender: "Unisex Set",
      description:
        "The perfect pairing — Smoky 50mL and Petal Desire 50mL presented in an exclusive gift box. Share the legacy of Eternal Stand.",
      topNotes: "Mixed Collection",
      middleNotes: "Dual Signature",
      baseNotes: "Woody Harmony",
      imageKeys: ["comboGift", "smokyMens", "petalFloral"],
      rating: 5.0,
      reviews: 1563,
      badge: "Limited Edition",
    }),
    id: "combo-mw-50",
    slug: "combo-pack",
    volume: "50mL + 50mL",
    price: 879,
    inStock: true,
    stockCount: 24,
  },
];

export const comingSoonProducts = [
  {
    id: "midnight-raw",
    name: "Midnight Raw",
    tagline: "Dark. Raw. Unforgettable.",
    image: img("comingSoon1"),
    fallback: FALLBACK.comingSoon1,
  },
  {
    id: "urban-bleu",
    name: "Urban Bleu",
    tagline: "City lights in a bottle.",
    image: img("lifestyleHand"),
    fallback: FALLBACK.lifestyleHand,
  },
  {
    id: "night-vibe",
    name: "Night Vibe",
    tagline: "After hours elegance.",
    image: img("petalRose"),
    fallback: FALLBACK.petalRose,
  },
  {
    id: "oud-royale",
    name: "Oud Royale",
    tagline: "Royalty in every note.",
    image: img("comingSoon2"),
    fallback: FALLBACK.comingSoon2,
  },
];

export const collections = [
  {
    id: "men",
    title: "For Him",
    subtitle: "Bold & Woody",
    image: img("smokyMens"),
    fallback: FALLBACK.smokyMens,
    path: "/collection?filter=men",
  },
  {
    id: "women",
    title: "For Her",
    subtitle: "Floral & Warm",
    image: img("petalFloral"),
    fallback: FALLBACK.petalFloral,
    path: "/collection?filter=women",
  },
  {
    id: "combo",
    title: "Coming-Soon",
    subtitle: "Curated Duos",
    image: img("comboGift"),
    fallback: FALLBACK.comboGift,
    path: "/coming-soon",
  },
];

export const IMG = {
  hero: img("heroBrand"),
  heroFallback: FALLBACK.heroBrand,
  lifestyle: img("lifestyleBoutique"),
  lifestyleFallback: FALLBACK.lifestyleBoutique,
  banner1: img("banners"),
  banner1Fallback: FALLBACK.banners,
  banner2: img("bannerss"),
  banner2Fallback: FALLBACK.bannerss,
};

export const testimonials = [
  { name: "Arjun Mehta", location: "Mumbai", rating: 5, text: "Smoky 100mL lasts all day. Got compliments at three meetings. Eternal Stand is my signature now.", product: "Smoky" },
  { name: "Priya Sharma", location: "Delhi", rating: 5, text: "Petal Desire is pure elegance. The floral notes are sophisticated without being overpowering.", product: "Petal Desire" },
  { name: "Rahul Verma", location: "Bangalore", rating: 5, text: "The combo pack was the perfect anniversary gift. Premium packaging, incredible scents.", product: "Combo Pack" },
  { name: "Ananya Reddy", location: "Hyderabad", rating: 5, text: "Finally a luxury brand that feels worth every rupee. The 50mL is perfect for travel.", product: "Petal Desire" },
];

export const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "Premium", label: "Oils" },
  { value: "12hr+", label: "Long Lasting" },
];

export const marqueeSlogans = [
  "Fragrance that leaves a legacy",
  "Crafted for eternity",
  "Where scent becomes memory",
  "Luxury in every drop",
  "Eternal Stand — Timeless Elegance",
  "Discover your signature",
];

export const productReviews = [
  { author: "Vikram S.", rating: 5, date: "2 weeks ago", text: "Absolutely stunning longevity. Worth every penny." },
  { author: "Meera K.", rating: 5, date: "1 month ago", text: "The packaging alone feels like a luxury experience." },
  { author: "David L.", rating: 4, date: "3 weeks ago", text: "Rich, complex notes. My go-to evening fragrance." },
];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}

export function getRelatedProducts(product, limit = 4) {
  if (!product) return products.slice(0, limit);
  return products
    .filter((p) => p.id !== product.id && (p.slug === product.slug || p.category === product.category))
    .slice(0, limit);
}

export function formatPrice(price) {
  return `₹${price.toLocaleString("en-IN")}`;
}

export function getImageFallback(imagePath) {
  const key = Object.keys(LOCAL).find((k) => LOCAL[k] === imagePath);
  return key ? FALLBACK[key] : undefined;
}
