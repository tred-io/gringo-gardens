import React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import ProductCard from "../components/ProductCard";
import { SEOHead } from "../components/SEOHead";
import { trackEvent } from "../lib/analytics";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    hardinessZone: "all",
    sunRequirements: "all",
    priceRange: "all",
    texasNative: "all",
    droughtTolerance: "all",
  });

  const { data: products = [], isLoading } = useQuery<Product[] | null>({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[] | null>({
    queryKey: ["/api/categories"],
  });

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    trackEvent('filter_products', 'search', `${key}:${value}`);
  };

  return (
    <section className="py-12">
      <SEOHead
        title="Texas Native Plants & Trees for Sale"
        description="Shop our extensive collection of native Texas plants, fruit trees, and drought-tolerant varieties. Perfect for Central Texas landscaping with expert growing advice."
        keywords="buy Texas native plants, native trees for sale, drought tolerant plants, Texas wildflowers, native fruit trees, Central Texas plants, plant nursery"
        url="/products"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-bluebonnet-900 mb-4">
            Plants & Trees
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our extensive collection of native Texas plants, fruit trees, and specialty varieties perfect for your landscape
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(categories || []).map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hardiness Zone</label>
              <Select value={filters.hardinessZone} onValueChange={(value) => updateFilter("hardinessZone", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="8a">Zone 8a</SelectItem>
                  <SelectItem value="8b">Zone 8b</SelectItem>
                  <SelectItem value="9a">Zone 9a</SelectItem>
                  <SelectItem value="9b">Zone 9b</SelectItem>
                  <SelectItem value="10a">Zone 10a</SelectItem>
                  <SelectItem value="10b">Zone 10b</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sun Requirements</label>
              <Select value={filters.sunRequirements} onValueChange={(value) => updateFilter("sunRequirements", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sun Requirements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sun Requirements</SelectItem>
                  <SelectItem value="full sun">Full Sun</SelectItem>
                  <SelectItem value="partial sun">Partial Sun</SelectItem>
                  <SelectItem value="partial shade">Partial Shade</SelectItem>
                  <SelectItem value="shade">Shade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Texas Native</label>
              <Select value={filters.texasNative} onValueChange={(value) => updateFilter("texasNative", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plants</SelectItem>
                  <SelectItem value="true">Texas Native Only</SelectItem>
                  <SelectItem value="false">Non-Native</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Drought Tolerance</label>
              <Select value={filters.droughtTolerance} onValueChange={(value) => updateFilter("droughtTolerance", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tolerance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tolerance</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="focus:ring-2 focus:ring-bluebonnet-500"
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {(products || []).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {(products || []).length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
}
