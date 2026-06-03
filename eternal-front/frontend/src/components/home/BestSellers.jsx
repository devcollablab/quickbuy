import { Link } from "react-router-dom";
import SectionHeading from "../ui/SectionHeading";
import ProductCard from "../products/ProductCard";
import Button from "../ui/Button";
import { useProducts } from "../../context/ProductsContext";

export default function BestSellers() {
  const { catalog, loading } = useProducts();
  const bestSellers = catalog
    .filter((p) => p.badge === "Best Seller" || p.badge === "Editor's Pick")
    .slice(0, 4);

  const display = bestSellers.length > 0 ? bestSellers : catalog.slice(0, 6);

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto section-cream">
      <SectionHeading label="Most Loved" title="Best Sellers" subtitle="Our most celebrated fragrances, chosen by thousands." />
      {loading ? (
        <p className="text-center text-stone-500 py-12">Loading fragrances...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-10 justify-items-center">
  {display.map((p, i) => (
    <div key={p.id} className="w-full max-w-sm">
      <ProductCard product={p} index={i} />
    </div>
  ))}
</div>
      )}
      <div className="text-center mt-12">
        <Link to="/collection">
          <Button variant="outline">View All Fragrances</Button>
        </Link>
      </div>
    </section>
  );
}
