
import { Link } from 'react-router-dom';

import { Trash2, Minus, Plus, ChevronRight } from 'lucide-react';
import '../styles/Cart.css';
import React, { useContext, useEffect, useState } from 'react';
import customAxios from "../components/customAxios";
import { urlDeleteCart, urlGetCart, urlUpdateCart } from "../../endpoints";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    
    try {
      const res = await customAxios.get(urlGetCart);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error("Cart fetch failed", err);
    }
  };
  
  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (product_id, quantity) => {
    try {
      await customAxios.put(urlUpdateCart, {
        product_id,
        quantity
      });
      fetchCart();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const removeItem = async (product_id) => {
    try {
      await customAxios.delete(urlDeleteCart(product_id));
      fetchCart();
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty-cart container text-center">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any premium fragrances to your cart yet.</p>
        <Link to="/shop" className="btn btn-accent empty-cart-btn">Discover Our Collection</Link>
      </div>
    );
  }

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-page container">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> <ChevronRight size={14} /> 
        <span className="current">Shopping Cart</span>
      </div>

      <h1 className="page-title">Your Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-header grid-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span></span>
          </div>

          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-product">
                <Link to={`/product/${item.id}`}>
                  <img src={item.image_url} alt={item.name} />
                </Link>
                <div className="cart-item-info">
                  <p className="category">{item.category}</p>
                  <Link to={`/product/${item.id}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p className="mobile-price">${item.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="cart-item-price desktop-only">
                ${item.price.toFixed(2)}
              </div>

              <div className="cart-item-quantity">
                <div className="quantity-selector-sm">
                  <button onClick={() => updateQty(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <Minus size={14} />
                  </button>
                  <input type="number" value={item.quantity} readOnly />
                  <button onClick={() => updateQty(item.product_id, item.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="cart-item-subtotal desktop-only">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <div className="cart-item-remove">
                <button onClick={() => removeItem(item.product_id)} aria-label="Remove item">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({cartItems.length} items)</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          
          <Link to="/checkout" className="btn btn-accent checkout-btn">
            Proceed to Checkout
          </Link>
          <div className="secure-checkout">
            <span className="secure-badge">🔒 Secure Checkout Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
