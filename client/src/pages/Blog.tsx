import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/BlogCard";
import { SEOHead } from "@/components/SEOHead";
import { trackEvent } from "@/lib/analytics";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: allPosts = [], isLoading } = useQuery<BlogPost[] | null>({
    queryKey: ["/api/blog"],
  });

  const filteredPosts = activeFilter === "all" 
    ? (allPosts || []) 
    : (allPosts || []).filter(post => post.category === activeFilter);

  const featuredPost = (allPosts || [])[0];

  const filters = [
    { id: "all", label: "All Posts" },
    { id: "native-species", label: "Native Species" },
    { id: "fruit-trees", label: "Fruit Trees" },
    { id: "indoor-plants", label: "Indoor Plants" },
    { id: "seasonal-care", label: "Seasonal Care" },
  ];

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    trackEvent('filter_blog', 'engagement', filterId);
  };

  return (
    <section className="py-12">
      <SEOHead
        title="Texas Native Plant Care Blog - Expert Tips & Advice"
        description="Expert gardening tips, plant care guides, and seasonal advice for growing native Texas plants. Learn from Gringo Gardens' horticultural experts."
        keywords="Texas plant care, native plant gardening tips, drought tolerant garden advice, Central Texas gardening blog, seasonal plant care"
        url="/blog"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-bluebonnet-900 mb-4">
            Plant Care Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert tips and advice for growing beautiful native Texas plants
          </p>
        </div>

        {/* Blog Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filters.map(filter => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              onClick={() => handleFilterChange(filter.id)}
              className={activeFilter === filter.id 
                ? "bg-bluebonnet-600 hover:bg-bluebonnet-700" 
                : "hover:bg-gray-100"
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPost && activeFilter === "all" && (
          <div className="bg-bluebonnet-50 rounded-2xl p-8 mb-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block bg-bluebonnet-600 text-white text-sm px-3 py-1 rounded-full mb-4">Featured</span>
                <h2 className="text-3xl font-bold text-bluebonnet-900 mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-700 text-lg mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <span>{featuredPost.createdAt ? new Date(featuredPost.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                    {featuredPost.readTime && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{featuredPost.readTime} min read</span>
                      </>
                    )}
                  </div>
                  <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                    Read More
                  </Button>
                </div>
              </div>
              <div>
                {featuredPost.imageUrl && (
                  <img 
                    src={featuredPost.imageUrl} 
                    alt={featuredPost.title} 
                    className="rounded-xl shadow-lg w-full h-64 object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {filteredPosts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts found for this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
