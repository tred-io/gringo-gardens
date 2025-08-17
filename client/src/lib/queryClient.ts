import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build URL with query parameters
    let url = queryKey[0] as string;
    if (queryKey.length > 1 && typeof queryKey[1] === 'object' && queryKey[1] !== null) {
      const params = new URLSearchParams();
      const queryParams = queryKey[1] as Record<string, any>;
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      if (params.toString()) {
        url += '?' + params.toString();
      }
    } else if (queryKey.length > 1) {
      // Handle array-style queryKeys like ["/api/products", "slug"]
      url = queryKey.join("/");
    }
    
    try {
      
      const res = await fetch(url, {
        credentials: "include",
      });

      // Handle deployment scenario where APIs don't exist or return HTML
      const contentType = res.headers.get('content-type');
      if (res.status === 500 || 
          (res.status === 404 && contentType && contentType.includes('text/html'))) {
        console.warn(`API endpoint ${url} not available in deployment mode`);
        return null;
      }

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      // Additional check for HTML responses that passed status checks
      const text = await res.text();
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.warn(`API endpoint ${url} returned HTML in deployment mode`);
        return null;
      }
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn(`API endpoint ${url} returned invalid JSON`);
        return null;
      }
    } catch (error) {
      // Gracefully handle API failures in deployment
      console.warn(`API call failed: ${url}`, error);
      return null;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
