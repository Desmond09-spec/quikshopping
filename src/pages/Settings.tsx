import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  User,
  LogOut,
  UserPlus,
  LogIn,
  Package,
  Trash2,
  Edit3,
  ArrowRight,
  Archive,
  Sun,
  Moon,
  Mail,
  Download,
  Smartphone,
  HelpCircle,
  Phone,
  Shield,
  X,
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useProducts } from "@/contexts/SupabaseProductContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useStore } from "@/contexts/StoreContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Layout from "@/components/Layout";
import PullToRefresh from "@/components/PullToRefresh";
import CategoryManager from "@/components/CategoryManager";
import TeamManagement from "@/components/TeamManagement";
import AppWalkthrough from "@/components/AppWalkthrough";
import FAQSection from "@/components/FAQSection";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { products, deleteProduct, loading, loadProducts, transactions } =
    useProducts();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { hasPermission, userRole } = useStore();
  
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Load products when Settings loads (if authenticated)
  useEffect(() => {
    if (user && products.length === 0 && !loading) {
      loadProducts();
    }
  }, [user, products.length, loading, loadProducts]);

  // PWA Install functionality
  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    const isAlreadyInstalled = checkInstalled();

    // If not installed, check if PWA is installable
    if (!isAlreadyInstalled) {
      // Check if beforeinstallprompt has already fired
      const checkForDeferredPrompt = () => {
        // Some browsers may support installation but don't fire beforeinstallprompt immediately
        // We'll show install option if the browser supports it
        if (
          "serviceWorker" in navigator &&
          "BeforeInstallPromptEvent" in window
        ) {
          // Set a timeout to check if prompt is available
          setTimeout(() => {
            if (!deferredPrompt && !isInstalled) {
              // If no prompt after delay, assume installable for PWA-capable browsers
              const isHttps = window.location.protocol === "https:";
              const isLocalhost = window.location.hostname === "localhost";
              if (isHttps || isLocalhost) {
                // Create a mock prompt for browsers that support PWA but don't fire the event immediately
                setDeferredPrompt({} as BeforeInstallPromptEvent);
              }
            }
          }, 2000);
        }
      };

      checkForDeferredPrompt();
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProductId(productId);
    try {
      await deleteProduct(productId, userRole || "user");
    } catch (error) {
      console.error("Delete product error:", error);
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      // Check if it's a mock prompt or real prompt
      if (typeof deferredPrompt.prompt === "function") {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;

        if (choiceResult.outcome === "accepted") {
          setIsInstalled(true);
        }
      } else {
        // For browsers that support PWA but don't have the prompt API
        // Show a fallback message or try alternative installation methods
        toast({
          title: "Install App",
          description:
            "To install this app, use your browser's menu to 'Add to Home Screen' or 'Install App'.",
        });
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error installing PWA:", error);
      toast({
        title: "Installation Error",
        description:
          "Unable to install the app. Try using your browser's 'Add to Home Screen' option.",
        variant: "destructive",
      });
    } finally {
      setInstalling(false);
    }
  };

  const handleShowWalkthrough = () => {
    setShowWalkthrough(true);
  };

  const handleRefresh = async () => {
    await loadProducts(true);
  };

  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account and store
                </p>
              </div>
            </div>

            {/* Account Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-primary" />
                  <span>Account</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate text-base">
                            {user.user_metadata?.full_name || user.user_metadata?.display_name || "QuikShopping User"}
                          </p>
                          <Badge variant="secondary" className="h-5 text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            {userRole || 'Owner'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full justify-start"
                    >
                      {loggingOut ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="default"
                      onClick={() => navigate("/auth")}
                      className="w-full justify-start"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In / Sign Up
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Store Overview Section */}
            {user && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Store Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Today's Sales */}
                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Today's Sales
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            ₦
                            {transactions
                              .filter((t) => {
                                const today = new Date();
                                const txDate = new Date(t.timestamp);
                                return (
                                  txDate.toDateString() === today.toDateString()
                                );
                              })
                              .reduce((sum, t) => sum + t.total, 0)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Today's Profit/Loss */}
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Today's Profit/Loss
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            ₦0
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cost tracking required
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Low Stock Products */}
                    <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Low Stock
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {products.filter((p) => p.quantity <= 10).length}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Products
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  {/* View Reports Button */}
                  <Button
                    variant="default"
                    onClick={() => navigate("/reports")}
                    className="w-full justify-between"
                  >
                    <span className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>View Full Reports</span>
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* App Settings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">App Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Theme Settings */}
                <Button
                  variant="outline"
                  onClick={toggleTheme}
                  className="w-full justify-start"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4" />
                      Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      Switch to Dark Mode
                    </>
                  )}
                </Button>

                {/* Install App */}
                {!isInstalled && deferredPrompt ? (
                  <Button
                    variant="default"
                    onClick={handleInstallApp}
                    disabled={installing}
                    className="w-full justify-start bg-primary/90 hover:bg-primary"
                  >
                    {installing ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Install App
                  </Button>
                ) : isInstalled ? (
                  <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        App Installed
                      </span>
                    </div>
                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                      <Download className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Install option will appear when available on your device
                    </p>
                  </div>
                )}

                {/* App Walkthrough */}
                <Button
                  variant="outline"
                  onClick={handleShowWalkthrough}
                  className="w-full justify-start"
                >
                  <HelpCircle className="w-4 h-4" />
                  View App Walkthrough
                </Button>

                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-sm font-medium text-foreground">Legal</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/privacy")}
                      className="w-full justify-start"
                    >
                      Privacy Policy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/terms")}
                      className="w-full justify-start"
                    >
                      Terms of Service
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Team Management */}
            {user && <TeamManagement />}

            {/* Category Management */}
            <CategoryManager />

            {/* Product Management Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>Product Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div>
                    <p className="font-medium text-foreground">
                      Manage Products
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {products.length} products in inventory
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    {!hasPermission('products:write') ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="opacity-50 cursor-not-allowed w-full sm:w-auto justify-center"
                      >
                        <Lock className="w-4 h-4" />
                        Read Only
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/add-product")}
                          className="w-full sm:w-auto justify-center"
                        >
                          <Package className="w-4 h-4" />
                          Add Product
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/products-inventory")}
                          className="w-full sm:w-auto justify-center"
                        >
                          <Archive className="w-4 h-4" />
                          View Inventory
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {products.length > 0 && (
                  <>
                    <Separator className="bg-border" />
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">
                        Quick Actions
                      </p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ₦{product.price.toLocaleString()} •{" "}
                                {product.quantity} in stock
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              {!hasPermission('products:write') ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  className="opacity-50 cursor-not-allowed"
                                >
                                  <Lock className="w-4 h-4" />
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      navigate(`/edit-product/${product.id}`)
                                    }
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    disabled={deletingProductId === product.id}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  >
                                    {deletingProductId === product.id ? (
                                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <FAQSection />

            {/* App Walkthrough */}
            <AppWalkthrough
              open={showWalkthrough}
              onOpenChange={setShowWalkthrough}
            />
          </div>
        </div>
      </PullToRefresh>
    </Layout>
  );
};

export default Settings;
