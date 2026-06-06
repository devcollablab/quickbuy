import { IMG } from "../data/products";

function normalizeImages(product) {
  // Product Details API
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images
      .map((img) => (typeof img === "string" ? img : img?.url))
      .filter(Boolean);
  }

  // Product List API
  if (product?.image_url) {
    return [product.image_url];
  }

  return [IMG.hero];
}

function mapCategory(apiCategory) {
  const c = String(apiCategory || "").toLowerCase().trim();

  if (c === "women") return "women";
  if (c === "men") return "men";
  if (c === "unisex") return "combo";
  if (c === "gift") return "combo";
  if (c === "combo") return "combo";

  return "men";
}

function mapGender(category) {
  const map = {
    men: "Men's",
    women: "Women's",
    combo: "Unisex Set",
  };

  return map[category] || "Unisex";
}

function slugify(name) {
  return (name || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ===========================
   PRODUCT LIST
=========================== */

export function mapApiProductsToCards(apiProducts = []) {
  
  const cards = [];

  for (const p of apiProducts) {
    const images = normalizeImages(p);

    const category = mapCategory(p.category);
    const slug = slugify(p.name);

    const base = {
      productId: p.id,
      slug,
      name: p.name,
      brand: p.brand || "Eternal Stand",
      description: p.description || "",

      category,
      gender: mapGender(category),

      images,

      topNotes: p.brand || "Signature",
      middleNotes: p.category || "Luxury",
      baseNotes: "Woody Warm",

      rating: 4.8,
      reviews: 120,

      badge:
        category === "men"
          ? "Best Seller"
          : category === "women"
          ? "Editor's Pick"
          : null,
    };

    if (Array.isArray(p.variants) && p.variants.length) {
      p.variants.forEach((v) => {
        cards.push({
          ...base,

          id: `${p.id}-${v.id}`,

          variantId: v.id,

          volume: v.size_ml
            ? `${v.size_ml}mL`
            : "Standard",

          price: Number(v.price || 0),

          stockCount: Number(v.stock || 0),

          inStock: Number(v.stock || 0) > 0,
        });
      });
    } else {
      cards.push({
        ...base,

        id: String(p.id),

        variantId: null,

        volume: "Standard",

        price: Number(p.price || 0),

        stockCount: 0,

        inStock: true,
      });
    }
  }

  return cards;
}

/* ===========================
   PRODUCT DETAIL
=========================== */

export function mapApiProductDetail(apiProduct) {
  if (!apiProduct) return null;

  const images = normalizeImages(apiProduct);

  const category = mapCategory(apiProduct.category);
  const slug = slugify(apiProduct.name);

  const variants = (apiProduct.variants || []).map((v) => ({
    id: `${apiProduct.id}-${v.id}`,

    productId: apiProduct.id,

    variantId: v.id,

    slug,

    name: apiProduct.name,

    brand: apiProduct.brand,

    description: apiProduct.description,

    volume: v.size_ml
      ? `${v.size_ml}mL`
      : "Standard",

    price: Number(v.price || 0),

    stockCount: Number(v.stock || 0),

    inStock: Number(v.stock || 0) > 0,

    images,

    category,

    gender: mapGender(category),

    topNotes: apiProduct.brand || "Signature",
    middleNotes: apiProduct.category || "Luxury",
    baseNotes: "Woody Warm",

    rating: 4.8,
    reviews: 120,
  }));

  if (!variants.length) {
    variants.push({
      id: String(apiProduct.id),

      productId: apiProduct.id,

      variantId: null,

      slug,

      name: apiProduct.name,

      brand: apiProduct.brand,

      description: apiProduct.description,

      volume: "Standard",

      price: 0,

      stockCount: 0,

      inStock: true,

      images,

      category,

      gender: mapGender(category),

      topNotes: apiProduct.brand || "Signature",
      middleNotes: apiProduct.category || "Luxury",
      baseNotes: "Woody Warm",

      rating: 4.8,
      reviews: 120,
    });
  }

  return {
    productId: apiProduct.id,

    slug,

    name: apiProduct.name,

    brand: apiProduct.brand,

    description: apiProduct.description,

    images,

    category,

    gender: mapGender(category),

    variants,
  };
}

export function parseProductRouteId(routeId) {
  if (!routeId) {
    return {
      productId: null,
      variantId: null,
    };
  }

  if (routeId.includes("-")) {
    const [productId, variantId] = routeId.split("-");

    return {
      productId: Number(productId),
      variantId: Number(variantId),
    };
  }

  return {
    productId: Number(routeId),
    variantId: null,
  };
}

export const CATEGORY_API = {
  all: null,
  men: "Men",
  women: "Women",
  combo: "Unisex",
};