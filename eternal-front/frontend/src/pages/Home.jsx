import Hero from "../components/home/Hero";
import Marquee from "../components/home/Marquee";
import FeaturedCollections from "../components/home/FeaturedCollections";
import BestSellers from "../components/home/BestSellers";
import StatsSection from "../components/home/StatsSection";
import Testimonials from "../components/home/Testimonials";
// import Newsletter from "../components/home/Newsletter";
import SectionHeading from "../components/ui/SectionHeading";
import ComingSoonCard from "../components/products/ComingSoonCard";
import { comingSoonProducts } from "../data/products";
import ScrollReveal from "../components/ui/ScrollReveal";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <FeaturedCollections />
      <BestSellers />
      <StatsSection />
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeading
          label="The Future"
          title="Coming Soon"
          subtitle="Exclusive fragrances launching soon. Be the first to experience them."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {comingSoonProducts.map((p, i) => (
            <ComingSoonCard key={p.id} product={p} index={i} />
          ))}
        </div>
        <ScrollReveal className="text-center mt-10">
          <Link to="/coming-soon">
            <Button variant="outline">View All Previews</Button>
          </Link>
        </ScrollReveal>
      </section>
      <Testimonials />
      
    </>
  );
}
