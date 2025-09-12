import React from "react";
import HeroSection from "../components/HeroSection";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Star, MapPin, Phone, Clock } from "lucide-react";
import { SEOHead } from "../components/SEOHead";
import { trackEvent } from "../lib/analytics";
import type { Product, GalleryImage, Review, Category } from "@shared/schema";
import nurseryImage from "../../../attached_assets/image000001(2)_1755303882674.jpg";
import nativePlantsImage from "../../../attached_assets/image000000(30)_1755304019590.jpg";
import fruitTreesImage from "../../../attached_assets/image000000(38)_1755304075716.jpg";
import decorativeTreesImage from "../../../attached_assets/image000000(41)_1755304108789.jpg";
import hangingBasketsImage from "../../../attached_assets/image000000(17)_1755304126698.jpg";

export default function Home() {
  const { data: featuredProducts = [] } = useQuery<Product[] | null>({
    queryKey: ["/api/products", { featured: true }],
  });

  const { data: galleryImages = [] } = useQuery<GalleryImage[] | null>({
    queryKey: ["/api/gallery", { featured: true }],
  });

  const { data: reviews = [] } = useQuery<Review[] | null>({
    queryKey: ["/api/reviews"],
  });

  const { data: categories = [] } = useQuery<Category[] | null>({
    queryKey: ["/api/categories"],
  });

  // Fetch business settings with optimized caching - single load only
  const { data: temporaryClosureSetting } = useQuery({
    queryKey: ["/api/settings/temporary_closure"],
    retry: false,
    staleTime: Infinity, // Never refetch automatically
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  const { data: businessHoursSetting } = useQuery({
    queryKey: ["/api/settings/business_hours"],
    retry: false,
    staleTime: Infinity, // Never refetch automatically
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Fetch homepage content from CMS
  const { data: homepageContentSetting } = useQuery({
    queryKey: ["/api/settings/page_content_homepage"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Select 2 random reviews instead of featured ones
  const getRandomReviews = (reviewsArray: Review[] | null, count: number) => {
    if (!reviewsArray || reviewsArray.length <= count) return reviewsArray || [];
    const shuffled = [...reviewsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  const featuredReviews = getRandomReviews(reviews, 2);

  // Parse business settings with safe access
  const temporaryClosure = (temporaryClosureSetting as any)?.value ? JSON.parse((temporaryClosureSetting as any).value) : null;
  const businessHours = (businessHoursSetting as any)?.value ? JSON.parse((businessHoursSetting as any).value) : null;

  // Parse homepage content from CMS
  const homepageContent = (homepageContentSetting as any)?.value ? JSON.parse((homepageContentSetting as any).value) : null;
  
  // Debug logging for closure settings (can be removed in production)
  // console.log('Home - temporaryClosureSetting:', temporaryClosureSetting);
  // console.log('Home - temporaryClosure parsed:', temporaryClosure);
  


  const handleCategoryClick = (categoryName: string) => {
    trackEvent('view_category', 'engagement', categoryName);
  };

  const handleProductClick = (productName: string) => {
    trackEvent('view_product', 'engagement', productName);
  };

  return (
    <div>
      <SEOHead
        title={homepageContent?.seoTitle || "Texas Native Plants & Trees | Lampasas Nursery"}
        description={homepageContent?.seoDescription || "Discover drought-tolerant Texas native plants, trees, and wildflowers at Gringo Gardens in Lampasas. Expert advice, quality plants, and sustainable landscaping solutions for Central Texas."}
        keywords={homepageContent?.seoKeywords || "Texas native plants, native trees, wildflowers, drought tolerant plants, Lampasas nursery, Central Texas plants, bluebonnets, fruit trees, herbs, sustainable landscaping"}
        url="/"
        image={homepageContent?.heroImageUrl || "/hero-wildflowers.jpg"}
      />
      
      {/* Hero Section */}
      <HeroSection 
        heroTitle={homepageContent?.heroTitle}
        heroSubtitle={homepageContent?.heroSubtitle}
        heroDescription={homepageContent?.heroDescription}
        heroImageUrl={homepageContent?.heroImageUrl}
        ctaText={homepageContent?.ctaText}
        ctaLink={homepageContent?.ctaLink}
      />

      {/* About Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-bluebonnet-900 mb-6">
                {homepageContent?.aboutTitle || "Rooted in Texas Tradition"}
              </h2>
              <div className="text-lg text-gray-700 mb-8 leading-relaxed">
                {homepageContent?.aboutContent ? (
                  <div dangerouslySetInnerHTML={{ __html: homepageContent.aboutContent.replace(/\n/g, '</p><p className="mb-6">') }} />
                ) : (
                  <>
                    <p className="mb-6">
                      Founded in the heart of Lampasas, Gringo Gardens has been Central Texas's trusted source for native plants and expert horticultural advice for over a decade. Our passion for Texas flora drives everything we do.
                    </p>
                    <p>
                      We believe that the best gardens work with nature, not against it. That's why we specialize in native Texas plants that naturally thrive in our climate, require less water, and support local wildlife.
                    </p>
                  </>
                )}
              </div>
              <Link href="/about">
                <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                  Learn Our Story
                </Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <img 
                src={nurseryImage} 
                alt="Beautiful garden with orange blooms and native plants at Gringo Gardens" 
                className="rounded-xl shadow-lg w-full max-w-md h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Preview */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-bluebonnet-900 mb-4">
              Our Plant Collections
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From native wildflowers to productive fruit trees, discover plants perfectly suited for Texas gardens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(categories || []).filter(category => category.showOnHomepage && category.imageUrl).slice(0, 4).map((category, index) => {
              const gradients = ["from-bluebonnet-900", "from-texas-green-600", "from-earth-500", "from-bluebonnet-600"];
              
              return (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <div className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                      <img 
                        src={category.imageUrl || ""} 
                        alt={category.name} 
                        className="w-full h-64 object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${gradients[index % gradients.length]} via-transparent to-transparent`}>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                          <p className="text-sm opacity-90">{category.description || "Discover our collection"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700 text-lg px-8 py-3">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Gallery */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-bluebonnet-900 mb-4">
              Texas Gardens in Bloom
            </h2>
            <p className="text-xl text-gray-600">
              See how our plants transform landscapes across the Lone Star State
            </p>
          </div>

          {(galleryImages || []).length > 0 && (
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={(galleryImages || [])[0]?.imageUrl || "https://pixabay.com/get/gba534e36b616ba6e8d00279eb62c12e7e3bcaa573f5b5e662ed0a534cb14dd9501eee8aa8dc616645188438e0f893a867348d80ebb6a8d116f54647dd2e5009e_1280.jpg"} 
                alt="Featured gallery image" 
                className="w-full h-96 lg:h-[500px] object-cover"
              />
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/gallery">
              <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                View Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials & Local Community */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-bluebonnet-900 mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {featuredReviews.length > 0 ? (
                featuredReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-8">
                      <div className="flex items-center mb-4">
                        <div className="text-earth-400 text-xl">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="inline w-5 h-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-lg mb-4 italic">
                        "{review.content}"
                      </p>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-bluebonnet-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-bluebonnet-600 font-bold">
                            {review.customerName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-bluebonnet-900">{review.customerName}</h4>
                          {review.customerLocation && (
                            <p className="text-gray-600">{review.customerLocation}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <div className="text-earth-400 text-xl">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="inline w-5 h-5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg mb-4 italic">
                      "Gringo Gardens helped us transform our backyard into a native Texas paradise. The bluebonnets they recommended are absolutely stunning every spring!"
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-bluebonnet-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-bluebonnet-600 font-bold">SM</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-bluebonnet-900">Sarah Mitchell</h4>
                        <p className="text-gray-600">Austin, TX</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="bg-bluebonnet-50 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-bluebonnet-900 mb-2">Visit Us in Lampasas</h3>
                <p className="text-bluebonnet-700">Serving Central Texas & Beyond</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="text-bluebonnet-600 w-6 h-6 mr-3" />
                  <span className="text-gray-700">4041 FM 1715, Lampasas, TX 76550</span>
                </div>
                {temporaryClosure?.closed ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <Clock className="text-red-600 w-6 h-6 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-red-800 font-semibold mb-2">Temporarily Closed</h4>
                        <p className="text-red-700 text-sm leading-relaxed">
                          {temporaryClosure.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Clock className="text-bluebonnet-600 w-6 h-6 mr-3" />
                    <span className="text-gray-700">
                      {businessHours ? (
                        Object.entries(businessHours)
                          .filter(([_, hours]) => hours && hours !== 'Closed')
                          .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`)
                          .join(', ')
                      ) : (
                        'Mon-Sat 8AM-6PM, Sun 10AM-4PM'
                      )}
                    </span>
                  </div>
                )}

              </div>

              <div className="mt-6 pt-6 border-t border-bluebonnet-200">
                <h4 className="font-semibold text-bluebonnet-900 mb-2">Service Areas:</h4>
                <p className="text-bluebonnet-700 text-sm">
                  Lampasas County, Burnet County, Williamson County, Bell County, and beyond
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
