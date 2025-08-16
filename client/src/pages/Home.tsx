import HeroSection from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Star, MapPin, Phone, Clock, Truck } from "lucide-react";
import type { Product, GalleryImage, Review } from "@shared/schema";
import nurseryImage2 from "@assets/image000000(15)_1755303561602.jpg";

export default function Home() {
  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true }],
  });

  const { data: galleryImages = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery", { featured: true }],
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const featuredReviews = reviews.filter(review => review.featured).slice(0, 2);

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-bluebonnet-900 mb-6">
                Rooted in Texas Tradition
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Founded in the heart of Lampasas, Gringo Gardens has been Central Texas's trusted source for native plants and expert horticultural advice for over a decade. Our passion for Texas flora drives everything we do.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                We believe that the best gardens work with nature, not against it. That's why we specialize in native Texas plants that naturally thrive in our climate, require less water, and support local wildlife.
              </p>
              <Link href="/about">
                <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                  Learn Our Story
                </Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <img 
                src={nurseryImage2} 
                alt="Vegetable seedlings and young plants at Gringo Gardens" 
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
            {[
              {
                title: "Native Plants & Trees",
                description: "Texas wildflowers & native species",
                image: "https://pixabay.com/get/ga89e6f12e04c4383e69881ec9d2eb4779924c3f11688c3e04dcba1bceadba167b0404b04866e6522c18d32af97f4ae8ecefced568f0fdeca43b8084c6d8e7329_1280.jpg",
                gradient: "from-bluebonnet-900",
              },
              {
                title: "Fruit Trees",
                description: "Peaches, apples, citrus & more",
                image: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                gradient: "from-texas-green-600",
              },
              {
                title: "Decorative Trees",
                description: "Shade trees & ornamental varieties",
                image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                gradient: "from-earth-500",
              },
              {
                title: "Hanging Baskets",
                description: "Indoor & outdoor arrangements",
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                gradient: "from-bluebonnet-600",
              },
            ].map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="w-full h-64 object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} via-transparent to-transparent`}>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

          {galleryImages.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={galleryImages[0]?.imageUrl || "https://pixabay.com/get/gba534e36b616ba6e8d00279eb62c12e7e3bcaa573f5b5e662ed0a534cb14dd9501eee8aa8dc616645188438e0f893a867348d80ebb6a8d116f54647dd2e5009e_1280.jpg"} 
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
                <div className="flex items-center">
                  <Clock className="text-bluebonnet-600 w-6 h-6 mr-3" />
                  <span className="text-gray-700">Mon-Sat 8AM-6PM, Sun 10AM-4PM</span>
                </div>
                <div className="flex items-center">
                  <Truck className="text-bluebonnet-600 w-6 h-6 mr-3" />
                  <span className="text-gray-700">Delivery Available Statewide</span>
                </div>
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
