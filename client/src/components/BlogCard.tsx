import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Clock } from "lucide-react";
import type { BlogPost } from "@shared/schema";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const getCategoryBadgeColor = (category: string | null) => {
    const colors = {
      'native-species': 'bg-bluebonnet-100 text-bluebonnet-800',
      'fruit-trees': 'bg-texas-green-100 text-texas-green-800',
      'indoor-plants': 'bg-texas-green-100 text-texas-green-800',
      'seasonal-care': 'bg-earth-100 text-earth-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string | null) => {
    const labels = {
      'native-species': 'Native Species',
      'fruit-trees': 'Fruit Trees',
      'indoor-plants': 'Indoor Plants',
      'seasonal-care': 'Seasonal Care',
    };
    return labels[category as keyof typeof labels] || category || 'Blog Post';
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div className="aspect-w-16 aspect-h-12">
        {post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <Badge className={`mb-3 ${getCategoryBadgeColor(post.category)}`}>
          {getCategoryLabel(post.category)}
        </Badge>
        <h3 className="text-xl font-bold text-bluebonnet-900 mb-3 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}</span>
          </div>
          {post.readTime && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{post.readTime} min read</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
