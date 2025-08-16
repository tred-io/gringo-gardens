import React from "react";
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_SEO = {
  title: "Gringo Gardens - Texas Native Plants & Trees | Lampasas Nursery",
  description: "Discover drought-tolerant Texas native plants, trees, and wildflowers at Gringo Gardens in Lampasas. Expert advice, quality plants, and sustainable landscaping solutions for Central Texas.",
  keywords: "Texas native plants, native trees, wildflowers, drought tolerant plants, Lampasas nursery, Central Texas plants, bluebonnets, fruit trees, herbs, sustainable landscaping",
  image: "/hero-wildflowers.jpg",
  url: "https://gringo-gardens.com",
  type: "website" as const,
};

export function SEOHead({
  title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  image = DEFAULT_SEO.image,
  url = DEFAULT_SEO.url,
  type = DEFAULT_SEO.type,
  author,
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const fullTitle = title ? `${title} | Gringo Gardens` : DEFAULT_SEO.title;
  const fullUrl = url.startsWith('http') ? url : `${DEFAULT_SEO.url}${url}`;
  const fullImage = image.startsWith('http') ? image : `${DEFAULT_SEO.url}${image}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!tag) {
        tag = document.createElement('meta');
        if (property) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', fullImage, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Gringo Gardens', true);
    updateMetaTag('og:locale', 'en_US', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImage);

    // Article-specific tags
    if (type === 'article') {
      if (author) updateMetaTag('article:author', author, true);
      if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
      updateMetaTag('article:section', 'Gardening', true);
      updateMetaTag('article:tag', keywords, true);
    }

    // Business-specific structured data
    const businessStructuredData = {
      "@context": "https://schema.org",
      "@type": "Florist",
      "name": "Gringo Gardens",
      "description": "Texas native plant nursery specializing in drought-tolerant plants, trees, and wildflowers",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "4041 FM 1715",
        "addressLocality": "Lampasas",
        "addressRegion": "TX",
        "postalCode": "76550",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "31.0640",
        "longitude": "-98.1781"
      },
      "url": "https://gringo-gardens.com",
      "image": fullImage,
      "priceRange": "$",
      "serversArea": ["Lampasas", "Central Texas", "Austin", "Temple", "Killeen"],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Native Plants & Trees",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Texas Native Plants"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product", 
              "name": "Fruit Trees"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Native Trees"
            }
          }
        ]
      }
    };

    // Update structured data
    let structuredDataScript = document.querySelector('#structured-data') as HTMLScriptElement;
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.id = 'structured-data';
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(businessStructuredData);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = fullUrl;

  }, [fullTitle, description, keywords, fullImage, fullUrl, type, author, publishedTime, modifiedTime]);

  return null;
}