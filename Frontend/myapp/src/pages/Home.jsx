import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import '../styles/Home.css';
import { urlGetProducts } from '../../endpoints';
import customAxios from '../components/customAxios';

const heroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=2000',
    title: 'Discover Your Signature Scent',
    subtitle: 'Luxury fragrances crafted for the modern individual.',
    link: '/shop'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=2000',
    title: 'The Platinum Collection',
    subtitle: 'Experience our most exclusive line of rare perfumes.',
    link: '/shop?category=Luxury Collection'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=2000',
    title: 'Spring Arrivals',
    subtitle: 'Fresh, floral, and vibrant notes for the new season.',
    link: '/shop?category=New Arrivals'
  }
];

const categories = [
  { name: 'Women', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800' },
  { name: 'Men', image: 'https://images.unsplash.com/photo-1595425970377-c9703bc48b2a?auto=format&fit=crop&q=80&w=800' },
  { name: 'Unisex', image: 'https://images.unsplash.com/photo-1588691888463-b67fcfcb7fb0?auto=format&fit=crop&q=80&w=800' },
  { name: 'Luxury Collection', image: 'https://images.unsplash.com/photo-1582211594533-268fec19385b?auto=format&fit=crop&q=80&w=800' }
];

const Home = () => {

  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero auto slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Fetch products from backend (same logic as old code)
  useEffect(() => {

    const fetchProducts = async () => {
      debugger;
      try {

        const response = await customAxios.get(urlGetProducts);

        if (response.status === 200 && response.data) {
          setProducts(response.data);
        }

      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

  }, []);

  // Featured products
  const featuredProducts = products
    .slice(0, 8);

  return (
    <div className="home-page">

      {/* Hero Slider */}
      <section className="hero-slider">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay">
              <div className="slide-content">
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
                <Link to={slide.link} className="btn btn-accent">Shop Now</Link>
              </div>
            </div>
          </div>
        ))}

        <div className="slider-dots">
          {heroSlides.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            ></span>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section container">

        <div className="section-header">
          <h2>Featured Collection</h2>
          <Link to="/shop" className="view-all">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div className="product-grid">

          {loading && <p>Loading products...</p>}

          {!loading && featuredProducts.map((product) => (

            <div key={product.id} className="product-card">

              <div className="product-image-container">

                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="product-image"
                  />
                </Link>

                {product.isNew && <span className="badge new">New</span>}

                <button className="add-to-cart-quick">
                  Add to Cart
                </button>

              </div>

              <div className="product-info">

                <p className="product-category">{product.category}</p>

                <Link to={`/product/${product.id}`} className="product-name">
                  <h3>{product.name}</h3>
                </Link>

                <p className="product-price">
                  ₹{Number(product.price).toFixed(2)}
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* Categories */}
      <section className="categories-section container">
        <div className="section-header center">
          <h2>Shop by Category</h2>
        </div>

        <div className="categories-grid">

          {categories.map((cat, idx) => (
            <Link
              to={`/shop?category=${cat.name}`}
              key={idx}
              className="category-card"
            >
              <img src={cat.image} alt={cat.name} />
              <div className="category-overlay">
                <h3>{cat.name}</h3>
              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">

          <h2>What Our Clients Say</h2>

          <div className="testimonials-grid">

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"The Velvet Amber is truly exceptional. Every time I wear it, I get compliments. The luxury packaging is just the cherry on top."</p>
              <span className="author">- Sarah Jenkins</span>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"I've been searching for a signature scent for years. Midnight Rose is elegant, long-lasting, and perfectly balanced."</p>
              <span className="author">- Emily R.</span>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Fast delivery and the Oud Wood scent is incredibly rich. You can tell real quality ingredients are used in these perfumes."</p>
              <span className="author">- Michael T.</span>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;