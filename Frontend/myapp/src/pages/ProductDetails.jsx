import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { Minus, Plus, ChevronRight, Star } from 'lucide-react';
import '../styles/ProductDetails.css';
import Toast from "../components/Toast";
import { urlGetProductById, urlAddToCart, urlGetProductimages } from '../../endpoints';
import customAxios from '../components/customAxios';
import Loading from "../components/Loading";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [adding, setAdding] = useState(false);
const [toast, setToast] = useState({ message: "", type: "success" });
const [selectedVariant, setSelectedVariant] = useState(null);

useEffect(() => {
  const fetchProduct = async () => {
    debugger;
    try {
      setLoading(true);

      const response = await customAxios.get(urlGetProductById(id));

      setProduct(response.data);
      if (response.data.variants?.length > 0) {
        setSelectedVariant(response.data.variants[0]); // default select first
      }
      window.scrollTo(0,0);

    } catch (err) {
      console.error("Error fetching product", err);
      setToast({
        message: "Failed to Load Products",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);


if (loading) return <Loading text="Loading product..." />;

if (error) return <Loading text={error} />;

if (!product) return <div className="loading">Product not found</div>;

  // Mock gallery images by using the main image and some variations
  const galleryImages = product.images
  ? product.images
      .sort((a, b) => a.position - b.position)
      .map(img => img)
  : [];

  // const relatedProducts = product
  //   .filter(p => p.category === product.category && p.id !== product.id)
  //   .slice(0, 4);

  const handleAddToCart = async () => {
    debugger;
    try {
      setAdding(true);
  
      const payload = {
        product_id: product.id,
        quantity: quantity,
      };
  
      // ✅ Add variant_id if variant exists
      if (selectedVariant) {
        payload.variant_id = selectedVariant.id;
      }
  
      await customAxios.post(urlAddToCart, payload);
  
      setToast({
        message: "Item added to Cart",
        type: "success"
      });
  
      navigate("/cart");
  
    } catch (err) {
      console.error("Add to cart failed", err);
  
      if (err.response?.status === 401) {
        setToast({
          message: "Please Login First",
          type: "error"
        });
      } else {
        setToast({
          message: err.response?.data?.detail || "Failed to add to cart",
          type: "error"
        });
      }
    } finally {
      setAdding(false);
    }
  };

  // if (product.variants?.length > 0 && !selectedVariant) {
  //   setToast({
  //     message: "Please select a size",
  //     type: "error"
  //   });
  //   return;
  // }

  const isOutOfStock = selectedVariant
    ? selectedVariant.stock <= 0
    : product.stock <= 0;

  return (
    <div className="product-details-page">
      <Toast
     message={toast.message}
     type={toast.type}
     onClose={() => setToast({ message: "" })}
    />
      {/* Breadcrumbs */}
      <div className="breadcrumbs container">
        <Link to="/">Home</Link> <ChevronRight size={14} /> 
        <Link to={`/shop?category=${product.category}`}>{product.category}</Link> <ChevronRight size={14} /> 
        <span className="current">{product.name}</span>
      </div>

      <div className="product-details-container container">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="main-image-container">
            <img src={galleryImages[activeImage]} alt={product.name} className="main-image" />
            {product.isNew && <span className="badge new">New Arrival</span>}
          </div>
          <div className="thumbnail-list">
            {galleryImages.map((img, idx) => (
              <div 
                key={idx} 
                className={`thumbnail ${activeImage === idx ? 'active' : ''}`}
                onClick={() => setActiveImage(idx)}
              >
                <img src={img} alt={`${product.name} view ${idx + 1}`} />
              </div>
            ))}
          </div>
          {product.variants?.length > 0 && (
  <div className="variant-section">
    <p className="variant-title">Select Size</p>

    <div className="variant-buttons">
      {product.variants.map((variant, index) => (
        <button
          key={index}
          className={`variant-btn ${
            selectedVariant?.size_ml === variant.size_ml ? "active" : ""
          }`}
          onClick={() => setSelectedVariant(variant)}
        >
          {variant.size_ml} ml
        </button>
      ))}
    </div>

    <p className="stock-text">
      Stock: {selectedVariant?.stock}
    </p>
  </div>
)}
        </div>

        {/* Product Info */}
        <div className="product-info-full">
          <p className="product-category-label">{product.category}</p>
          <h1 className="product-title">{product.name}</h1>
          
          
          <div className="product-rating">
  <div className="stars">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < 4 ? 'var(--color-accent)' : 'none'}
        color={i < 4 ? 'var(--color-accent)' : '#ccc'}
      />
    ))}
  </div>
  <span>4.0 (1k reviews)</span>
</div>

          <p className="product-price-large">₹{(selectedVariant?.price || product.price).toFixed(2)}</p>
          
          <div className="product-description">
            <p>{product.description}</p>
            <p className="extra-desc">Experience the harmony of exclusive ingredients carefully blended to create a long-lasting, memorable fragrance profile. Delivered in a luxurious glass flacon.</p>
          </div>

          <div className="cart-actions-sticky">
            <div className="container sticky-container">
              <div className="quantity-selector ">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16} /></button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(q =>
    Math.min(q + 1, selectedVariant?.stock || product.stock || 1)
  )}><Plus size={16} /></button>
              </div>
              
              <button
  className="btn btn-text add-to-cart-btn-full animate-slide-up delay-200"
  onClick={handleAddToCart}
  disabled={adding || isOutOfStock}
