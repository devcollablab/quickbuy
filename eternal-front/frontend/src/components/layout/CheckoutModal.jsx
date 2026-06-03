import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../data/products";
import Button from "../ui/Button";
import { useToast } from "../../context/ToastContext";
import { api, endpoints, getErrorMessage } from "../../lib/api";
import customAxios from "../../components/customAxios";
import { urlCreateOrder, urlVerifyPayment } from "../../../endpoints";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutModal() {
  const { checkoutOpen, setCheckoutOpen, items, total, clearCart, fetchCart } = useCart();
  const { user, requireAuth } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState("pay");
  const [paying, setPaying] = useState(false);

  const close = () => {
    setCheckoutOpen(false);
    setStep("pay");
  };

  const payWithRazorpay = async () => {
    if (!requireAuth()) return;
    if (items.length === 0) {
      showToast("Your cart is empty");
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
    if (!razorpayKey) {
      showToast("Razorpay key missing — set VITE_RAZORPAY_KEY in .env");
      return;
    }

    setPaying(true);
    const idempotencyKey = crypto.randomUUID();

    try {
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        showToast("Could not load payment gateway");
        return;
      }

      const { data } = await customAxios.post(urlCreateOrder, { amount: 0 });

      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpay_order_id,
        name: "Eternal Stand",
        description: "Luxury Fragrance Order",
        prefill: { email: user?.email || "" },
        handler: async (response) => {
          try {
            await customAxios.post(urlVerifyPayment,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { "Idempotency-Key": idempotencyKey } }
            );
            await clearCart();
            await fetchCart();
            setStep("success");
            showToast("Payment successful!");
          } catch (err) {
            showToast(getErrorMessage(err), "error");
          }
        },
        theme: { color: "#c9a962" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => showToast("Payment failed", "error"));
      rzp.open();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setPaying(false);
    }
  };

  if (!checkoutOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
        onClick={close}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg glass rounded-2xl p-8 relative"
        >
          <button onClick={close} className="absolute top-4 right-4 text-stone-500">
            <X className="w-5 h-5" />
          </button>

          {step === "pay" ? (
            <>
              <h2 className="font-display text-3xl text-stone-800 mb-2">Checkout</h2>
              <p className="text-stone-500 text-sm mb-4">
                Secure payment via Razorpay · {items.length} item(s)
              </p>
              <p className="text-gradient-gold font-display text-2xl mb-6">
                Total: {formatPrice(total)}
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={payWithRazorpay}
                disabled={paying || items.length === 0}
              >
                {paying ? "Processing..." : "Pay with Razorpay"}
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="font-display text-3xl text-stone-800 mb-2">Thank You!</h2>
              <p className="text-stone-500">Your legacy fragrance is on its way.</p>
              <Button variant="outline" className="mt-6" onClick={close}>
                Continue Shopping
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
