import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import GalleryGrid from "@/components/GalleryGrid";
import { SEOHead } from "@/components/SEOHead";
import { trackEvent } from "@/lib/analytics";
import type { GalleryImage } from "@shared/schema";

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: allImages = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  // Filter by category only
  const filteredImages = allImages.filter(image => {
    const matchesCategory = activeFilter === "all" || image.category === activeFilter;
    return matchesCategory;
  });

  // Generate dynamic filters from actual data
  const categoryFilters = [
    { id: "all", label: "All Categories" },
    ...Array.from(new Set(allImages.map(img => img.category))).filter(Boolean).map(category => ({
      id: category!,
      label: category!.charAt(0).toUpperCase() + category!.slice(1).replace('-', ' ')
    }))
  ];

  const handleCategoryFilter = (categoryId: string) => {
    setActiveFilter(categoryId);
    trackEvent('filter_gallery_category', 'engagement', categoryId);
  };

  return (
    <section className="py-12">
      <SEOHead
        title="Texas Native Plant Gallery - Landscaping Inspiration"
        description="Browse our gallery of beautiful Texas native plant installations and landscaping projects. Get inspired for your own drought-tolerant garden design."
        keywords="Texas native plant gallery, landscaping inspiration, drought tolerant garden design, native plant landscaping, Texas garden photos"
        url="/gallery"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-bluebonnet-900 mb-4">
            Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the beauty of Texas native plants and see how our customers have transformed their landscapes
          </p>
        </div>

        {/* Gallery Filters */}
        <div className="space-y-6 mb-12">
          {/* Category Filters */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Filter by Category</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {categoryFilters.map(filter => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  onClick={() => handleCategoryFilter(filter.id)}
                  className={activeFilter === filter.id 
                    ? "bg-bluebonnet-600 hover:bg-bluebonnet-700" 
                    : "hover:bg-gray-100"
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>


        </div>

        {/* Photo Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <GalleryGrid images={filteredImages} />
        )}

        {filteredImages.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No images found for this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
