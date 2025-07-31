import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    hardinessZone: "",
    sunRequirements: "",
    priceRange: "",
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", filters],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <section className="py-12">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
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
                  <SelectItem value="">All Zones</SelectItem>
                  <SelectItem value="8a">Zone 8a</SelectItem>
                  <SelectItem value="8b">Zone 8b</SelectItem>
                  <SelectItem value="9a">Zone 9a</SelectItem>
                  <SelectItem value="9b">Zone 9b</SelectItem>
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
                  <SelectItem value="">All Sun Requirements</SelectItem>
                  <SelectItem value="full">Full Sun</SelectItem>
                  <SelectItem value="partial">Partial Sun</SelectItem>
                  <SelectItem value="shade">Shade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
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
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
}
