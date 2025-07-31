import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";
import logoPath from "@assets/438299493_734376465563424_2823652752500766968_n_1753941603539.jpg";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Plants & Trees" },
    { href: "/about", label: "About Us" },
    { href: "/gallery", label: "Gallery" },
    { href: "/blog", label: "Plant Care Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <img 
                src={logoPath} 
                alt="Gringo Gardens Logo" 
                className="h-10 lg:h-12 object-contain"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={`font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-bluebonnet-900"
                    : "text-gray-700 hover:text-bluebonnet-600"
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href="/admin">
                  <span className={`font-medium transition-colors ${
                    isActive("/admin")
                      ? "text-bluebonnet-900"
                      : "text-gray-700 hover:text-bluebonnet-600"
                  }`}>
                    Admin
                  </span>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-bluebonnet-600 text-bluebonnet-600 hover:bg-bluebonnet-50"
                  onClick={() => window.location.href = '/'}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <Button 
                className="bg-bluebonnet-600 hover:bg-bluebonnet-700 text-white"
                onClick={() => window.location.href = '/api/login'}
              >
                Log In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-bluebonnet-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`block px-3 py-2 font-medium ${
                      isActive(item.href)
                        ? "text-bluebonnet-900"
                        : "text-gray-700 hover:text-bluebonnet-600"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link href="/admin">
                    <span
                      className={`block px-3 py-2 font-medium ${
                        isActive("/admin")
                          ? "text-bluebonnet-900"
                          : "text-gray-700 hover:text-bluebonnet-600"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </span>
                  </Link>
                  <div className="px-3 py-2">
                    <Button 
                      variant="outline" 
                      className="w-full border-bluebonnet-600 text-bluebonnet-600 hover:bg-bluebonnet-50"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = '/';
                      }}
                    >
                      Log Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="px-3 py-2">
                  <Button 
                    className="w-full bg-bluebonnet-600 hover:bg-bluebonnet-700 text-white"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.location.href = '/api/login';
                    }}
                  >
                    Log In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
