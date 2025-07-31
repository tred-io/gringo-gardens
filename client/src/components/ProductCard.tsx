import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getCategoryBadgeColor = (categoryId: string) => {
    // This would be better with actual category data, but for now using simple logic
    const colors = {
      'native': 'bg-bluebonnet-100 text-bluebonnet-800',
      'fruit': 'bg-texas-green-100 text-texas-green-800',
      'decorative': 'bg-earth-100 text-earth-800',
      'baskets': 'bg-bluebonnet-100 text-bluebonnet-800',
    };
    return colors.native; // Default color
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="aspect-w-16 aspect-h-12">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <Badge className={`mb-2 ${getCategoryBadgeColor(product.categoryId || '')}`}>
          {product.categoryId || 'Product'}
        </Badge>
        <h3 className="text-xl font-bold text-bluebonnet-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-texas-green-600">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
            View Details
          </Button>
        </div>
        {product.stock !== null && product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <p className="text-orange-600 text-sm mt-2">Only {product.stock} left in stock!</p>
        )}
        {product.stock === 0 && (
          <p className="text-red-600 text-sm mt-2">Out of stock</p>
        )}
      </CardContent>
    </Card>
  );
}
