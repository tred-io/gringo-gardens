import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Heart, Users } from "lucide-react";

export default function About() {
  const teamMembers = [
    {
      name: "Ellis Baty",
      role: "Founder & Head Horticulturist",
      description: "Native plant expert with 15+ years of experience in Texas flora. Passionate advocate for sustainable landscaping.",
      initials: "EB",
      bgColor: "bg-bluebonnet-100",
      textColor: "text-bluebonnet-600",
    },
    {
      name: "Jess",
      role: "Plant Specialist",
      description: "Helps customers select the perfect trees for their landscape goals.",
      initials: "J",
      bgColor: "bg-texas-green-100",
      textColor: "text-texas-green-600",
    },
    // {
    //   name: "",
    //   role: "Customer Care Manager",
    //   description: "Your first point of contact for plant care questions, order assistance, and design consultations. Always ready to help you succeed.",
    //   initials: "SR",
    //   bgColor: "bg-earth-100",
    //   textColor: "text-earth-500",
    // },
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-bluebonnet-900 mb-6">
            Our Story
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            From a passion for native Texas flora to becoming Central Texas's trusted plant nursery
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
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Founded in 2019 in the heart of Lampasas, Gringo Gardens began as a small operation with a big dream: to help Texans create beautiful, sustainable landscapes using the incredible diversity of native plants that call the Lone Star State home.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              What started as a weekend hobby of propagating plants and other wildflowers has grown into Central Texas's premier destination for native plants, fruit trees, and expert horticultural advice. We've remained committed to our original mission: promoting the beauty and ecological benefits of native Texas flora.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Today, we serve customers across Texas and beyond, offering our carefully cultivated plants to gardeners who share our passion for authentic Texas landscapes that support local wildlife and thrive in our unique climate.
            </p>
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

        {/* Team Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-bluebonnet-900 mb-4">Meet Our Team</h2>
          <p className="text-xl text-gray-600">The passionate people behind Gringo Gardens</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.name} className="shadow-lg">
              <CardContent className="p-8 text-center">
                <div className={`w-24 h-24 ${member.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className={`text-2xl font-bold ${member.textColor}`}>{member.initials}</span>
                </div>
                <h3 className="text-xl font-bold text-bluebonnet-900 mb-2">{member.name}</h3>
                <p className="text-bluebonnet-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
