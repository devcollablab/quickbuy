import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../data/products";
import Button from "../ui/Button";

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, total, checkout } = useCart();

  const handleCheckout = () => {
    setIsOpen(false);
    checkout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[80]"
            onClick={() => setIsOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass z-[90] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="font-display text-2xl text-stone-800">Your Cart</h2>
              <button onClick={() => setIsOpen(false)}><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-stone-500 text-center py-12">Your cart is empty</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 glass rounded-xl p-3">
                    <img src={item.images?.[0] || item.image_url} alt="" className="w-20 h-24 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-lg truncate">{item.name}</p>
                      <p className="text-xs text-white/50">{item.volume}</p>
                      <p className="text-gold mt-1">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item, item.quantity - 1)} className="p-1 rounded bg-stone-100">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, item.quantity + 1)} className="p-1 rounded bg-stone-100">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeFromCart(item)} className="ml-auto p-1 text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-white/60">Total</span>
                  <span className="font-display text-2xl text-gradient-gold">{formatPrice(total)}</span>
                </div>
                <Button variant="primary" className="w-full" onClick={handleCheckout}>
                  Checkout
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
