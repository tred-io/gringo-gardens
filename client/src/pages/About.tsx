import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Leaf, Heart, Users } from "lucide-react";
import { SEOHead } from "../components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema";

export default function About() {
  const { data: teamMembers = [] } = useQuery<TeamMember[] | null>({
    queryKey: ["/api/team"],
  });

  // Fetch About page content from CMS
  const { data: aboutPageSetting } = useQuery({
    queryKey: ["/api/settings/page_content_about"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Parse about page content from CMS
  const aboutContent = (aboutPageSetting as any)?.value ? JSON.parse((aboutPageSetting as any).value) : null;

  return (
    <section className="py-12">
      <SEOHead
        title="About Gringo Gardens - Native Plant Experts"
        description="Learn about Gringo Gardens, Central Texas's trusted native plant nursery in Lampasas. Meet our expert team and discover our commitment to sustainable landscaping."
        keywords="Gringo Gardens, native plant experts, Lampasas nursery, Ellis Baty, Texas plant specialists, sustainable landscaping"
        url="/about"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-bluebonnet-900 mb-6">
            {aboutContent?.pageTitle || "Our Story"}
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {aboutContent?.heroSubtitle || "From a passion for native Texas flora to becoming Central Texas's trusted plant nursery"}
          </p>
        </div>

        {/* Story Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          <div>
            <img
              src="/nursery-photo.jpg"
              alt="Gringo Gardens nursery with shade structures and native plants at sunset"
              className="rounded-2xl shadow-2xl"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-bluebonnet-900 mb-6">Growing Texas Heritage</h2>
            <div className="text-lg text-gray-700 leading-relaxed">
              {aboutContent?.story ? (
                <div dangerouslySetInnerHTML={{ __html: aboutContent.story.replace(/\n/g, '</p><p class="mb-6">') }} />
              ) : (
                <>
                  <p className="mb-6">
                    Founded in 2019 in the heart of Lampasas, Gringo Gardens began as a small operation with a big dream: to help Texans create beautiful, sustainable landscapes using the incredible diversity of native plants that call the Lone Star State home.
                  </p>
                  <p className="mb-6">
                    What started as a weekend hobby of propagating plants and other wildflowers has grown into Central Texas's premier destination for native plants, fruit trees, and expert horticultural advice. We've remained committed to our original mission: promoting the beauty and ecological benefits of native Texas flora.
                  </p>
                  <p>
                    Today, we serve customers across Texas and beyond, offering our carefully cultivated plants to gardeners who share our passion for authentic Texas landscapes that support local wildlife and thrive in our unique climate.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="bg-bluebonnet-50 rounded-2xl p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-bluebonnet-900 mb-4">Our Mission & Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-bluebonnet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-white text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-bluebonnet-900 mb-3">Native Focus</h3>
              <p className="text-gray-700">We specialize in plants that naturally belong in Texas, supporting local ecosystems and requiring less water and maintenance.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-texas-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-white text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-bluebonnet-900 mb-3">Quality Care</h3>
              <p className="text-gray-700">Every plant receives individual attention and care, ensuring you receive healthy, vigorous specimens ready to thrive in your garden.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-earth-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-bluebonnet-900 mb-3">Expert Guidance</h3>
              <p className="text-gray-700">Our team provides personalized advice to help you choose the right plants for your specific location, soil, and design goals.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
