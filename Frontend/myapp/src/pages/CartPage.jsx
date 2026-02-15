import React, { useEffect, useState } from "react";
import customAxios from "../components/customAxios";
import { urlDeleteCart, urlGetCart, urlUpdateCart } from "../../endpoints";


const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH CART
  const fetchCart = async () => {
    debugger;
    try {
      const res = await customAxios.get(urlGetCart);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error("Cart fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ UPDATE QUANTITY
  const updateQty = async (product_id, newQty) => {
    debugger;
    try {
      await customAxios.put(urlUpdateCart, {
        product_id,
        quantity: newQty,
      });

      // refresh cart
      fetchCart();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // ✅ REMOVE ITEM
  const removeItem = async (product_id) => {
    debugger;
    try {
      await customAxios.delete(urlDeleteCart(product_id));
      fetchCart();
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  // ✅ CALCULATIONS
  const totalMRP = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const platformFee = 7;

  if (loading) {
    return <div className="p-10 text-center">Loading cart...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 && (
            <div className="bg-white p-10 text-center rounded">
              Your cart is empty 🛒
            </div>
          )}

          {cartItems.map((item) => (
            <div
              key={item.product_id}
              className="bg-white p-4 rounded shadow-sm border"
            >
              <div className="flex gap-4">
                
                {/* IMAGE placeholder */}
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-xs">
                  Image
                </div>

                {/* DETAILS */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">
                    {item.name}
                  </h3>

                  {/* PRICE */}
                  <div className="mt-2">
                    <span className="font-semibold text-lg">
                      ₹{item.price}
                    </span>
                  </div>

                  {/* QUANTITY */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() =>
                        updateQty(item.product_id, item.quantity - 1)
                      }
                      className="w-8 h-8 border rounded-full"
                    >
                      -
                    </button>

                    <span className="px-3 py-1 border rounded">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQty(item.product_id, item.quantity + 1)
                      }
                      className="w-8 h-8 border rounded-full"
                    >
                      +
                    </button>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-6 mt-4 text-sm font-medium">
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>

                {/* SUBTOTAL */}
                <div className="font-semibold text-lg">
                  ₹{item.subtotal}
                </div>
              </div>
            </div>
          ))}

          {/* PLACE ORDER */}
          {cartItems.length > 0 && (
            <div className="bg-white p-4 sticky bottom-0 border rounded shadow-sm flex justify-end">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 font-semibold rounded">
                PLACE ORDER
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — PRICE DETAILS */}
        <div className="bg-white p-5 rounded shadow-sm border h-fit">
          <h2 className="font-semibold text-gray-700 border-b pb-3">
            PRICE DETAILS
          </h2>

          <div className="space-y-3 mt-4 text-sm">
            <div className="flex justify-between">
              <span>Total</span>
              <span>₹{totalMRP}</span>
            </div>

            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>

            <hr />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span>₹{totalMRP + platformFee}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
