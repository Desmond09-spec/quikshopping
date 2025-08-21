import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";
import { ProductProvider } from "@/contexts/SupabaseProductContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load pages for bundle splitting
const Home = React.lazy(() => import("./pages/Home"));
const Cart = React.lazy(() => import("./pages/Cart"));
const AddProduct = React.lazy(() => import("./pages/AddProduct"));
const History = React.lazy(() => import("./pages/History"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Auth = React.lazy(() => import("./pages/Auth"));
const EditProduct = React.lazy(() => import("./pages/EditProduct"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const ProductsInventory = React.lazy(() => import("./pages/ProductsInventory"));
const ActivityDetails = React.lazy(() => import("./pages/ActivityDetails"));

// Page loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always refetch on account switch
      gcTime: 0, // Don't cache data to prevent cross-account contamination
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <ProductProvider>
            <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/products-inventory" element={<ProtectedRoute><ProductsInventory /></ProtectedRoute>} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/signin" element={<Auth />} />
                    <Route path="/signup" element={<Auth />} />
                    <Route path="/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
                    <Route path="/activity/:activityId" element={<ProtectedRoute><ActivityDetails /></ProtectedRoute>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
            </CartProvider>
          </ProductProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
