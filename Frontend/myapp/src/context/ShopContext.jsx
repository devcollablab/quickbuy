import React, { createContext, useState, useEffect } from 'react';

// Detailed Specs Profile Generation
const baseSpecs = {
  volume: "90 ml (0.09 litres)",
  concentration: "Eau de Parfum (EDP)",
  longevity: "6 to 8 hours on skin; longer on clothes",
  bestSuitedFor: "Spring and summer daytime wear, office settings, casual and semi-formal occasions",
  countryOfOrigin: "France",
  fragranceProfile: "Spicy, woody, and aromatic, with a crisp citrus opening, aromatic green heart, and a warm, musky base"
};

// Hardcoded Product Data
const initialProducts = [
  { id: 1, name: "Midnight Rose", category: "Women", price: 120, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600", description: "An elegant blend of dark rose, patchouli, and vanilla.", rating: 4.8, isNew: true, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Bergamot, Pink Pepper", middleNotes: "Damascus Rose, Jasmine", baseNotes: "Vanilla, Patchouli, White Musk" }
  },
  { id: 2, name: "Oud Wood Reserve", category: "Men", price: 180, image: "https://images.unsplash.com/photo-1595425970377-c9703bc48b2a?auto=format&fit=crop&q=80&w=600", description: "A masculine scent featuring rare oud wood, sandalwood, and amber.", rating: 4.9, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Rosewood, Cardamom, Chinese Pepper", middleNotes: "Oud Wood, Sandalwood, Vetiver", baseNotes: "Tonka Bean, Vanilla, Amber" }
  },
  { id: 3, name: "Citrus Bloom", category: "Unisex", price: 95, image: "https://images.unsplash.com/photo-1588691888463-b67fcfcb7fb0?auto=format&fit=crop&q=80&w=600", description: "Fresh and vibrant with notes of Italian lemon, bergamot, and sweet orange.", rating: 4.5, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Italian Lemon, Bergamot, Grapefruit", middleNotes: "Orange Blossom, White Tea", baseNotes: "Cedarwood, Light Musk" }
  },
  { id: 4, name: "Velvet Amber", category: "Luxury Collection", price: 250, image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=600", description: "Our most exclusive creation, golden amber mixed with warm spices.", rating: 5.0, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Coriander, Saffron", middleNotes: "Golden Amber, Rich Myrrh", baseNotes: "Madagascar Vanilla, Labdanum" }
  },
  { id: 5, name: "Ocean Breeze", category: "Men", price: 85, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600", description: "A crisp, aquatic fragrance perfect for everyday wear.", rating: 4.3, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Marine Notes, Green Apple", middleNotes: "Lotus, Violet Leaf", baseNotes: "Cedarboard, Ambergris" }
  },
  { id: 6, name: "Jasmine Noir", category: "Women", price: 110, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600", description: "Mysterious night-blooming jasmine with a touch of musk.", rating: 4.7, isNew: true, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Green Almomd, Licorice", middleNotes: "Sambac Jasmine, Gardenia", baseNotes: "Tonka Bean, Woods" }
  },
  { id: 7, name: "Sandalwood Spice", category: "Unisex", price: 105, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=600", description: "Earthy sandalwood balanced with warm cardamom and nutmeg.", rating: 4.6, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Cardamom, Nutmeg, Cinnamon", middleNotes: "Sandalwood, Orris", baseNotes: "Leather, Soft Musk" }
  },
  { id: 8, name: "Imperial Gold", category: "Luxury Collection", price: 300, image: "https://images.unsplash.com/photo-1582211594533-268fec19385b?auto=format&fit=crop&q=80&w=600", description: "Pure luxury in a bottle. Notes of saffron, gold flakes, and rare white florals.", rating: 4.9, isNew: true, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Saffron, Bitter Almond", middleNotes: "Egyptian Jasmine, Cedar", baseNotes: "Musk, Woody Notes, Ambergris" }
  },
  { id: 9, name: "Vanilla Twilight", category: "Women", price: 140, image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=600", description: "A comfortable, soothing mix of Madagascar vanilla and soft cedar.", rating: 4.8, isNew: true, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Lavender, Bergamot", middleNotes: "Iris, Jasmine Rose", baseNotes: "Tahitian Vanilla, Sandalwood" }
  },
  { id: 10, name: "Bergamot Woods", category: "Men", price: 160, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600", description: "Sharp bergamot layered perfectly over deep cedarwood notes.", rating: 4.6, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Calabrian Bergamot, Pepper", middleNotes: "Sichuan Pepper, Lavender, Vetiver", baseNotes: "Ambroxan, Cedar, Labdanum" }
  },
  { id: 11, name: "Orchid Elegance", category: "Women", price: 175, image: "https://images.unsplash.com/photo-1628149458602-df94709d7df9?auto=format&fit=crop&q=80&w=600", description: "Rare black orchid combined with spicy incense and dark chocolate.", rating: 4.9, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "French Jasmine, Black Truffle", middleNotes: "Black Orchid, Spices", baseNotes: "Patchouli, Sandalwood, Dark Chocolate" }
  },
  { id: 12, name: "Royal Sapphire", category: "Luxury Collection", price: 400, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600", description: "The crown jewel. A masterful blend of blue lotus, iris, and silver musk.", rating: 5.0, isNew: true, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Blue Lotus, Mandarin", middleNotes: "Iris, Heliotrope", baseNotes: "Silver Musk, Cashmere Wood" }
  },
  { id: 13, name: "Crimson Velvet", category: "Women", price: 135, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600", description: "Deep red rose intertwined with warm tobacco and spicy saffron.", rating: 4.8, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Pink Pepper, Saffron", middleNotes: "Bulgarian Rose, Tobacco", baseNotes: "Oud, Cedarwood" }
  },
  { id: 14, name: "White Iris", category: "Unisex", price: 145, image: "https://images.unsplash.com/photo-1595425970377-c9703bc48b2a?auto=format&fit=crop&q=80&w=600", description: "Soft, powdery iris combined with crisp white musk and a hint of pear.", rating: 4.7, isNew: true, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Pear, Ambrette Seed", middleNotes: "Iris, Turkish Rose", baseNotes: "White Musk, Vetiver" }
  },
  { id: 15, name: "Desert Mirage", category: "Men", price: 195, image: "https://images.unsplash.com/photo-1588691888463-b67fcfcb7fb0?auto=format&fit=crop&q=80&w=600", description: "Dry cedar, hot sand accord, and sweet date notes for a mysterious aura.", rating: 4.5, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Bergamot, Lavender", middleNotes: "Date Accord, Cedarwood", baseNotes: "Incense, Sandalwood" }
  },
  { id: 16, name: "Platinum Noir", category: "Luxury Collection", price: 320, image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=600", description: "An intoxicating evening scent featuring rare black agarwood and dark vanilla.", rating: 4.9, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Saffron, Rose", middleNotes: "Black Agarwood, Patchouli", baseNotes: "Dark Vanilla, Amber" }
  },
  { id: 17, name: "Sunkissed Citrus", category: "Unisex", price: 85, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600", description: "Bursting with grapefruit, mandarin, and fresh green leaves.", rating: 4.6, isNew: true, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Grapefruit, Blood Orange", middleNotes: "Mint, Tomato Leaf", baseNotes: "Oakmoss, Musk" }
  },
  { id: 18, name: "Golden Amber", category: "Women", price: 150, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600", description: "A radiant, glowing amber wrapped in honeycomb and subtle floracy.", rating: 4.8, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Plum, Yellow Mandarin", middleNotes: "Honeycomb, Jasmine", baseNotes: "Golden Amber, Sandalwood" }
  },
  { id: 19, name: "Silver Cedar", category: "Men", price: 130, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=600", description: "Crisp, metallic aldehydes met with deep, grounding Virginian cedar.", rating: 4.4, isNew: false, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Aldehydes, Juniper Berries", middleNotes: "Iris, Violet", baseNotes: "Virginian Cedar, Iso E Super" }
  },
  { id: 20, name: "Midnight Jasmine", category: "Women", price: 165, image: "https://images.unsplash.com/photo-1582211594533-268fec19385b?auto=format&fit=crop&q=80&w=600", description: "Intensely floral night-blooming jasmine grounded by sensual patchouli.", rating: 4.9, isNew: true, isFeatured: true,
    specs: { ...baseSpecs, topNotes: "Cassis, Mandarin", middleNotes: "Night-Blooming Jasmine, Ylang-Ylang", baseNotes: "Patchouli, Vanilla" }
  }
];

export const productsData = initialProducts;

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [products] = useState(productsData);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, amount) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + amount;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const clearCart = () => setCartItems([]);

  return (
    <ShopContext.Provider value={{
      products,
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      cartTotal,
      cartCount,
      clearCart
    }}>
      {children}
    </ShopContext.Provider>
  );
};
