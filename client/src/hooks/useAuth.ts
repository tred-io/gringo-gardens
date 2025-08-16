import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Skip API call in production deployment since we don't have backend APIs
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (response.status === 404) {
          // API doesn't exist (deployment mode), return null
          return null;
        }
        if (!response.ok) {
          throw new Error('Auth check failed');
        }
        return await response.json();
      } catch (error) {
        // Handle deployment scenario where API doesn't exist
        return null;
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
