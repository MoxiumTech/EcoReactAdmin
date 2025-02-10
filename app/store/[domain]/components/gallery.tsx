"use client";

import Image from "next/image";
import type { Image as ImageType } from "@/types/models";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryProps {
  images: ImageType[];
  variantImages?: ImageType[];
}

export const Gallery: React.FC<GalleryProps> = ({
  images = [],
  variantImages = []
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  
  // Navigation functions
  const goToPrevious = () => {
    setSelectedIndex((current) => 
      current === 0 ? sortedImages.length - 1 : current - 1
    );
  };

  const goToNext = () => {
    setSelectedIndex((current) => 
      current === sortedImages.length - 1 ? 0 : current + 1
    );
  };

  if (images.length === 0 && variantImages.length === 0) {
    return (
      <div className="relative aspect-square w-full h-full rounded-lg overflow-hidden bg-gray-100">
        <Image
          fill
          src="/placeholder.png"
          alt="Product placeholder"
          className="object-cover object-center"
        />
      </div>
    );
  }

  // Combine and deduplicate images, prioritizing variant images
  const uniqueImages = [...variantImages, ...images].filter((image, index, self) =>
    index === self.findIndex((t) => t.url === image.url)
  );

  // Sort images by position
  const sortedImages = uniqueImages.sort((a, b) => a.position - b.position);
  const selectedImage = sortedImages[selectedIndex];

  return (
    <div className="flex flex-col-reverse">
      {/* Main Image */}
      <div 
        className="group relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt || "Product image"}
          fill
          priority
          className={cn(
            "object-cover object-center transition-transform duration-500",
            isZoomed && "scale-110"
          )}
        />
        <button
          onClick={() => setShowLightbox(true)}
          className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        
        {/* Navigation Buttons */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Grid */}
      <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
        <div className="grid grid-cols-4 gap-6">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase hover:bg-gray-50",
                selectedIndex === index ? "ring-2 ring-black ring-offset-2" : "ring-1 ring-gray-200"
              )}
            >
              <span className="sr-only">
                View Image {index + 1}
              </span>
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <Image
                  src={image.url}
                  alt={image.alt || `Product image ${index + 1}`}
                  fill
                  className="object-cover object-center"
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Image Slider Dots */}
      <div className="flex items-center justify-center gap-3 mt-4 sm:hidden">
        {sortedImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-all duration-300 transform",
              selectedIndex === index 
                ? "bg-black scale-125" 
                : "bg-gray-300 hover:bg-gray-400"
            )}
          />
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-7xl bg-black/95 border-none">
          <div className="relative h-[80vh]">
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt || "Product image"}
              fill
              className="object-contain"
            />
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
