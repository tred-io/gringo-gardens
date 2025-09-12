import React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
// import { ScrollArea } from "./ui/scroll-area";
import { Image, Search, Check } from "lucide-react";
import type { GalleryImage } from "@shared/schema";

interface GalleryImageSelectorProps {
  onSelect: (imageUrl: string, galleryImage?: GalleryImage) => void;
  selectedImageUrl?: string;
  trigger?: React.ReactNode;
}

export function GalleryImageSelector({ onSelect, selectedImageUrl, trigger }: GalleryImageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>("all");


  const { data: galleryImages = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const filteredImages = galleryImages.filter(image => {
    const matchesSearch = searchTerm === "" || 
      (image.title && image.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(galleryImages.map(img => img.category))).filter(Boolean);

  const handleSelect = (imageUrl: string, galleryImage: GalleryImage) => {
    onSelect(imageUrl, galleryImage);
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline" type="button">
      <Image className="w-4 h-4 mr-2" />
      Select from Gallery
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Image from Gallery</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 px-2">Categories:</span>
              <div className="flex gap-1 flex-wrap">
                <Badge
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory("all")}
                >
                  All
                </Badge>
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="h-96 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
              {filteredImages.map(image => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageUrl === image.imageUrl 
                      ? "border-bluebonnet-500 shadow-lg" 
                      : "border-gray-200 hover:border-bluebonnet-300"
                  }`}
                  onClick={() => handleSelect(image.imageUrl, image)}
                >
                  <div className="aspect-square">
                    <img
                      src={image.imageUrl}
                      alt={image.altText || image.title || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay with image info */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-end">
                    <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm font-medium truncate">{image.title}</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {image.category && (
                          <Badge variant="secondary" className="text-xs">
                            {image.category}
                          </Badge>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {selectedImageUrl === image.imageUrl && (
                    <div className="absolute top-2 right-2 bg-bluebonnet-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {filteredImages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No images found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}