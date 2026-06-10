import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  MapPin,
  Edit2,
  Save,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import { formatPrice } from "../../data/products";
import Button from "../ui/Button";

import customAxios from "../../components/customAxios";

import {
  urlCreateOrder,
  urlVerifyPayment,
  urlGetProfile,
  urlUpdateProfile,
} from "../../../endpoints";

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
  const {
    checkoutOpen,
    setCheckoutOpen,
    items,
    total,
    clearCart,
    fetchCart,
  } = useCart();

  const { user, requireAuth } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState("pay");
  const [paying, setPaying] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  useEffect(() => {
    if (checkoutOpen) {
      fetchProfile();
    }
  }, [checkoutOpen]);

  const fetchProfile = async () => {
    try {
      const { data } = await customAxios.get(urlGetProfile);
  
      setFormData({
        firstName: data.full_name || "",
        phone: (data.phone_number || "").replace(/^\+91/, ""),
        address: data.address_line || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
        pincode: data.pincode || "",
      });
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (
      ["firstName", "city", "state", "country"].includes(name)
    ) {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) return;
    }

    if (name === "phone") {
      const regex = /^[0-9]{0,10}$/;
      if (!regex.test(value)) return;
    }

    if (name === "pincode") {
      const regex = /^[0-9]{0,6}$/;
      if (!regex.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSave = async () => {
    if (isEditing) {
  
      // Required fields validation
      if (!formData.firstName.trim()) {
        showToast("Full Name is required", "error");
        return;
      }
  
      if (!formData.phone.trim()) {
        showToast("Phone Number is required", "error");
        return;
      }
  
      if (!formData.address.trim()) {
        showToast("Address is required", "error");
        return;
      }
  
      if (!formData.city.trim()) {
        showToast("City is required", "error");
        return;
      }
  
      if (!formData.state.trim()) {
        showToast("State is required", "error");
        return;
      }
  
      if (!formData.country.trim()) {
        showToast("Country is required", "error");
        return;
      }
  
      if (!formData.pincode.trim()) {
        showToast("Pincode is required", "error");
        return;
      }
  
      // Format validations
      const nameRegex = /^[A-Za-z\s]+$/;
      const phoneRegex = /^[0-9]{10}$/;
      const pincodeRegex = /^[0-9]{6}$/;
  
      if (!nameRegex.test(formData.firstName)) {
        showToast("Name should contain only letters", "error");
        return;
      }
  
      if (!phoneRegex.test(formData.phone)) {
        showToast("Phone number must be exactly 10 digits", "error");
        return;
      }
  
      if (!pincodeRegex.test(formData.pincode)) {
        showToast("Pincode must be exactly 6 digits", "error");
        return;
      }
  
      try {
        await customAxios.put(urlUpdateProfile, {
          full_name: formData.firstName,
          phone_number: `+91${formData.phone}`,
          address_line: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
        });
  
        showToast("Profile updated successfully");
      } catch (err) {
        console.error(err);
        showToast("Failed to update profile", "error");
        return;
      }
    }
  
    setIsEditing(!isEditing);
  };

  const findMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported");
      return;
    }

    setLocationLoading(true);
    setLocationStatus("Detecting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );

          const data = await res.json();
          const addr = data.address || {};

          setFormData((prev) => ({
            ...prev,
            address: addr.road || prev.address,
            city:
              addr.city ||
              addr.town ||
              addr.village ||
              "",
            state: addr.state || "",
            country: addr.country || "",
            pincode: addr.postcode || "",
          }));

          setIsEditing(true);
          setLocationStatus("Location fetched successfully");

          showToast(
            "📍 We found your address. Edit if needed."
          );
        } catch (error) {
          setLocationStatus("Failed to fetch address");
        }

        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setLocationStatus("Permission denied");
      }
    );
  };

  const validateForm = () => {
    const requiredFields = [
      { key: "firstName", label: "Full Name" },
      { key: "phone", label: "Phone Number" },
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "country", label: "Country" },
      { key: "pincode", label: "Pincode" },
    ];
  
    for (const field of requiredFields) {
      if (!formData[field.key]?.trim()) {
        showToast(`${field.label} is required`, "error");
        return false;
      }
    }
  
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      showToast("Enter a valid 10 digit phone number", "error");
      return false;
    }
  
    if (!/^[0-9]{6}$/.test(formData.pincode)) {
      showToast("Enter a valid 6 digit pincode", "error");
      return false;
    }
  
    return true;
  };

  const payWithRazorpay = async () => {
    if (!requireAuth()) return;

    if (!validateForm()) return;

    if (items.length === 0) {
      showToast("Your cart is empty");
      return;
    }

    const razorpayKey =
      import.meta.env.VITE_RAZORPAY_KEY;

    if (!razorpayKey) {
      showToast(
        "Missing VITE_RAZORPAY_KEY in .env",
        "error"
      );
      return;
    }

    setPaying(true);

    const idempotencyKey = crypto.randomUUID();

    try {
      const loaded = await loadRazorpay();

      if (!loaded || !window.Razorpay) {
        showToast(
          "Could not load Razorpay",
          "error"
        );
        return;
      }

      const { data } = await customAxios.post(
        urlCreateOrder,
        {
          amount: total * 100,
        }
      );

      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpay_order_id,

        name: "Eternal Stand",
        description: "Luxury Fragrance Order",

        prefill: {
          name: formData.firstName,
          contact: formData.phone,
          email: user?.email || "",
        },

        handler: async (response) => {
          try {
            await customAxios.post(
              urlVerifyPayment,
              {
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_signature:
                  response.razorpay_signature,
              },
              {
                headers: {
                  "Idempotency-Key":
                    idempotencyKey,
                },
              }
            );

            await clearCart();
            await fetchCart();

            setStep("success");

            showToast(
              "Payment successful!"
            );
          } catch (err) {
            console.error(err);
            showToast(
              "Payment verification failed",
              "error"
            );
          }
        },

        theme: {
          color: "#c9a962",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", () => {
        showToast("Payment failed", "error");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      showToast(
        err?.response?.data?.detail ||
          "Payment failed",
        "error"
      );
    } finally {
      setPaying(false);
    }
  };

  const close = () => {
    setCheckoutOpen(false);
    setStep("pay");
    setLocationStatus("");
  };

  if (!checkoutOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
          }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="glass w-full max-w-2xl rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative"
        >
          <button
            onClick={close}
            className="absolute right-4 top-4 text-stone-500 hover:text-stone-800"
          >
            <X size={20} />
          </button>

          {step === "success" ? (
            <div className="text-center py-10">
              <CheckCircle
                size={72}
                className="mx-auto text-green-500 mb-4"
              />

              <h2 className="font-display text-3xl mb-2">
                Payment Successful
              </h2>

              <p className="text-stone-500 mb-6">
                Your fragrance order has been placed.
              </p>

              <Button
                variant="primary"
                onClick={close}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-3xl">
                  Checkout
                </h2>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Left Side */}
  <div className="lg:col-span-2 space-y-4">
    <button
      type="button"
      onClick={findMyLocation}
      disabled={locationLoading}
      className="w-full border rounded-xl px-4 py-3 flex items-center justify-center gap-2"
    >
      <MapPin size={16} />
      {locationLoading ? "Detecting..." : "Find My Location"}
    </button>

    {locationStatus && (
      <p className="text-xs text-stone-500">
        {locationStatus}
      </p>
    )}

    <input
      className="w-full border rounded-xl p-3"
      placeholder="Full Name"
      name="firstName"
      value={formData.firstName}
      onChange={handleInputChange}
      disabled={!isEditing}
    />

    <input
      className="w-full border rounded-xl p-3"
      placeholder="Phone"
      name="phone"
      value={formData.phone}
      onChange={handleInputChange}
      disabled={!isEditing}
    />

    <input
      className="w-full border rounded-xl p-3"
      placeholder="Address"
      name="address"
      value={formData.address}
      onChange={handleInputChange}
      disabled={!isEditing}
    />

    <div className="grid grid-cols-2 gap-3">
      <input
        className="border rounded-xl p-3"
        placeholder="City"
        name="city"
        value={formData.city}
        onChange={handleInputChange}
        disabled={!isEditing}
      />

      <input
        className="border rounded-xl p-3"
        placeholder="State"
        name="state"
        value={formData.state}
        onChange={handleInputChange}
        disabled={!isEditing}
      />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <input
        className="border rounded-xl p-3"
        placeholder="Country"
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        disabled={!isEditing}
      />

      <input
        className="border rounded-xl p-3"
        placeholder="Pincode"
        name="pincode"
        value={formData.pincode}
        onChange={handleInputChange}
        disabled={!isEditing}
      />
    </div>
    <div className="pt-2">
  <button
    onClick={handleEditSave}
    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
      isEditing
        ? "bg-green-600 text-white hover:bg-green-700"
        : "bg-black text-white border border-stone-700 hover:bg-stone-900"
    }`}
  >
    {isEditing ? (
      <>
        <Save size={14} />
        Save Address
      </>
    ) : (
      <>
        <Edit2 size={14} />
        Edit Address
      </>
    )}
  </button>
</div>
  </div>

  {/* Right Side */}
  <div className="lg:col-span-1">
    <div className="border rounded-2xl p-4 sticky top-4">
      <h3 className="font-semibold mb-3">
        Order Summary
      </h3>

      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-sm"
          >
            <span>
              {item.name} × {item.quantity}
            </span>

            <span>
              {formatPrice(
                item.price * item.quantity
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 flex justify-between font-semibold mb-4">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={payWithRazorpay}
        disabled={paying || items.length === 0}
      >
        {paying
          ? "Processing..."
          : `Pay ${formatPrice(total)}`}
      </Button>
    </div>
  </div>
</div>
           </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}