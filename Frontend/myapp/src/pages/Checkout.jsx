import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle } from "lucide-react";
import customAxios from "../components/customAxios";
import { urlCreateOrder, urlGetCart, urlGetProfile, urlUpdateProfile, urlVerifyPayment } from "../../endpoints";
import "../styles/Checkout.css";
import Toast from "../components/Toast";

const Checkout = () => {

  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [locationLoading, setLocationLoading] = useState(false);
const [locationStatus, setLocationStatus] = useState("");
const [toast, setToast] = useState({ message: "", type: "success" });

  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    paymentMethod: "card"
  });

  // ---------------- FETCH CART ----------------
  const fetchCart = async () => {
    debugger;
    try {
      const res = await customAxios.get(urlGetCart);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error("Cart fetch failed", err);
    }
  };

  // ---------------- FETCH PROFILE ----------------
  const fetchProfile = async () => {
    try {
      const res = await customAxios.get(urlGetProfile);
  
      console.log("PROFILE RESPONSE:", res.data); // debug
  
      setFormData(prev => ({
        ...prev,
        firstName: res.data.full_name || "",
        phone: res.data.phone_number || "",
        address: res.data.address_line || "",
        city: res.data.city || "",
        state: res.data.state || "",
        country: res.data.country || "",
        pincode: res.data.pincode || ""
      }));
  
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchProfile();
  }, []);

  // ---------------- CART TOTAL ----------------
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const loadRazorpay = () => {
    debugger;
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const payNow = async () => {
    const loaded = await loadRazorpay();
  
    if (!loaded) {
      setToast({
        message: "Razorpay SDK failed to load",
        type: "error"
      });
      return;
    }
  
    if (!window.Razorpay) {
      
      setToast({
        message: "Razorpay not available",
        type: "alert"
      });
      return;
    }
  
    try {
      const res = await customAxios.post(urlCreateOrder, {
        amount: cartTotal * 100
      });
  
      const data = res.data;
  
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpay_order_id,
  
        name: "My Shop",
        description: "Order Payment",
  
        prefill: {
          name: formData.firstName,
          contact: formData.phone
        },
  
        handler: async function (response) {
          
          const verifyRes = await customAxios.post(urlVerifyPayment, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
  
          alert("Order ID: " + verifyRes.data.order_id);
          setToast({
            message: "Payment Success!",
            type: "success"
          });
          navigate("/profile", { state: { section: "orders" } });

  
        },
  
        theme: {
          color: "#f97316"
        }
      };
  
      const rzp = new window.Razorpay(options);
  
      rzp.on("payment.failed", function (response) {
        console.error(response.error);
        
        setToast({
          message: "Payment Failed",
          type: "error"
        });
      });
  
      rzp.open();
  
    } catch (error) {
      console.error("Payment error", error);
    }
  };
  // ---------------- INPUT CHANGE ----------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // FULL NAME (letters + spaces only)
    if (name === "firstName") {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) return;
    }
  
    // CITY
    if (name === "city") {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) return;
    }
  
    // STATE
    if (name === "state") {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) return;
    }
  
    // COUNTRY
    if (name === "country") {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) return;
    }
  
    // PHONE (max 10 digits)
    if (name === "phone") {
      const regex = /^[0-9]{0,10}$/;
      if (!regex.test(value)) return;
    }
  
    // PINCODE (max 6 digits)
    if (name === "pincode") {
      const regex = /^[0-9]{0,6}$/;
      if (!regex.test(value)) return;
    }
  
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ---------------- PLACE ORDER ----------------
  const handleSubmit = (e) => {
    e.preventDefault();

    // simulate order success
    setTimeout(() => {
      setIsSuccess(true);
      setCartItems([]);
    }, 1500);
  };

  // ---------------- EMPTY CART ----------------
  if (cartItems.length === 0 && !isSuccess) {
    navigate("/cart");
    return null;
  }

  // ---------------- SUCCESS SCREEN ----------------
  // if (isSuccess) {
  //   return (
  //     <div className="checkout-success container text-center">
  //       <CheckCircle size={64} className="success-icon" />
  //       <h2>Order Confirmed!</h2>
  //       <p>
  //         Thank you for your purchase. Your order number is{" "}
  //         <strong>#LUX{Math.floor(Math.random() * 100000)}</strong>.
  //       </p>
  //       <p className="success-message">
  //         We've sent a confirmation email with your order details.
  //       </p>
  //       <Link to="/shop" className="btn btn-accent mt-4">
  //         Continue Shopping
  //       </Link>
  //     </div>
  //   );
  // }

  const handleEditSave = async () => {
    if (isEditing) {
      const nameRegex = /^[A-Za-z\s]+$/;
      const phoneRegex = /^[0-9]{10}$/;
      const pincodeRegex = /^[0-9]{6}$/;
  
      if (!nameRegex.test(formData.firstName)) {
        setToast({
          message: "Name should contain only letters",
          type: "error"
        });
        return;
      }
  
      if (!phoneRegex.test(formData.phone)) {
        setToast({
          message: "Phone must be 10 digits",
          type: "error"
        });
        return;
      }
  
      if (!pincodeRegex.test(formData.pincode)) {
        setToast({
          message: "Pincode must be 6 digits",
          type: "error"
        });

        return;
      }
  
      try {
        // ✅ ADD API CALL HERE
        await customAxios.put(urlUpdateProfile, {
          full_name: formData.firstName,
          phone_number: formData.phone,
          address_line: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode
        });
  
        
        setToast({
          message: "Profile updated successfully",
          type: "success"
        });
      } catch (err) {
        console.error(err);
        
        setToast({
          message: "Failed to update profile",
          type: "error"
        });
        return; // stop toggle if failed
      }
    }
  
    // toggle edit mode AFTER save
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
  
          setFormData(prev => ({
            ...prev,
            address: addr.road || prev.address,
            city: addr.city || addr.town || addr.village || "",
            state: addr.state || "",
            country: addr.country || "",
            pincode: addr.postcode || ""
          }));
  
          setIsEditing(true); // enable editing after fetch
          setLocationStatus("Location fetched successfully");
          setToast({
            message: "📍 We Found Your Address — Edit if Needed",
            type: "warning"
          });
        } catch (error) {
          setLocationStatus("Failed to fetch address");
        }
  
        setLocationLoading(false);
      },
      () => {
        setLocationStatus("Permission denied");
        setLocationLoading(false);
      }
    );
  };

  return (
    <>
    <Toast
     message={toast.message}
     type={toast.type}
     onClose={() => setToast({ message: "" })}
    />
    <div className="checkout-page container">

      <div className="breadcrumbs">
        <Link to="/cart">Cart</Link> <ChevronRight size={14} />
        <span className="current">Checkout</span>
      </div>

      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">

        {/* ================= FORM ================= */}
        <form className="checkout-form" onSubmit={handleSubmit}>

        <div className="form-section shipping-section">

  <div className="section-header">
    <h2>Shipping Information</h2>

    <button
      type="button"
      className="edit-btn"
      onClick={handleEditSave}
    >
      {isEditing ? "Save" : "Edit"}
    </button>
  </div>
  <div className="location-box">
  <button
    type="button"
    className="location-btn"
    onClick={findMyLocation}
    disabled={locationLoading}
  >
    {locationLoading ? "Detecting..." : "📍 Find My Location"}
  </button>

  {locationStatus && (
    <p className="location-status">{locationStatus}</p>
  )}
</div>

  <div className="form-grid">

    {/* FULL NAME */}
    <div className="field">
      <label>Full Name</label>
      {isEditing ? (
        <input
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
        />
      ) : (
        <p className="view-text">{formData.firstName || "-"}</p>
      )}
    </div>

    {/* PHONE */}
    <div className="field">
      <label>Phone</label>
      {isEditing ? (
        <input
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
      ) : (
        <p className="view-text">{formData.phone || "-"}</p>
      )}
    </div>

    {/* ADDRESS (FULL WIDTH) */}
    <div className="field full">
      <label>Address</label>
      {isEditing ? (
        <input
          name="address"
          value={formData.address}
          onChange={handleInputChange}
        />
      ) : (
        <p className="view-text">{formData.address || "-"}</p>
      )}
    </div>

    {/* COUNTRY */}
    <div className="field">
      <label>Country</label>
      {isEditing ? (
        <input
          name="country"
          value={formData.country}
          onChange={handleInputChange}
        />
      ) : (
        <p className="view-text">{formData.country || "-"}</p>
      )}
    </div>

    {/* STATE */}
    <div className="field">
      <label>State</label>
      {isEditing ? (
        <input
          name="state"
          value={formData.state}
          onChange={handleInputChange}
        />
      ) : (
        <p className="view-text">{formData.state || "-"}</p>
      )}
    </div>

    {/* CITY */}
    <div className="field">
      <label>City</label>
      {isEditing ? (
        <input
          name="city"
          value={formData.city}
          onChange={handleInputChange}
        />
      ) : (
        <p className="view-text">{formData.city || "-"}</p>
      )}
    </div>

    {/* PINCODE */}
    <div className="field">
      <label>Pincode</label>
      {isEditing ? (
        <input
          name="pincode"
          value={formData.pincode}
          onChange={handleInputChange}
        />
      ) : (
        <p className="view-text">{formData.pincode || "-"}</p>
      )}
    </div>

  </div>
</div>
          {/* ================= PAYMENT ================= */}

          {/* <div className="form-section">
            <h2>Payment Method</h2>

            <div className="payment-methods">

              <label className={`payment-option ${formData.paymentMethod === "card" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === "card"}
                  onChange={handleInputChange}
                />
                Credit / Debit Card
              </label>

              {/* <label className={`payment-option ${formData.paymentMethod === "cod" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleInputChange}
                />
                Cash on Delivery
              </label> */}
{/* 
            </div>
          </div>  */}

          <button 
          type = "button"
          onClick={payNow}
           className="btn btn-accent place-order-btn">
            Place Order
          </button>

        </form>

        {/* ================= ORDER SUMMARY ================= */}

        <div className="checkout-summary">

          <h2>Order Summary</h2>

          <div className="summary-items">

            {cartItems.map((item) => (

              <div key={item.id} className="summary-item">

                <img src={item.image_url} alt={item.name} />

                <div className="summary-item-info">
                  <h4>{item.name}</h4>
                  <p>Qty: {item.quantity}</p>
                </div>

                <div className="summary-item-price">
                ₹{(item.price * item.quantity).toFixed(2)}
                </div>

              </div>

            ))}

          </div>

          <div className="summary-totals">

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>

          </div>

        </div>

      </div>
    </div>
    </>
  );
};

export default Checkout;