>
  {isOutOfStock ? "OUT OF STOCK" : adding ? "ADDING..." : "ADD TO CART"}
  <span className="separator">-</span>
  ₹{ ((selectedVariant?.price || product.price) * quantity).toFixed(2) }
</button>
            </div>
          </div>

          <div className="product-specs-section">
            <h2 className="specs-title">PRODUCT DETAILS</h2>
            <div className="title-underline"></div>
            
            <div className="specs-table">
              <div className="spec-row header-row">
                <div className="spec-col-1">Attribute</div>
                <div className="spec-col-2">Details</div>
              </div>
              <div className="spec-row">
                <div className="spec-col-1">Volume</div>
                <div className="spec-col-2">{product.specs?.volume}</div>
              </div>
              <div className="spec-row">
                <div className="spec-col-1">Concentration</div>
                <div className="spec-col-2">{product.specs?.concentration}</div>
              </div>
              <div className="spec-row">
                <div className="spec-col-1">Gender</div>
                <div className="spec-col-2">{product.category === 'Unisex' || product.category === 'Luxury Collection' ? 'Unisex' : product.category}</div>
              </div>
              <div className="spec-row">
                <div className="spec-col-1">Top Notes</div>
                <div className="spec-col-2">{product.specs?.topNotes}</div>
              </div>
              <div className="spec-row">
                <div className="spec-col-1">Middle Notes</div>
                <div className="spec-col-2">{product.specs?.middleNotes}</div>
              </div>
              <div className="spec-row">
                <div className="spec-col-1">Base Notes</div>
                <div className="spec-col-2">{product.specs?.baseNotes}</div>
              </div>
              <div className="spec-row">
                <div className="spec-col-1">Fragrance Profile</div>
                <div className="spec-col-2">{product.specs?.fragranceProfile}</div>
              </div>
              <div className="spec-row">
                <div className="spec-col-1">Longevity</div>
                <div className="spec-col-2">{product.specs?.longevity}</div>
              </div>
              <div className="spec-row">
                <div className="spec-col-1">Best Suited For</div>
                <div className="spec-col-2">{product.specs?.bestSuitedFor}</div>
              </div>
              <div className="spec-row">
                <div className="spec-col-1">Country of Origin</div>
                <div className="spec-col-2">{product.specs?.countryOfOrigin}</div>
              </div>
            </div>

            <div className="promo-banner">
              <span className="promo-icon">🏅</span>
              <span className="promo-text"><strong>Extra 5% off</strong> on prepaid orders</span>
              <div className="payment-icons">
                <span className="pay-tag visa">VISA</span>
                <span className="pay-tag upi">UPI</span>
              </div>
            </div>
          </div>

          
        </div>
      </div>

      {/* Related Products */}
      {/* {relatedProducts.length > 0 && (
        <section className="related-products container">
          <div className="section-header">
            <h2>You May Also Like</h2>
          </div>
          <div className="product-grid">
            {relatedProducts.map(relProduct => (
              <div key={relProduct.id} className="product-card">
                <div className="product-image-container">
                  <Link to={`/product/${relProduct.id}`}>
                    <img src={relProduct.image} alt={relProduct.name} className="product-image" />
                  </Link>
                  <button 
                    className="add-to-cart-quick"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(relProduct);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
                <div className="product-info-short">
                  <Link to={`/product/${relProduct.id}`} className="product-name">
                    <h3>{relProduct.name}</h3>
                  </Link>
                  <p className="product-price">${relProduct.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )} */}
    </div>
  );
};

export default ProductDetails;
