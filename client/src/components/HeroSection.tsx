import React from "react";
import { Button } from "./ui/button";
import { Link } from "wouter";

interface HeroSectionProps {
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function HeroSection({
  heroTitle = "Gringo Gardens",
  heroSubtitle = "Texas Native Plants & Trees", 
  heroDescription = "Your local source for Texas natives, trees, and plants.",
  heroImageUrl = "/hero-image.jpg?v=1",
  ctaText = "Shop Native Plants",
  ctaLink = "/products"
}: HeroSectionProps) {
  return (
    <section className="relative h-screen flex items-center justify-center text-white">
      {/* Background Image */}
      <img 
        src={heroImageUrl} 
        alt="Texas wildflowers"
        className="absolute inset-0 w-full h-full object-cover z-0"
        onError={(e) => {
          console.error('Hero image failed to load:', e);
          // Fallback to original image
          e.currentTarget.src = 'https://images.unsplash.com/photo-1523275353616-af4c9c0c8b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
        }}
        onLoad={() => console.log('Hero image loaded successfully')}
      />
      <div className="absolute inset-0 bg-black bg-opacity-15 z-5"></div>
      
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-6xl sm:text-6xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="text-texas-green-400">{heroTitle}</span>
        </h1>
        {heroSubtitle && (
          <h2 className="text-3xl sm:text-4xl mb-4 text-bluebonnet-200 font-medium">
            {heroSubtitle}
          </h2>
        )}
        <p className="text-2xl sm:text-3xl mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed">
          {heroDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={ctaLink}>
            <Button className="bg-texas-green-600 hover:bg-texas-green-500 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105">
              {ctaText}
            </Button>
          </Link>
          <Link href="/contact">
            <Button 
              variant="outline" 
              className="border-2 border-bluebonnet bg-bluebonnet-600 hover:bg-bluebonnet hover:text-bluebonnet-900 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Visit Our Nursery
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
