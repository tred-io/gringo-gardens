import { useState } from "react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";
import { FaGoogle, FaYoutube, FaTiktok, FaTwitter } from "react-icons/fa";
import logoPath from "../../../attached_assets/gringogardens_logo_1755358597034.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  // Fetch business hours and closure settings
  const { data: businessHoursSetting } = useQuery({
    queryKey: ["/api/settings/business_hours"],
    retry: false,
  });

  const { data: temporaryClosureSetting } = useQuery({
    queryKey: ["/api/settings/temporary_closure"],
    retry: false,
  });

  const businessHours = businessHoursSetting?.value ? JSON.parse(businessHoursSetting.value) : null;
  const temporaryClosure = temporaryClosureSetting?.value ? JSON.parse(temporaryClosureSetting.value) : null;

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/newsletter", { email });
    },
    onSuccess: () => {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      newsletterMutation.mutate(email);
    }
  };

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Plants & Trees" },
    { href: "/about", label: "About Us" },
    { href: "/gallery", label: "Gallery" },
    { href: "/blog", label: "Plant Care Blog" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="bg-bluebonnet-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src={logoPath} 
              alt="Gringo Gardens - A Texas Plant Nursery" 
              className="h-16 mb-4 object-contain"
            />
            <p className="text-bluebonnet-200 mb-4">
              Central Texas's premier destination for native plants, fruit trees, and expert horticultural advice.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/gringogardens" target="_blank" rel="noopener noreferrer" className="text-bluebonnet-200 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/gringogardens/" target="_blank" rel="noopener noreferrer" className="text-bluebonnet-200 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://www.youtube.com/@gringogardens" target="_blank" rel="noopener noreferrer" className="text-bluebonnet-200 hover:text-white transition-colors">
                <FaYoutube className="w-6 h-6" />
              </a>
              <a href="https://www.tiktok.com/@gringo.gardens" target="_blank" rel="noopener noreferrer" className="text-bluebonnet-200 hover:text-white transition-colors">
                <FaTiktok className="w-6 h-6" />
              </a>
              <a href="https://x.com/gringogardens" target="_blank" rel="noopener noreferrer" className="text-bluebonnet-200 hover:text-white transition-colors">
                <FaTwitter className="w-6 h-6" />
              </a>
              <a href="https://maps.app.goo.gl/CUMm2TaSBKDaVszGA" target="_blank" rel="noopener noreferrer" className="text-bluebonnet-200 hover:text-white transition-colors">
                <FaGoogle className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className="text-bluebonnet-200 hover:text-white transition-colors">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <Link href="/contact">
                <div className="flex items-center cursor-pointer hover:text-white transition-colors">
                  <MapPin className="text-bluebonnet-400 w-5 h-5 mr-3" />
                  <span className="text-bluebonnet-200 hover:text-white transition-colors">4041 FM 1715<br />Lampasas, TX 76550</span>
                </div>
              </Link>
              <div className="flex items-center">
                <Mail className="text-bluebonnet-400 w-5 h-5 mr-3" />
                <span className="text-bluebonnet-200">info@gringogardens.com</span>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-bold mb-4">Stay Updated</h3>
            <p className="text-bluebonnet-200 mb-4">Get plant care tips and nursery updates</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-bluebonnet-800 border-bluebonnet-700 text-white placeholder-bluebonnet-300 focus:ring-2 focus:ring-bluebonnet-500"
                required
              />
              <Button 
                type="submit" 
                className="w-full bg-texas-green-600 hover:bg-texas-green-500 text-white"
                disabled={newsletterMutation.isPending}
              >
                {newsletterMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Hours of Operation */}
        <div className="mt-12 pt-8 border-t border-bluebonnet-700">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-4">Hours of Operation</h3>
            {temporaryClosure?.closed ? (
              <div className="text-bluebonnet-200">
                <p className="text-orange-300 font-semibold mb-2">Temporarily Closed</p>
                <p className="italic">{temporaryClosure.message}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {businessHours ? (
                  Object.entries(businessHours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="text-bluebonnet-200 capitalize">
                      <strong>{day}:</strong> {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="text-bluebonnet-200">
                      <strong>Monday - Saturday:</strong> 8:00 AM - 6:00 PM
                    </div>
                    <div className="text-bluebonnet-200">
                      <strong>Sunday:</strong> 10:00 AM - 4:00 PM
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-bluebonnet-700 text-center">
          <p className="text-bluebonnet-200">
            © 2025 Gringo Gardens. All rights reserved. | Serving Texas with native plants since 2019.
          </p>
        </div>
      </div>
    </footer>
  );
}
