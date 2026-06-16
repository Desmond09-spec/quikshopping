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
import { StoreProvider } from "@/contexts/StoreContext";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/ProtectedRoute";
import StoreLockdownOverlay from "@/components/StoreLockdownOverlay";

// Lazy load pages for bundle splitting
const Home = React.lazy(() => import("./pages/Home"));
const Cart = React.lazy(() => import("./pages/Cart"));
const AddProduct = React.lazy(() => import("./pages/AddProduct"));
const History = React.lazy(() => import("./pages/History"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Auth = React.lazy(() => import("./pages/Auth"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));
const CreateStore = React.lazy(() => import("./pages/CreateStore"));
const EditProduct = React.lazy(() => import("./pages/EditProduct"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const ProductsInventory = React.lazy(() => import("./pages/ProductsInventory"));
const ActivityDetails = React.lazy(() => import("./pages/ActivityDetails"));
const Reports = React.lazy(() => import("./pages/Reports"));
const AcceptInvite = React.lazy(() => import("./pages/AcceptInvite"));

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
        <StoreProvider>
            <ProductProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <StoreLockdownOverlay />
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/add-product" element={<AddProduct />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route
                          path="/products-inventory"
                          element={<ProductsInventory />}
                        />
                        <Route path="/auth" element={<Auth />} />
                        <Route
                          path="/auth/callback"
                          element={<AuthCallback />}
                        />
                        <Route path="/signin" element={<Auth />} />
                        <Route path="/signup" element={<Auth />} />
                        <Route
                          path="/create-store"
                          element={
                            <ProtectedRoute>
                              <CreateStore />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/edit-product/:id"
                          element={<EditProduct />}
                        />
                        <Route
                          path="/activity/:activityId"
                          element={<ActivityDetails />}
                        />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </ProductProvider>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
