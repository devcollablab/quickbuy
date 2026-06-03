import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { api, endpoints, getErrorMessage } from "../lib/api";
import { mapApiProductsToCards, CATEGORY_API } from "../lib/productMapper";
import customAxios from "../components/customAxios";
import { urlGetProducts } from "../../endpoints";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products only from backend API
  const fetchProducts = useCallback(async (categoryName = null) => {
    debugger;
    setLoading(true);
    setError(null);

    try {
      const params = {
        per_page: 100,
        page: 1,
      };

      if (categoryName) {
        params.category_name = categoryName;
      }
      debugger;
      const response = await customAxios.get(urlGetProducts, {
        withCredentials: true,
      });

      if (response.status === 200 && response.data) {
        const list = Array.isArray(response.data)
          ? response.data
          : [];

        setApiProducts(list);

        return list;
      }

      return [];
    } catch (err) {
      console.error("Error fetching products", err);
      setError(getErrorMessage(err));
      setApiProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Only backend products
  const catalog = useMemo(() => {
    return mapApiProductsToCards(apiProducts);
  }, [apiProducts]);

  const getById = useCallback(
    (id) =>
      catalog.find(
        (p) =>
          p.id === id ||
          String(p.productId) === String(id)
      ),
    [catalog]
  );

  const getRelated = useCallback(
    (product, limit = 4) => {
      if (!product) return catalog.slice(0, limit);

      return catalog
        .filter(
          (p) =>
            p.id !== product.id &&
            (
              p.slug === product.slug ||
              p.category === product.category
            )
        )
        .slice(0, limit);
    },
    [catalog]
  );

  const filterByUiCategory = useCallback(
    (filterId) => {
      if (filterId === "all") return catalog;

      return catalog.filter(
        (p) => p.category === filterId
      );
    },
    [catalog]
  );

  return (
    <ProductsContext.Provider
      value={{
        catalog,
        loading,
        error,
        fetchProducts,
        getById,
        getRelated,
        filterByUiCategory,
        CATEGORY_API,
        refetch: () => fetchProducts(),
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);

  if (!ctx) {
    throw new Error(
      "useProducts must be used within ProductsProvider"
    );
  }

  return ctx;
}