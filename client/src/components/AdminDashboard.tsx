import React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Switch } from "./ui/switch";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { isUnauthorizedError } from "../lib/authUtils";
import { 
  Sprout, 
  FileText, 
  Image, 
  Star, 
  Mail, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Check,
  X,
  Globe,
  Home,
  Info,
  Phone,
  Save,
  Search,
  Upload
} from "lucide-react";
import { ObjectUploader } from "./ObjectUploader";
import { GalleryImageSelector } from "./GalleryImageSelector";
import type { 
  Product, 
  BlogPost, 
  GalleryImage, 
  Review, 
  ContactMessage,
  Category,
  TeamMember,
  NewsletterSubscriber,
  Setting,
  InsertProduct,
  InsertBlogPost,
  InsertGalleryImage,
  InsertCategory,
  InsertReview
} from "@shared/schema";

// Form schemas
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  hardinessZone: z.string().optional(),
  sunRequirements: z.string().optional(),
  stock: z.number().min(0).optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  // AI plant identification fields
  texasNative: z.boolean().optional(),
  droughtTolerance: z.string().optional(),
  indoorOutdoor: z.string().optional(),
  bloomSeason: z.string().optional(),
  matureSize: z.string().optional(),
});

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  published: z.boolean().default(false),
  readTime: z.number().min(1).optional(),
});

const galleryImageSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required"),
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags for filtering
  featured: z.boolean().default(false),
});

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  showOnHomepage: z.boolean().default(false),
});

const reviewSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be 5 or less"),
  content: z.string().min(1, "Review content is required"),
  approved: z.boolean().default(true),
  featured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;
type BlogPostFormData = z.infer<typeof blogPostSchema>;
type GalleryImageFormData = z.infer<typeof galleryImageSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;
type ReviewFormData = z.infer<typeof reviewSchema>;

