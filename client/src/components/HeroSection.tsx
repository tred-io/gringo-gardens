import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center text-white">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1523275353616-af4c9c0c8b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-bluebonnet-900 bg-opacity-40"></div>
      </div>
      
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Native Texas Plants<br />
          <span className="text-texas-green-400">Grown with Pride</span>
        </h1>
        <p className="text-xl sm:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed">
          Discover authentic Central Texas flora at Gringo Gardens. From bluebonnets to fruit trees, we nurture the plants that thrive in our beautiful Texas landscape.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button className="bg-texas-green-600 hover:bg-texas-green-500 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105">
              Shop Native Plants
            </Button>
          </Link>
          <Link href="/contact">
            <Button 
              variant="outline" 
              className="border-2 border-white hover:bg-white hover:text-bluebonnet-900 text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              Visit Our Nursery
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
