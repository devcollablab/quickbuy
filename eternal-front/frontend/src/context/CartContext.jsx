import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

import { api, endpoints, getErrorMessage } from "../lib/api";
import { useAuth } from "./AuthContext";
import customAxios from "../components/customAxios";
import { urlAddToCart, urlDeleteCart, urlGetCart, urlUpdateCart } from "../../endpoints";

const CartContext = createContext(null);

function mapServerItem(item) {
  return {
    id: item.variant_id
      ? `${item.product_id}-${item.variant_id}`
      : String(item.product_id),

    productId: item.product_id,
    variantId: item.variant_id ?? null,

    name: item.name,
    volume: item.size_ml ? `${item.size_ml}mL` : "Standard",

    price: item.price,
    quantity: item.quantity,

    images: item.image_url ? [item.image_url] : [],
    image_url: item.image_url,

    subtotal: item.subtotal,
    category: item.category,
  };
}

export function CartProvider({ children }) {
  const { isAuthenticated, requireAuth } = useAuth();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [syncing, setSyncing] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setTotal(0);
      return;
    }

    setSyncing(true);

    try {
      const { data } = await customAxios.get(urlGetCart);

      const mapped = (data.items || []).map(mapServerItem);

      setItems(mapped);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Cart fetch failed:", getErrorMessage(err));
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      //  LOGIN REQUIRED
      if (!isAuthenticated) {
        requireAuth();
        return false;
      }

      try {
        await customAxios.post(urlAddToCart, {
          product_id:
            product.productId ??
            Number(String(product.id).split("-")[0]),

          variant_id: product.variantId ?? undefined,

          quantity,
        });

        await fetchCart();

        setIsOpen(true);

        return true;
      } catch (err) {
        console.error("Add to cart failed:", getErrorMessage(err));
        return false;
      }
    },
    [isAuthenticated, requireAuth, fetchCart]
  );

  const removeFromCart = useCallback(
    async (item) => {
      
      try {
        const params = item.variantId
          ? { variant_id: item.variantId }
          : { product_id: item.productId };

          await customAxios.delete(urlDeleteCart, { params });

        await fetchCart();
      } catch (err) {
        console.error("Remove failed:", getErrorMessage(err));
      }
    },
    [isAuthenticated, requireAuth, fetchCart]
  );

  const updateQuantity = useCallback(
    async (item, quantity) => {
      debugger;
      
      if (quantity < 1) {
        await removeFromCart(item);
        return;
      }

      try {
        await customAxios.put(urlUpdateCart, {
          product_id: item.productId,
          variant_id: item.variantId ?? undefined,
          quantity,
        });

        await fetchCart();
      } catch (err) {
        console.error("Update failed:", getErrorMessage(err));
      }
    },
    [isAuthenticated, requireAuth, fetchCart, removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setTotal(0);
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const checkout = useCallback(() => {
    if (!requireAuth()) return false;

    setCheckoutOpen(true);

    return true;
  }, [requireAuth]);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        count,

        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart,

        isOpen,
        setIsOpen,

        checkoutOpen,
        setCheckoutOpen,

        checkout,

        syncing,
        isAuthenticated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }

  return ctx;
}