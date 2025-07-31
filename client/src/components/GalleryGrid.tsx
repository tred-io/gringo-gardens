import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { GalleryImage } from "@shared/schema";

interface GalleryGridProps {
  images: GalleryImage[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="cursor-pointer group"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.imageUrl}
              alt={image.title || "Gallery image"}
              className="w-full h-64 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105"
            />
            {image.title && (
              <h3 className="mt-2 text-lg font-semibold text-bluebonnet-900">
                {image.title}
              </h3>
            )}
            {image.description && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {image.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogTitle className="sr-only">
            {selectedImage?.title || "Gallery image"}
          </DialogTitle>
          {selectedImage && (
            <div>
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title || "Gallery image"}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              {(selectedImage.title || selectedImage.description) && (
                <div className="p-6">
                  {selectedImage.title && (
                    <h3 className="text-xl font-bold text-bluebonnet-900 mb-2">
                      {selectedImage.title}
                    </h3>
                  )}
                  {selectedImage.description && (
                    <p className="text-gray-600">{selectedImage.description}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
