import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay">
          <div className="container">
            <h1>Our Story</h1>
            <p>Crafting memories through the power of scent.</p>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="about-content container">
        <div className="about-grid">
          <div className="about-text">
            <h2>The Essence of Luxury</h2>
            <p>Founded in 2024, Luxe Scents was born from a passion for rare, exquisite ingredients and the art of traditional perfumery. We believe that a fragrance is more than just a scent—it is an invisible accessory, a personal signature, and a powerful trigger of memories.</p>
            <p>Our master perfumers travel the globe to source the finest natural materials: hand-picked Damask roses from Grasse, rich oud from Southeast Asia, and vibrant citrus from the Amalfi Coast. Each bottle is a testament to uncompromising quality and timeless elegance.</p>
          </div>
          <div className="about-image">
            <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800" alt="Perfume Ingredients" />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="philosophy-section">
        <div className="container">
          <div className="section-header center">
            <h2>Our Philosophy</h2>
          </div>
          <div className="philosophy-grid">
            <div className="philosophy-item">
              <h3>Artisanal Craftsmanship</h3>
              <p>Every fragrance is meticulously blended by hand, allowing the complex notes to mature and harmonize over time.</p>
            </div>
            <div className="philosophy-item">
              <h3>Sustainable Sourcing</h3>
              <p>We work directly with farmers and distillers to ensure our ingredients are ethically harvested and environmentally responsible.</p>
            </div>
            <div className="philosophy-item">
              <h3>Timeless Design</h3>
              <p>Our heavy glass flacons and minimalist packaging are designed to be cherished on your vanity as objects of art.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