export default function AdminDashboard() {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  
  // Check if APIs are working by testing a simple query
  const { data: apiTest, isLoading: isApiLoading, error: apiError } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  const [activeTab, setActiveTab] = useState("products");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingGalleryImage, setEditingGalleryImage] = useState<GalleryImage | null>(null);
  const [filters, setFilters] = useState({
    productCategory: "",
    productSearch: "",
    productStatus: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Settings state
  const [businessHours, setBusinessHours] = useState({
    monday: { open: "08:00", close: "18:00", closed: false },
    tuesday: { open: "08:00", close: "18:00", closed: false },
    wednesday: { open: "08:00", close: "18:00", closed: false },
    thursday: { open: "08:00", close: "18:00", closed: false },
    friday: { open: "08:00", close: "18:00", closed: false },
    saturday: { open: "08:00", close: "18:00", closed: false },
    sunday: { open: "10:00", close: "16:00", closed: false },
  });
  const [isTemporarilyClosed, setIsTemporarilyClosed] = useState(false);
  const [closureMessage, setClosureMessage] = useState("");

  // Queries - settings must come first for useEffect
  const { data: settings = [] } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<Product[] | null>({
    queryKey: ["/api/admin/products", filters],
    retry: false,
  });

  const { data: categories = [] } = useQuery<Category[] | null>({
    queryKey: ["/api/admin/categories"],
    retry: false,
  });

  const { data: blogPosts = [] } = useQuery<BlogPost[] | null>({
    queryKey: ["/api/admin/blog"],
    retry: false,
  });

  const { data: galleryImages = [], isLoading: galleryLoading, error: galleryError } = useQuery<GalleryImage[] | null>({
    queryKey: ["/api/admin/gallery"],
    retry: false,
  });

  const { data: reviews = [] } = useQuery<Review[] | null>({
    queryKey: ["/api/admin/reviews"],
    retry: false,
  });

  const { data: contactMessages = [] } = useQuery<ContactMessage[] | null>({
    queryKey: ["/api/admin/contact"],
    retry: false,
  });

  const { data: newsletterSubscribers = [], isLoading: subscribersLoading, error: subscribersError } = useQuery<NewsletterSubscriber[] | null>({
    queryKey: ["/api/newsletter/subscribers"],
    retry: false,
  });

  // Load settings on component mount
  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const businessHoursSetting = settings.find((s: any) => s.key === 'business_hours');
      const temporaryClosureSetting = settings.find((s: any) => s.key === 'temporary_closure');
      
      if (businessHoursSetting?.value) {
        setBusinessHours(JSON.parse(businessHoursSetting.value));
      }
      
      if (temporaryClosureSetting?.value) {
        const closure = JSON.parse(temporaryClosureSetting.value);
        setIsTemporarilyClosed(closure.closed);
        setClosureMessage(closure.message || "");
      }
    }
  }, [settings]);

  // Settings mutations
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return await apiRequest("PUT", `/api/admin/settings-update?key=${key}`, { value });
    },
    onSuccess: (_, variables) => {
      // Invalidate all settings-related queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${variables.key}`] });
      // Also invalidate any cached queries that might contain this setting
      queryClient.refetchQueries({ queryKey: [`/api/settings/${variables.key}`] });
      console.log(`Cache invalidated for setting: ${variables.key}`);
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  // Team member state and queries
  const { data: teamMembers = [] } = useQuery<TeamMember[] | null>({
    queryKey: ["/api/team"],
  });

  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);

  // Team member form schema
  const teamMemberSchema = z.object({
    name: z.string().min(1, "Name is required"),
    position: z.string().min(1, "Position is required"),
    bio: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    order: z.number().min(0).default(0),
    active: z.boolean().default(true),
  });

  type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

  const teamMemberForm = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      position: "",
      bio: "",
      imageUrl: "",
      email: "",
      phone: "",
      order: 0,
      active: true,
    },
  });

  // Forms
  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: "",
      imageUrl: "",
      categoryId: "",
      hardinessZone: "",
      sunRequirements: "",
      stock: 0,
      featured: false,
      active: true,
    },
  });

  const blogForm = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      category: "",
      published: false,
      readTime: 5,
    },
  });

  const galleryForm = useForm<GalleryImageFormData>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      category: "",
      featured: false,
    },
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      showOnHomepage: false,
    },
  });

  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      customerName: "",
      rating: 5,
      content: "",
      approved: true,
      featured: false,
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      return await apiRequest("POST", "/api/admin/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: "Product created successfully!" });
      setIsProductDialogOpen(false);
      productForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error creating product", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProduct> }) => {
      return await apiRequest("PUT", `/api/admin/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: "Product updated successfully!" });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error updating product", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/products?id=${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: "Product deleted successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error deleting product", variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      return await apiRequest("POST", "/api/admin/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({ title: "Category created successfully!" });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error creating category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCategory> }) => {
      return await apiRequest("PUT", `/api/admin/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({ title: "Category updated successfully!" });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error updating category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/categories?id=${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({ title: "Category deleted successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error deleting category", variant: "destructive" });
    },
  });

  const createBlogPostMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      return await apiRequest("POST", "/api/admin/blog", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      toast({ title: "Blog post created successfully!" });
      setIsBlogDialogOpen(false);
      blogForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error creating blog post", variant: "destructive" });
    },
  });

  const updateBlogPostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBlogPost> }) => {
      return await apiRequest("PUT", `/api/admin/blog/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      toast({ title: "Blog post updated successfully!" });
      setIsBlogDialogOpen(false);
      setEditingPost(null);
      blogForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error updating blog post", variant: "destructive" });
    },
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/blog?id=${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      toast({ title: "Blog post deleted successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error deleting blog post", variant: "destructive" });
    },
  });

  const createGalleryImageMutation = useMutation({
    mutationFn: async (data: InsertGalleryImage) => {
      return await apiRequest("POST", "/api/admin/gallery", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Gallery image added successfully!" });
      handleCloseGalleryDialog();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error adding gallery image", variant: "destructive" });
    },
  });

  const updateGalleryImageMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & GalleryImageFormData) => {
      return await apiRequest("PUT", `/api/admin/gallery/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Gallery image updated successfully!" });
      handleCloseGalleryDialog();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error updating gallery image", variant: "destructive" });
    },
  });

  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/gallery?id=${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Gallery image deleted successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error deleting gallery image", variant: "destructive" });
    },
  });

  const identifyPlantMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/admin/gallery?id=${id}&action=identify`, {});
    },
    onSuccess: () => {
      // Invalidate immediately and then again after a delay to catch the backend update
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      
      // Refresh again after the identification should be complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      }, 3000);
      
      // Final refresh to ensure we catch any delayed updates
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      }, 8000);
      
      // Plant identification starts silently - UI will update automatically when complete
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Error identifying plant", 
        description: "Failed to start AI plant identification",
        variant: "destructive" 
      });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: InsertReview) => {
      return await apiRequest("POST", "/api/admin/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Review created successfully!" });
      setIsReviewDialogOpen(false);
      reviewForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error creating review", variant: "destructive" });
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { featured?: boolean; approved?: boolean } }) => {
      return await apiRequest("PUT", `/api/admin/reviews/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Review updated successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error updating review", variant: "destructive" });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/reviews?id=${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Review deleted successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error deleting review", variant: "destructive" });
    },
  });

  const markMessageReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/admin/contact?id=${id}&action=read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact"] });
      toast({ title: "Message marked as read!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error marking message as read", variant: "destructive" });
    },
  });

  // Event handlers
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price || "",
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId || "",
      hardinessZone: product.hardinessZone || "",
      sunRequirements: product.sunRequirements || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      active: product.active || true,
    });
    setIsProductDialogOpen(true);
  };

  const handleEditBlogPost = (post: BlogPost) => {
    setEditingPost(post);
    blogForm.reset({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      imageUrl: post.imageUrl || "",
      category: post.category || "",
      published: post.published || false,
      readTime: post.readTime || 5,
    });
    setIsBlogDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      showOnHomepage: category.showOnHomepage || false,
    });
    setIsCategoryDialogOpen(true);
  };

  const onProductSubmit = (data: ProductFormData) => {
    const productData = {
      ...data,
      price: data.price,
      stock: Number(data.stock) || 0,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const onBlogPostSubmit = (data: BlogPostFormData) => {
    if (editingPost) {
      updateBlogPostMutation.mutate({ id: editingPost.id, data });
    } else {
      createBlogPostMutation.mutate(data);
    }
  };

  const onGalleryImageSubmit = (data: GalleryImageFormData) => {
    // Convert comma-separated tags string to array for backend processing
    const processedData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
    };
    
    if (editingGalleryImage) {
      const updateData = {
        id: editingGalleryImage.id,
        imageUrl: processedData.imageUrl,
        title: processedData.title,
        description: processedData.description,
        category: processedData.category,
        tags: processedData.tags.join(','), // Convert to comma-separated string for mutation interface
        featured: processedData.featured
      };
      updateGalleryImageMutation.mutate(updateData as any);
    } else {
      const createData = {
        imageUrl: processedData.imageUrl,
        title: processedData.title,
        description: processedData.description,
        category: processedData.category,
        tags: processedData.tags.join(','), // Convert to comma-separated string for mutation interface
        featured: processedData.featured
      };
      createGalleryImageMutation.mutate(createData as any);
    }
  };

  const onCategorySubmit = (data: CategoryFormData) => {
    const categoryData = {
      ...data,
      active: true // Default to active for new categories
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryData });
    } else {
      createCategoryMutation.mutate(categoryData);
    }
  };

  const onReviewSubmit = (data: ReviewFormData) => {
    createReviewMutation.mutate(data);
  };

  const handleEditGalleryImage = (image: GalleryImage) => {
    setEditingGalleryImage(image);
    galleryForm.reset({
      title: image.title || "",
      description: image.description || "",
      imageUrl: image.imageUrl,
      category: image.category || "",
      tags: Array.isArray(image.tags) ? image.tags.join(", ") : (image.tags || ""),
      featured: image.featured || false,
    });
    setIsGalleryDialogOpen(true);
  };

  const handleCloseGalleryDialog = () => {
    setIsGalleryDialogOpen(false);
    setEditingGalleryImage(null);
    galleryForm.reset();
  };

  const handleCloseProductDialog = () => {
    setIsProductDialogOpen(false);
    setEditingProduct(null);
    productForm.reset();
  };

  const handleCloseBlogDialog = () => {
    setIsBlogDialogOpen(false);
    setEditingPost(null);
    blogForm.reset();
  };

  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
    categoryForm.reset();
  };

  const handleCloseTeamDialog = () => {
    setIsTeamDialogOpen(false);
    setEditingTeamMember(null);
    teamMemberForm.reset();
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
    teamMemberForm.reset({
      name: member.name,
      position: member.position,
      bio: member.bio || "",
      imageUrl: member.imageUrl || "",
      order: member.order || 0,
      active: member.active || true,
    });
    setIsTeamDialogOpen(true);
  };

  // Team member mutations
  const createTeamMemberMutation = useMutation({
    mutationFn: async (data: TeamMemberFormData) => {
      return await apiRequest("POST", "/api/team", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: "Team member added successfully!" });
      setIsTeamDialogOpen(false);
      teamMemberForm.reset();
    },
    onError: () => {
      toast({ title: "Error adding team member", variant: "destructive" });
    },
  });

  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TeamMemberFormData }) => {
      return await apiRequest("PUT", `/api/team/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: "Team member updated successfully!" });
      setIsTeamDialogOpen(false);
      setEditingTeamMember(null);
      teamMemberForm.reset();
    },
    onError: () => {
      toast({ title: "Error updating team member", variant: "destructive" });
    },
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/team/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: "Team member removed successfully!" });
    },
    onError: () => {
      toast({ title: "Error removing team member", variant: "destructive" });
    },
  });

  const onTeamMemberSubmit = (data: TeamMemberFormData) => {
    if (editingTeamMember) {
      updateTeamMemberMutation.mutate({ id: editingTeamMember.id, data });
    } else {
      createTeamMemberMutation.mutate(data);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const stats = [
    {
      label: "Products",
      value: products?.length || 0,
      icon: Sprout,
      color: "bg-bluebonnet-100 text-bluebonnet-600",
    },
    {
      label: "Blog Posts",
      value: blogPosts?.length || 0,
      icon: FileText,
      color: "bg-texas-green-100 text-texas-green-600",
    },
    {
      label: "Gallery Images",
      value: galleryImages?.length || 0,
      icon: Image,
      color: "bg-earth-100 text-earth-500",
    },
    {
      label: "New Messages",
      value: contactMessages?.filter(msg => !msg.read).length || 0,
      icon: Mail,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <section className="py-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bluebonnet-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your nursery website content</p>
          </div>
          <Button 
            variant="destructive"
            onClick={() => window.location.href = "/api/logout"}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-bluebonnet-900">{stat.value}</h3>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-9">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="blog">Blog Posts</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>

            {/* Products Tab */}
            <TabsContent value="products" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-bluebonnet-900">Product Management</h2>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...productForm}>
                      <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={productForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={productForm.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Leave empty for 'Contact for Price'" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="stock"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stock (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    placeholder="Leave empty for 'Available'"
                                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={productForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  )) || []}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Image</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Input {...field} placeholder="https://..." />
                                  <div className="flex gap-2">
                                    <GalleryImageSelector
                                      onSelect={(imageUrl, galleryImage) => {
                                        field.onChange(imageUrl);
                                        // Transfer AI plant identification data to product fields
                                        if (galleryImage) {
                                          // Update product name with plant name
                                          if (galleryImage.title && galleryImage.title !== "Untitled" && galleryImage.title !== "Uploaded Image") {
                                            productForm.setValue('name', galleryImage.title);
                                            // Auto-generate slug from plant name
                                            const slug = galleryImage.title.toLowerCase()
                                              .replace(/[^a-z0-9 -]/g, '') // Remove special characters
                                              .replace(/\s+/g, '-') // Replace spaces with hyphens
                                              .replace(/-+/g, '-'); // Remove duplicate hyphens
                                            productForm.setValue('slug', slug);
                                          }
                                          
                                          // Update description with plant details
                                          if (galleryImage.description) {
                                            productForm.setValue('description', galleryImage.description);
                                          }
                                          
                                          // Map plant category to product category
                                          if (galleryImage.category) {
                                            // Try to find matching category or use the gallery category
                                            const matchingCategory = categories?.find(cat => 
                                              cat.id === galleryImage.category || 
                                              cat.name.toLowerCase().includes(galleryImage.category?.toLowerCase() || '')
                                            );
                                            if (matchingCategory) {
                                              productForm.setValue('categoryId', matchingCategory.id);
                                            }
                                          }
                                          
                                          // Transfer ALL AI plant identification data to product
                                          if (galleryImage.hardinessZone) {
                                            productForm.setValue('hardinessZone', galleryImage.hardinessZone);
                                          }
                                          if (galleryImage.sunPreference) {
                                            productForm.setValue('sunRequirements', galleryImage.sunPreference);
                                          }
                                          if (galleryImage.texasNative !== null && galleryImage.texasNative !== undefined) {
                                            productForm.setValue('texasNative', galleryImage.texasNative);
                                          }
                                          if (galleryImage.droughtTolerance) {
                                            productForm.setValue('droughtTolerance', galleryImage.droughtTolerance);
                                          }
                                          if (galleryImage.indoorOutdoor) {
                                            productForm.setValue('indoorOutdoor', galleryImage.indoorOutdoor);
                                          }
                                          // Note: bloomSeason and matureSize not available in gallery schema but could be added later
                                        }
                                      }}
                                      selectedImageUrl={field.value}
                                    />
                                    <ObjectUploader
                                      maxNumberOfFiles={1}
                                      maxFileSize={10485760}
                                      onGetUploadParameters={() => apiRequest("POST", "/api/objects/upload", {}).then(r => ({ method: "PUT" as const, url: (r as any).uploadURL }))}
                                      onComplete={(result) => {
                                        if (result.successful && result.successful.length > 0) {
                                          field.onChange(result.successful[0].uploadURL);
                                        }
                                      }}
                                      buttonClassName="text-sm"
                                    >
                                      Upload New
                                    </ObjectUploader>
                                  </div>
                                  {field.value && (
                                    <div className="mt-2">
                                      <img 
                                        src={field.value} 
                                        alt="Preview" 
                                        className="w-20 h-20 object-cover rounded border" 
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-4">
                          <Button type="submit" className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                            {editingProduct ? "Update Product" : "Create Product"}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleCloseProductDialog}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Product Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Select value={filters.productCategory} onValueChange={(value) => updateFilter("productCategory", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search products..."
                  value={filters.productSearch}
                  onChange={(e) => updateFilter("productSearch", e.target.value)}
                />
                <Select value={filters.productStatus} onValueChange={(value) => updateFilter("productStatus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(Array.isArray(products) ? products : []).map(product => (
                      <tr key={product.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4">
                              {product.imageUrl && (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {(Array.isArray(categories) ? categories : []).find(c => c.id === product.categoryId)?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.price ? `$${product.price}` : 'Contact for Price'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.stock !== null && product.stock !== undefined ? product.stock : 'Available'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={product.active ? "default" : "destructive"}>
                            {product.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-bluebonnet-900">Plant Collections (Categories)</h2>
                  <p className="text-gray-600">Manage categories that appear as plant collections on the home page</p>
                </div>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Collection
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <Form {...categoryForm}>
                      <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                        <FormField
                          control={categoryForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={categoryForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={categoryForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (shown on home page collections)</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} placeholder="Brief description for the plant collection card" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={categoryForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Collection Image</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Input {...field} placeholder="https://..." />
                                  <div className="flex gap-2">
                                    <GalleryImageSelector
                                      onSelect={field.onChange}
                                      selectedImageUrl={field.value}
                                    />
                                    <ObjectUploader
                                      maxNumberOfFiles={1}
                                      maxFileSize={10485760}
                                      onGetUploadParameters={() => apiRequest("POST", "/api/objects/upload", {}).then(r => ({ method: "PUT" as const, url: (r as any).uploadURL }))}
                                      onComplete={(result) => {
                                        if (result.successful && result.successful.length > 0) {
                                          field.onChange(result.successful[0].uploadURL);
                                        }
                                      }}
                                      buttonClassName="text-sm"
                                    >
                                      Upload New
                                    </ObjectUploader>
                                  </div>
                                  {field.value && (
                                    <div className="mt-2">
                                      <img 
                                        src={field.value} 
                                        alt="Collection preview" 
                                        className="w-32 h-24 object-cover rounded border" 
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={categoryForm.control}
                          name="showOnHomepage"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Show on Home Page
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Display this collection on the home page (max 4 categories)
                                </p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-4">
                          <Button type="submit" className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                            {editingCategory ? "Update Collection" : "Create Collection"}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleCloseCategoryDialog}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories?.map(category => (
                  <Card key={category.id} className="overflow-hidden">
                    <div className="h-32 bg-gray-100">
                      {category.imageUrl ? (
                        <img 
                          src={category.imageUrl} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-bluebonnet-50 flex items-center justify-center">
                          <span className="text-bluebonnet-400 text-sm">No collection image</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-bluebonnet-900 mb-2">{category.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">/{category.slug}</Badge>
                        {category.showOnHomepage && (
                          <Badge variant="default" className="text-xs bg-bluebonnet-600">
                            Homepage
                          </Badge>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-gray-700 mb-4 text-sm line-clamp-2">{category.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {(Array.isArray(products) ? products : []).filter(p => p.categoryId === category.id).length} products
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
                            disabled={(Array.isArray(products) ? products : []).some(p => p.categoryId === category.id)}
                            title={(Array.isArray(products) ? products : []).some(p => p.categoryId === category.id) ? "Cannot delete - has products" : "Delete category"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(Array.isArray(categories) ? categories : []).length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 mb-4">No plant collections created yet.</p>
                    <p className="text-sm text-gray-400">Collections you create here will appear as plant collections on your home page.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-bluebonnet-900">Blog Management</h2>
                <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...blogForm}>
                      <form onSubmit={blogForm.handleSubmit(onBlogPostSubmit)} className="space-y-4">
                        <FormField
                          control={blogForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Excerpt</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Featured Image</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Input {...field} placeholder="https://..." />
                                  <div className="flex gap-2">
                                    <GalleryImageSelector
                                      onSelect={field.onChange}
                                      selectedImageUrl={field.value}
                                    />
                                    <ObjectUploader
                                      maxNumberOfFiles={1}
                                      maxFileSize={10485760}
                                      onGetUploadParameters={() => apiRequest("POST", "/api/objects/upload", {}).then(r => ({ method: "PUT" as const, url: (r as any).uploadURL }))}
                                      onComplete={(result) => {
                                        if (result.successful && result.successful.length > 0) {
                                          field.onChange(result.successful[0].uploadURL);
                                        }
                                      }}
                                      buttonClassName="text-sm"
                                    >
                                      Upload New
                                    </ObjectUploader>
                                  </div>
                                  {field.value && (
                                    <div className="mt-2">
                                      <img 
                                        src={field.value} 
                                        alt="Preview" 
                                        className="w-20 h-20 object-cover rounded border" 
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={10} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-4">
                          <Button type="submit" className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                            {editingPost ? "Update Post" : "Create Post"}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleCloseBlogDialog}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {(Array.isArray(blogPosts) ? blogPosts : []).map(post => (
                  <Card key={post.id}>
                    <CardContent className="p-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-bluebonnet-900">{post.title}</h3>
                        <p className="text-gray-600">
                          {post.published ? "Published" : "Draft"} • {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditBlogPost(post)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteBlogPostMutation.mutate(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-bluebonnet-900">Gallery Management</h2>
                <div className="flex gap-2">
                  <ObjectUploader
                    maxNumberOfFiles={50}
                    maxFileSize={15728640}
                    onGetUploadParameters={async () => {
                      // Use environment-specific upload endpoint  
                      const isProductionEnv = window.location.hostname.includes('vercel.app');
                      const uploadEndpoint = isProductionEnv ? "/api/blob/upload" : "/api/objects/upload";
                      
                      const response = await fetch(uploadEndpoint, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                      });
                      
                      console.log(`Using upload endpoint: ${uploadEndpoint} (production: ${isProductionEnv})`);
                      console.log("Upload response status:", response.status);
                      
                      if (!response.ok) {
                        throw new Error(`Failed to get upload parameters: ${response.status}`);
                      }
                      
                      const data = await response.json();
                      console.log("Upload parameters from server:", data);
                      
                      // Check if this is Vercel production environment  
                      const isVercelProduction = window.location.hostname.includes('vercel.app') || data.uploadURL?.includes('/api/blob/upload');
                      
                      // Return upload parameters - ObjectUploader will handle URL construction
                      return {
                        method: data.method || "PUT",
                        url: data.uploadURL
                      };
                    }}
                    onComplete={async (result) => {
                      console.log("Upload complete result:", result);
                      let successCount = 0;
                      let errorCount = 0;
                      
                      // Process each uploaded file sequentially
                      if (!result.successful) {
                        throw new Error("Upload failed - no successful files");
                      }
                      
                      for (const file of result.successful) {
                        try {
                          console.log("Processing file:", file);
                          // Extract the actual blob URL from the upload response
                          // Debug the complete file object to understand the structure
                          console.log("Complete file object:", JSON.stringify(file, null, 2));
                          console.log("File response body:", file.response?.body);
                          console.log("File response uploadURL:", file.response?.uploadURL);
                          console.log("File uploadURL:", file.uploadURL);
                          
                          let actualImageURL = null;
                          
                          // Environment detection based on upload URL
                          const isReplit = file.uploadURL && file.uploadURL.includes('storage.googleapis.com');
                          const isVercel = file.uploadURL && (
                            file.uploadURL.includes('vercel-storage.com') || 
                            file.uploadURL.includes('/api/blob/upload')
                          );
                          
                          console.log("Environment detection:", {
                            uploadURL: file.uploadURL,
                            hostname: window.location.hostname,
                            isVercel,
                            isReplit
                          });
                          
                          // Log the complete response structure for debugging
                          console.log("Complete file response structure:", {
                            response: file.response,
                            responseBody: file.response?.body,
                            responseStatus: file.response?.status,
                            responseHeaders: (file.response as any)?.headers
                          });
                          
                          if (isVercel) {
                            // For Vercel uploads in production
                            try {
                              console.log("Processing Vercel upload - file:", file.name);
                              console.log("Upload response:", file.response);
                              
                              // Priority 1: Extract URL from response body (Vercel Blob returns this)
                              if (file.response?.body?.url) {
                                actualImageURL = file.response.body.url;
                                console.log("✅ Found URL in response body:", actualImageURL);
                              }
                              // Priority 2: Use stored blob URL from upload-success event
                              else if ((file as any).blobURL) {
                                actualImageURL = (file as any).blobURL;
                                console.log("✅ Using stored blob URL:", actualImageURL);
                              }
                              // Priority 3: Construct URL from object name and domain
                              else if (file.meta?.objectName) {
                                const blobDomain = "ar8dyzdqhh48e0uf.public.blob.vercel-storage.com";
                                actualImageURL = `https://${blobDomain}/${file.meta.objectName}`;
                                console.log("✅ Constructed blob URL:", actualImageURL);
                              }
                              
                              // Check global map using file ID
                              if (!actualImageURL && (window as any).uploadedBlobUrls) {
                                const urlFromMap = (window as any).uploadedBlobUrls.get(file.id);
                                if (urlFromMap) {
                                  actualImageURL = urlFromMap;
                                  console.log("Using blob URL from global map:", actualImageURL);
                                }
                              }
                              
                              // Fallback construction from meta data
                              if (!actualImageURL && file.meta?.objectName) {
                                const blobDomain = "ar8dyzdqhh48e0uf.public.blob.vercel-storage.com";
                                actualImageURL = `https://${blobDomain}/${file.meta.objectName}`;
                                console.log("Constructed blob URL from meta:", actualImageURL);
                              }
                              
                              if (!actualImageURL) {
                                console.error("Could not extract blob URL using any method for file:", file.name);
                              }
                            } catch (error) {
                              console.error("Error extracting Vercel blob URL:", error);
                            }
                          } else if (isReplit) {
                            // For Replit object storage: convert signed URL to permanent serving URL
                            try {
                              // Extract object path from Google Cloud Storage URL
                              if (!file.uploadURL) throw new Error('Upload URL is missing');
                              const url = new URL(file.uploadURL);
                              const pathParts = url.pathname.split('/');
                              // Path structure: /bucket-name/.private/uploads/filename
                              if (pathParts.length >= 4) {
                                const filename = pathParts[pathParts.length - 1];
                                // Convert to serving URL format
                                actualImageURL = `/objects/uploads/${filename}`;
                                console.log("✅ Converted Replit URL:", file.uploadURL, "->", actualImageURL);
                              }
                            } catch (error) {
                              console.error("Error converting Replit URL:", error);
                              // Fallback: use original URL
                              actualImageURL = file.uploadURL;
                            }
                          } else {
                            // Default case - use uploadURL directly
                            actualImageURL = file.uploadURL;
                            console.log("Using upload URL directly:", actualImageURL);
                          }
                          
                          if (!actualImageURL) {
                            throw new Error(`Upload succeeded but could not determine final URL for file: ${file.name}`);
                          }
                          
                          console.log("Final image URL:", actualImageURL);
                          
                          console.log("Final image URL for gallery:", actualImageURL);
                          
                          // Final validation and fallback
                          if (!actualImageURL) {
                            console.error("❌ FAILED TO EXTRACT IMAGE URL - No URL found for file:", file.name);
                            throw new Error(`Could not determine image URL for ${file.name}`);
                          }
                          
                          // Use unified admin API that works in both environments
                          const response = await apiRequest("POST", "/api/admin/gallery", {
                            image_url: actualImageURL,  // Match database field name
                            title: file.name || "Uploaded Image",
                            alt_text: file.name || "Gallery Image",  // Match database field name
                            category: "general",
                            tags: [], // Empty tags array for bulk uploads
                            featured: false,
                          });
                          
                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
                          }
                          
                          const data = await response.json();
                          console.log("Gallery image created:", data);
                          successCount++;
                        } catch (error) {
                          console.error("Error saving gallery image:", error);
                          errorCount++;
                          toast({
                            title: "Upload Error",
                            description: `Failed to save ${file.name}`,
                            variant: "destructive",
                          });
                        }
                      }
                      
                      // Clear upload tracking data
                      if ((window as any).uploadObjectNames) {
                        (window as any).uploadObjectNames.clear();
                      }
                      if ((window as any).uploadedBlobUrls) {
                        (window as any).uploadedBlobUrls.clear();
                      }
                      
                      // Refresh gallery images - use the same query key as the gallery query
                      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
                      
                      if (successCount > 0) {
                        toast({
                          title: "Upload Complete",
                          description: `Successfully uploaded ${successCount} image(s)`,
                        });
                      }
                      
                      if (errorCount > 0) {
                        toast({
                          title: "Partial Upload",
                          description: `${errorCount} image(s) failed to save`,
                          variant: "destructive",
                        });
                      }
                    }}
                    buttonClassName="bg-bluebonnet-600 hover:bg-bluebonnet-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Images
                  </ObjectUploader>
                  
                  <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add by URL
                      </Button>
                    </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Gallery Image by URL</DialogTitle>
                    </DialogHeader>
                    <Form {...galleryForm}>
                      <form onSubmit={galleryForm.handleSubmit(onGalleryImageSubmit)} className="space-y-4">
                        <FormField
                          control={galleryForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={galleryForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={galleryForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={galleryForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., native-plants, trees, flowers" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={galleryForm.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., bluebonnet, native, wildflower, spring" />
                              </FormControl>
                              <p className="text-xs text-gray-500">Comma-separated tags for easy filtering</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-4">
                          <Button type="submit" className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                            {editingGalleryImage ? "Update Image" : "Add Image"}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleCloseGalleryDialog}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(galleryImages) ? galleryImages : []).map(image => (
                  <Card key={image.id} className="relative group">
                    <CardContent className="p-3">
                      <img 
                        src={image.imageUrl} 
                        alt={image.title || "Gallery image"}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-bluebonnet-900">
                          {image.title || "Untitled"}
                        </p>
                        {image.category && (
                          <Badge variant="secondary" className="text-xs">
                            {image.category}
                          </Badge>
                        )}
                        {image.tags && image.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {image.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {image.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{image.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGalleryImage(image)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteGalleryImageMutation.mutate(image.id)}
                            className="flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                          {!(image as any).commonName && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => identifyPlantMutation.mutate(image.id)}
                              disabled={identifyPlantMutation.isPending}
                              className="flex-1"
                            >
                              {identifyPlantMutation.isPending && identifyPlantMutation.variables === image.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                                  Identifying...
                                </>
                              ) : (
                                <>
                                  <span className="w-4 h-4 mr-2">🌿</span>
                                  ID Plant
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-bluebonnet-900">Customer Reviews</h2>
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Review</DialogTitle>
                    </DialogHeader>
                    <Form {...reviewForm}>
                      <form onSubmit={reviewForm.handleSubmit(onReviewSubmit)} className="space-y-4">
                        <FormField
                          control={reviewForm.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Customer name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={reviewForm.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rating</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="5" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={reviewForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Review Content</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Review content..." rows={4} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={reviewForm.control}
                            name="approved"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Approved</FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={reviewForm.control}
                            name="featured"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Featured</FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsReviewDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createReviewMutation.isPending}>
                            {createReviewMutation.isPending ? "Creating..." : "Create Review"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {(Array.isArray(reviews) ? reviews : []).map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-bluebonnet-900">{review.customerName}</h4>
                          <div className="text-earth-400 text-sm">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="inline w-4 h-4 fill-current" />
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={review.featured ? "default" : "outline"}
                            onClick={() => updateReviewMutation.mutate({ 
                              id: review.id, 
                              data: { featured: !review.featured } 
                            })}
                            title={review.featured ? "Remove from featured" : "Add to featured"}
                          >
                            {review.featured ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant={review.approved ? "default" : "outline"}
                            onClick={() => updateReviewMutation.mutate({ 
                              id: review.id, 
                              data: { approved: !review.approved } 
                            })}
                            title={review.approved ? "Unapprove review" : "Approve review"}
                          >
                            {review.approved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteReviewMutation.mutate(review.id)}
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-bluebonnet-900">Contact Messages</h2>
              </div>

              <div className="space-y-4">
                {(Array.isArray(contactMessages) ? contactMessages : []).map(message => (
                  <Card key={message.id} className={!message.read ? "border-bluebonnet-200" : ""}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-bluebonnet-900">
                            {message.firstName} {message.lastName}
                          </h4>
                          <p className="text-gray-600">{message.email}</p>
                          <p className="text-sm text-gray-500">
                            Subject: {message.subject} • {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                        {!message.read && (
                          <Button
                            size="sm"
                            onClick={() => markMessageReadMutation.mutate(message.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                      <p className="text-gray-700">{message.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-bluebonnet-900">Team Management</h2>
                <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTeamMember ? "Edit Team Member" : "Add Team Member"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...teamMemberForm}>
                      <form onSubmit={teamMemberForm.handleSubmit(onTeamMemberSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={teamMemberForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={teamMemberForm.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position/Title</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={teamMemberForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={teamMemberForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Image</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Input {...field} placeholder="https://..." />
                                  <div className="flex gap-2">
                                    <GalleryImageSelector
                                      onSelect={field.onChange}
                                      selectedImageUrl={field.value}
                                    />
                                    <ObjectUploader
                                      maxNumberOfFiles={1}
                                      maxFileSize={10485760}
                                      onGetUploadParameters={() => apiRequest("POST", "/api/objects/upload", {}).then(r => ({ method: "PUT" as const, url: (r as any).uploadURL }))}
                                      onComplete={(result) => {
                                        if (result.successful && result.successful.length > 0) {
                                          field.onChange(result.successful[0].uploadURL);
                                        }
                                      }}
                                      buttonClassName="text-sm"
                                    >
                                      Upload New
                                    </ObjectUploader>
                                  </div>
                                  {field.value && (
                                    <div className="mt-2">
                                      <img 
                                        src={field.value} 
                                        alt="Preview" 
                                        className="w-20 h-20 object-cover rounded-full border" 
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={teamMemberForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={teamMemberForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="tel" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={teamMemberForm.control}
                          name="order"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Order</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-4">
                          <Button type="submit" className="bg-bluebonnet-600 hover:bg-bluebonnet-700">
                            {editingTeamMember ? "Update Member" : "Add Member"}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleCloseTeamDialog}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers?.map(member => (
                  <Card key={member.id}>
                    <CardContent className="p-6 text-center">
                      <div className="w-20 h-20 bg-bluebonnet-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                        {member.imageUrl ? (
                          <img 
                            src={member.imageUrl} 
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-bluebonnet-600 text-xl font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-bluebonnet-900 mb-1">{member.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{member.position}</p>
                      {member.bio && <p className="text-gray-500 text-xs mb-2">{member.bio}</p>}
                      <div className="flex gap-2 mt-4 justify-center">
                        <Button size="sm" variant="outline" onClick={() => handleEditTeamMember(member)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteTeamMemberMutation.mutate(member.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(teamMembers || []).length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No team members added yet. Click "Add Team Member" to get started.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content" className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-bluebonnet-900 mb-2">Content Management</h2>
                <p className="text-gray-600">Manage your website content page by page. Select a page below to edit its content, images, and SEO settings.</p>
              </div>

              <div className="grid gap-6">
                {/* Page Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Homepage Card */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="card-homepage-content">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 rounded-full bg-bluebonnet-100">
                          <Home className="w-6 h-6 text-bluebonnet-600" />
                        </div>
                        <h3 className="font-semibold text-bluebonnet-900 ml-3">Homepage</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Manage hero section, featured content, and homepage layout</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full" variant="outline" data-testid="button-edit-homepage">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Homepage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Homepage Content</DialogTitle>
                            <DialogDescription>
                              Edit your homepage hero section, content, and SEO settings
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Hero Section */}
                            <div className="border rounded-lg p-4">
                              <h3 className="font-semibold text-lg mb-4 flex items-center">
                                <Image className="w-5 h-5 mr-2" />
                                Hero Section
                              </h3>
                              <div className="grid gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Hero Title</label>
                                  <Input 
                                    placeholder="Welcome to Gringo Gardens"
                                    data-testid="input-hero-title"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                                  <Input 
                                    placeholder="Texas Native Plants & Trees"
                                    data-testid="input-hero-subtitle"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Hero Description</label>
                                  <Textarea 
                                    placeholder="Discover drought-tolerant Texas native plants..."
                                    rows={3}
                                    data-testid="textarea-hero-description"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Hero Image</label>
                                  <div className="flex gap-2">
                                    <Select data-testid="select-hero-image">
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select from gallery" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {galleryImages?.slice(0, 10).map(image => (
                                          <SelectItem key={image.id} value={image.imageUrl}>
                                            <div className="flex items-center">
                                              <img src={image.imageUrl} alt={image.title || 'Gallery image'} className="w-8 h-8 object-cover rounded mr-2" />
                                              {image.title || 'Untitled'}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="sm">
                                      <Upload className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Call-to-Action Button Text</label>
                                  <Input 
                                    placeholder="Shop Native Plants"
                                    data-testid="input-cta-text"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Call-to-Action Button Link</label>
                                  <Input 
                                    placeholder="/products"
                                    data-testid="input-cta-link"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* About Section */}
                            <div className="border rounded-lg p-4">
                              <h3 className="font-semibold text-lg mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                About Section
                              </h3>
                              <div className="grid gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">About Title</label>
                                  <Input 
                                    placeholder="About Gringo Gardens"
                                    data-testid="input-about-title"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">About Content</label>
                                  <Textarea 
                                    placeholder="We are a family-owned nursery specializing in Texas native plants..."
                                    rows={4}
                                    data-testid="textarea-about-content"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* SEO Settings */}
                            <div className="border rounded-lg p-4">
                              <h3 className="font-semibold text-lg mb-4 flex items-center">
                                <Search className="w-5 h-5 mr-2" />
                                SEO Settings
                              </h3>
                              <div className="grid gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Page Title</label>
                                  <Input 
                                    placeholder="Gringo Gardens - Texas Native Plants & Trees"
                                    data-testid="input-seo-title"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Meta Description</label>
                                  <Textarea 
                                    placeholder="Discover drought-tolerant Texas native plants..."
                                    rows={2}
                                    data-testid="textarea-seo-description"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Keywords</label>
                                  <Input 
                                    placeholder="texas native plants, drought tolerant, nursery"
                                    data-testid="input-seo-keywords"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-6">
                            <DialogClose asChild>
                              <Button variant="outline" data-testid="button-cancel-homepage">Cancel</Button>
                            </DialogClose>
                            <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700" data-testid="button-save-homepage">
                              <Save className="w-4 h-4 mr-2" />
                              Save Homepage Content
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  {/* About Page Card */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="card-about-content">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 rounded-full bg-earth-100">
                          <Info className="w-6 h-6 text-earth-500" />
                        </div>
                        <h3 className="font-semibold text-bluebonnet-900 ml-3">About Page</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Edit your nursery story, mission, and team information</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full" variant="outline" data-testid="button-edit-about">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit About Page
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>About Page Content</DialogTitle>
                            <DialogDescription>
                              Edit your about page content and story
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="border rounded-lg p-4">
                              <h3 className="font-semibold text-lg mb-4">Page Content</h3>
                              <div className="grid gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Page Title</label>
                                  <Input placeholder="About Gringo Gardens" data-testid="input-about-page-title" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                                  <Input placeholder="Our Story & Mission" data-testid="input-about-hero-subtitle" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Our Story</label>
                                  <Textarea placeholder="Founded in..." rows={4} data-testid="textarea-our-story" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Mission Statement</label>
                                  <Textarea placeholder="Our mission is to..." rows={3} data-testid="textarea-mission" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-6">
                            <DialogClose asChild>
                              <Button variant="outline" data-testid="button-cancel-about">Cancel</Button>
                            </DialogClose>
                            <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700" data-testid="button-save-about">
                              <Save className="w-4 h-4 mr-2" />
                              Save About Content
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  {/* Contact Page Card */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="card-contact-content">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 rounded-full bg-texas-green-100">
                          <Phone className="w-6 h-6 text-texas-green-600" />
                        </div>
                        <h3 className="font-semibold text-bluebonnet-900 ml-3">Contact Page</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Manage contact information and business details</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full" variant="outline" data-testid="button-edit-contact">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Contact Page
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Contact Page Content</DialogTitle>
                            <DialogDescription>
                              Edit contact information and business details
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="border rounded-lg p-4">
                              <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                              <div className="grid gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Page Title</label>
                                  <Input placeholder="Contact Us" data-testid="input-contact-title" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Description</label>
                                  <Textarea placeholder="Get in touch with our team..." rows={2} data-testid="textarea-contact-description" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Phone</label>
                                    <Input placeholder="(555) 123-4567" data-testid="input-contact-phone" />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <Input placeholder="info@gringogardens.com" data-testid="input-contact-email" />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Address</label>
                                  <Textarea placeholder="123 Garden Lane, Lampasas, TX" rows={2} data-testid="textarea-contact-address" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-6">
                            <DialogClose asChild>
                              <Button variant="outline" data-testid="button-cancel-contact">Cancel</Button>
                            </DialogClose>
                            <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700" data-testid="button-save-contact">
                              <Save className="w-4 h-4 mr-2" />
                              Save Contact Content
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>

                {/* Global Settings */}
                <Card data-testid="card-global-settings">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-bluebonnet-900 flex items-center">
                          <Globe className="w-5 h-5 mr-2" />
                          Global Content Settings
                        </h3>
                        <p className="text-gray-600 text-sm">Manage site-wide content that appears across all pages</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" data-testid="button-edit-global">
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Global Settings
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Global Content Settings</DialogTitle>
                            <DialogDescription>
                              Edit content that appears site-wide
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Site Name</label>
                              <Input placeholder="Gringo Gardens" data-testid="input-site-name" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Site Tagline</label>
                              <Input placeholder="Texas Native Plants & Trees" data-testid="input-site-tagline" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Footer Copyright</label>
                              <Input placeholder="© 2024 Gringo Gardens. All rights reserved." data-testid="input-footer-copyright" />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-6">
                            <DialogClose asChild>
                              <Button variant="outline" data-testid="button-cancel-global">Cancel</Button>
                            </DialogClose>
                            <Button className="bg-bluebonnet-600 hover:bg-bluebonnet-700" data-testid="button-save-global">
                              <Save className="w-4 h-4 mr-2" />
                              Save Global Settings
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <Globe className="w-8 h-8 mx-auto mb-2 text-bluebonnet-600" />
                        <p className="font-medium">Site Information</p>
                        <p className="text-xs text-gray-500">Name, tagline, copyright</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <Mail className="w-8 h-8 mx-auto mb-2 text-earth-500" />
                        <p className="font-medium">Contact Details</p>
                        <p className="text-xs text-gray-500">Phone, email, address</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <Image className="w-8 h-8 mx-auto mb-2 text-texas-green-600" />
                        <p className="font-medium">Default Images</p>
                        <p className="text-xs text-gray-500">Logo, fallback images</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="p-6">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-bluebonnet-900 mb-6">Business Settings</h2>
                  
                  {/* Newsletter Subscribers */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-bluebonnet-900 mb-4">Newsletter Subscribers</h3>
                      <div className="space-y-4">
                        {newsletterSubscribers && newsletterSubscribers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(newsletterSubscribers || []).map((subscriber) => (
                              <Card key={subscriber.id} className="border-gray-200">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{subscriber.email}</p>
                                      <p className="text-xs text-gray-500">
                                        {subscriber.createdAt ? new Date(subscriber.createdAt).toLocaleDateString() : 'Unknown date'}
                                      </p>
                                    </div>
                                    <Badge variant={subscriber.active ? "default" : "secondary"}>
                                      {subscriber.active ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No newsletter subscribers yet.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Business Hours */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-bluebonnet-900 mb-4">Business Hours</h3>
                      <div className="space-y-4">
                        {Object.entries(businessHours).map(([day, hours]) => (
                          <div key={day} className="flex items-center space-x-4">
                            <div className="w-24 capitalize font-medium text-gray-700">
                              {day}
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={!hours.closed}
                                onChange={(e) => {
                                  setBusinessHours(prev => ({
                                    ...prev,
                                    [day]: { ...(prev as any)[day], closed: !e.target.checked }
                                  }));
                                }}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-600">Open</span>
                            </div>
                            {!hours.closed && (
                              <>
                                <input
                                  type="time"
                                  value={hours.open}
                                  onChange={(e) => {
                                    setBusinessHours(prev => ({
                                      ...prev,
                                      [day]: { ...(prev as any)[day], open: e.target.value }
                                    }));
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-bluebonnet-500 focus:border-bluebonnet-500"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={hours.close}
                                  onChange={(e) => {
                                    setBusinessHours(prev => ({
                                      ...prev,
                                      [day]: { ...(prev as any)[day], close: e.target.value }
                                    }));
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-bluebonnet-500 focus:border-bluebonnet-500"
                                />
                              </>
                            )}
                            {hours.closed && (
                              <span className="text-gray-500 italic">Closed</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="mt-4 bg-bluebonnet-600 hover:bg-bluebonnet-700"
                        onClick={() => {
                          updateSettingMutation.mutate({
                            key: "business_hours",
                            value: JSON.stringify(businessHours)
                          });
                        }}
                        disabled={updateSettingMutation.isPending}
                      >
                        {updateSettingMutation.isPending ? "Saving..." : "Save Business Hours"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Seasonal Closure */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-bluebonnet-900 mb-4">Seasonal Closure</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isTemporarilyClosed}
                            onChange={(e) => setIsTemporarilyClosed(e.target.checked)}
                            className="rounded"
                          />
                          <label className="text-sm font-medium text-gray-700">
                            Temporarily closed (e.g., winter break, vacation)
                          </label>
                        </div>
                        
                        {isTemporarilyClosed && (
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Closure Message
                            </label>
                            <textarea
                              value={closureMessage}
                              onChange={(e) => setClosureMessage(e.target.value)}
                              placeholder="We're temporarily closed for the winter season. We'll reopen in March!"
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bluebonnet-500 focus:border-bluebonnet-500"
                            />
                          </div>
                        )}
                      </div>
                      <Button 
                        className="mt-4 bg-bluebonnet-600 hover:bg-bluebonnet-700"
                        onClick={() => {
                          updateSettingMutation.mutate({
                            key: "temporary_closure",
                            value: JSON.stringify({
                              closed: isTemporarilyClosed,
                              message: closureMessage
                            })
                          });
                        }}
                        disabled={updateSettingMutation.isPending}
                      >
                        {updateSettingMutation.isPending ? "Saving..." : "Save Closure Settings"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </section>
  );
}
