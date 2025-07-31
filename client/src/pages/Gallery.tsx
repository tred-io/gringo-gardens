import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import GalleryGrid from "@/components/GalleryGrid";
import type { GalleryImage } from "@shared/schema";

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: allImages = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const filteredImages = activeFilter === "all" 
    ? allImages 
    : allImages.filter(image => image.category === activeFilter);

  const filters = [
    { id: "all", label: "All Photos" },
    { id: "wildflowers", label: "Wildflowers" },
    { id: "landscapes", label: "Landscapes" },
    { id: "nursery", label: "Nursery" },
    { id: "trees", label: "Trees" },
  ];

  return (
    <section className="py-12">
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

        {/* Gallery Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filters.map(filter => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              onClick={() => setActiveFilter(filter.id)}
              className={activeFilter === filter.id 
                ? "bg-bluebonnet-600 hover:bg-bluebonnet-700" 
                : "hover:bg-gray-100"
              }
            >
              {filter.label}
            </Button>
          ))}
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
