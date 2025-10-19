import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Label } from "./label";
import { Image, Upload, Link } from "lucide-react";
import { ObjectUploader } from "../ObjectUploader";
import { GalleryImageSelector } from "../GalleryImageSelector";
import type { GalleryImage } from "@shared/schema";

interface UnifiedImageUploaderProps {
  value: string;
  onChange: (url: string, galleryImage?: GalleryImage) => void;
  onGetUploadParameters: () => Promise<{ method: "PUT"; url: string }>;
  onUploadComplete?: (result: any) => void;
  label?: string;
  helperText?: string;
  showPreview?: boolean;
  maxFileSize?: number;
}

/**
 * UnifiedImageUploader - Single component combining all 3 image upload methods
 *
 * Consolidates:
 * 1. URL input (paste from external source)
 * 2. Gallery selector (choose existing image)
 * 3. File uploader (upload new image)
 *
 * This eliminates decision paralysis for non-technical users by presenting
 * all options in a clear, tabbed interface within a single "Add Image" button.
 */
export function UnifiedImageUploader({
  value,
  onChange,
  onGetUploadParameters,
  onUploadComplete,
  label = "Image",
  helperText,
  showPreview = true,
  maxFileSize = 10485760, // 10MB default
}: UnifiedImageUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState("gallery");

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setIsOpen(false);
      setUrlInput("");
    }
  };

  const handleGallerySelect = (imageUrl: string, galleryImage?: GalleryImage) => {
    onChange(imageUrl, galleryImage);
    setIsOpen(false);
  };

  const handleUploadComplete = async (result: any) => {
    // Extract URL from upload result
    let uploadedUrl = "";

    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];

      // Try to get blobURL first (from Vercel Blob)
      if ((file as any).blobURL) {
        uploadedUrl = (file as any).blobURL;
      }
      // Fallback to response body URL
      else if (file.response?.body?.url) {
        uploadedUrl = file.response.body.url;
      }
      // Fallback to uploadURL
      else if (file.uploadURL) {
        uploadedUrl = file.uploadURL;
      }
    }

    if (uploadedUrl) {
      onChange(uploadedUrl);
      setIsOpen(false);
    }

    // Call optional callback
    if (onUploadComplete) {
      onUploadComplete(result);
    }
  };

  const hasImage = value && value.trim() !== "";

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant={hasImage ? "outline" : "default"} className="w-full">
            <Image className="w-4 h-4 mr-2" />
            {hasImage ? "Change Image" : "Add Image"}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span>Choose from Gallery</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload New</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                <span>Paste URL</span>
              </TabsTrigger>
            </TabsList>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="min-h-[400px]">
              <div className="text-sm text-gray-600 mb-4">
                Select an image from your existing gallery
              </div>
              <GalleryImageSelector
                onSelect={handleGallerySelect}
                selectedImageUrl={value}
                trigger={<div className="hidden" />} // Hidden trigger since we're inline
              />
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="min-h-[400px]">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Upload a new image from your computer
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={maxFileSize}
                    onGetUploadParameters={onGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="mx-auto"
                  >
                    <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-medium mb-2">Click to upload</div>
                    <div className="text-sm text-gray-500">
                      PNG, JPG, GIF up to {Math.round(maxFileSize / 1048576)}MB
                    </div>
                  </ObjectUploader>
                </div>
              </div>
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url" className="min-h-[400px]">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Paste an image URL from another website (like Unsplash, your own hosting, etc.)
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim()}
                  >
                    Add URL
                  </Button>
                </div>
                {urlInput && (
                  <div className="mt-4">
                    <Label className="text-sm text-gray-600">Preview:</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={urlInput}
                        alt="Preview"
                        className="w-full h-64 object-contain bg-gray-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).alt = 'Invalid image URL';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Preview */}
      {showPreview && hasImage && (
        <div className="relative group">
          <img
            src={value}
            alt="Selected image"
            className="w-full h-32 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {helperText && (
        <div className="text-sm text-gray-500">{helperText}</div>
      )}
    </div>
  );
}
