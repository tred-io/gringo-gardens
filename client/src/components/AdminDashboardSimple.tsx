import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Sprout, 
  FileText, 
  Image, 
  Star, 
  Mail, 
  Settings,
  LogOut
} from "lucide-react";

export default function AdminDashboardSimple() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Test API connectivity first
  const { data: apiTest, isLoading: isApiLoading, error: apiError } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  // Show deployment message only if API fails
  if (!isApiLoading && apiError && !apiTest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-bluebonnet-900 mb-4">Admin Dashboard</h1>
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <p className="text-gray-600 mb-4">
                Backend API is not available in this deployment environment.
              </p>
              <p className="text-sm text-gray-500">
                Full admin functionality is available when the backend is deployed.
              </p>
              <button
                onClick={() => {
                  sessionStorage.removeItem("adminAuthenticated");
                  window.location.href = "/";
                }}
                className="mt-4 px-4 py-2 bg-bluebonnet-600 text-white rounded hover:bg-bluebonnet-700"
              >
                Return to Website
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isApiLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-bluebonnet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Simple queries with null handling
  const { data: products } = useQuery({
    queryKey: ["/api/admin/products"],
    retry: false,
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/admin/categories"], 
    retry: false,
  });

  const { data: blogPosts } = useQuery({
    queryKey: ["/api/admin/blog"],
    retry: false,
  });

  const { data: galleryImages } = useQuery({
    queryKey: ["/api/admin/gallery"],
    retry: false,
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/admin/reviews"],
    retry: false,
  });

  const { data: contactMessages } = useQuery({
    queryKey: ["/api/admin/contact"],
    retry: false,
  });

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bluebonnet-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your nursery website content</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Sprout className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(products as any[] || []).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total products in catalog
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(categories as any[] || []).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Product categories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(galleryImages as any[] || []).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Images in gallery
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(blogPosts as any[] || []).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Published articles
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(reviews as any[] || []).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Customer reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(contactMessages as any[] || []).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Contact messages
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(products as any[] || []).length > 0 ? (
                    (products as any[]).map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold text-bluebonnet-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">${product.price}</p>
                          {product.featured && <Badge className="mt-1">Featured</Badge>}
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={product.active ? "default" : "secondary"}>
                            {product.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No products found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(categories as any[] || []).length > 0 ? (
                    (categories as any[]).map((category: any) => (
                      <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold text-bluebonnet-900">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          {category.showOnHomepage && <Badge className="mt-1">Homepage</Badge>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No categories found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs with simple content */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{(galleryImages as any[] || []).length} images in gallery</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{(blogPosts as any[] || []).length} blog posts</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(reviews as any[] || []).length > 0 ? (
                    (reviews as any[]).slice(0, 5).map((review: any) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-bluebonnet-900">{review.customerName}</h4>
                          <div className="flex">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.content}</p>
                        {review.featured && <Badge className="mt-2">Featured</Badge>}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No reviews found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}