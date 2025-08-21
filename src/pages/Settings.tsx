import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';
import CategoryManager from '@/components/CategoryManager';
import CashierManagement from '@/components/CashierManagement';
import EnhancedCashierDialog from '@/components/EnhancedCashierDialog';
import AdminSetupDialog from '@/components/AdminSetupDialog';
import AdminSignInDialog from '@/components/AdminSignInDialog';
import ForgotPinDialog from '@/components/ForgotPinDialog';
import AppWalkthrough from '@/components/AppWalkthrough';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { products, deleteProduct, loading, loadProducts } = useProducts();
  const { theme, toggleTheme } = useTheme();
  const { 
    isAdminMode, 
    adminSettings, 
    signOutAdmin, 
    toggleCashierDialogDisabled,
    toggleAdminProductRequirement,
    loading: adminLoading 
  } = useAdmin();
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showCashierDialog, setShowCashierDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [showAdminSignIn, setShowAdminSignIn] = useState(false);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
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
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();

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

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    // If cashier dialog is disabled, delete directly
    if (adminSettings?.disableCashierDialog) {
      setDeletingProductId(productId);
      try {
        await deleteProduct(productId, 'admin'); // Use 'admin' as default cashier name when dialog is disabled
      } catch (error) {
        console.error('Delete product error:', error);
      } finally {
        setDeletingProductId(null);
      }
      return;
    }
    
    setProductToDelete(productId);
    setShowCashierDialog(true);
  };

  const handleCashierConfirm = async (cashierName: string) => {
    if (!productToDelete) return;

    setDeletingProductId(productToDelete);
    try {
      await deleteProduct(productToDelete, cashierName);
    } catch (error) {
      console.error('Delete product error:', error);
    } finally {
      setDeletingProductId(null);
      setProductToDelete(null);
      setShowCashierDialog(false);
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleShowWalkthrough = () => {
    setShowWalkthrough(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account and store</p>
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
                    <p className="text-sm text-muted-foreground">Signed in as</p>
                    <p className="font-medium text-foreground truncate">
                      {user.user_metadata?.display_name || user.email}
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
                  onClick={() => navigate('/auth')}
                  className="w-full justify-start"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In / Sign Up
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
              {theme === 'dark' ? (
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
                  <span className="text-sm font-medium text-primary">App Installed</span>
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
          </CardContent>
        </Card>

        {/* Admin Section */}
        {user && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <span>Admin Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!adminSettings ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Set up admin access to manage advanced settings and security features.
                  </p>
                  <Button
                    variant="default"
                    onClick={() => setShowAdminSetup(true)}
                    className="w-full justify-start"
                    disabled={adminLoading}
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Setup Admin Access
                  </Button>
                </div>
              ) : !isAdminMode ? (
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Admin Email</p>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <p className="font-medium text-foreground truncate">
                        {adminSettings.adminEmail}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    onClick={() => setShowAdminSignIn(true)}
                    className="w-full justify-start"
                    disabled={adminLoading}
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In as Admin
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      🔐 Admin Mode Active
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You have administrative privileges
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Disable Cashier Dialog Modal
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Skip cashier confirmation for bulk product operations
                        </p>
                      </div>
                      <Button
                        variant={adminSettings.disableCashierDialog ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCashierDialogDisabled(!adminSettings.disableCashierDialog)}
                        disabled={adminLoading}
                      >
                        {adminSettings.disableCashierDialog ? "Disabled" : "Enabled"}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Require Admin for Product Actions
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Require admin sign-in to add, edit, or delete products
                        </p>
                      </div>
                      <Button
                        variant={adminSettings.requireAdminForProductActions ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAdminProductRequirement(!adminSettings.requireAdminForProductActions)}
                        disabled={adminLoading}
                      >
                        {adminSettings.requireAdminForProductActions ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-border" />
                  
                  <Button
                    variant="outline"
                    onClick={signOutAdmin}
                    className="w-full justify-start"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out of Admin Mode
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cashier Management */}
        <CashierManagement />

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
                <p className="font-medium text-foreground">Manage Products</p>
                <p className="text-sm text-muted-foreground">
                  {products.length} products in inventory
                </p>
              </div>
               <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                {!isAdminMode && adminSettings?.requireAdminForProductActions ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled 
                    className="opacity-50 cursor-not-allowed w-full sm:w-auto justify-center"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Admin Access Required
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/add-product')}
                      className="w-full sm:w-auto justify-center"
                    >
                      <Package className="w-4 h-4" />
                      Add Product
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/products-inventory')}
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
                  <p className="text-sm font-medium text-foreground">Quick Actions</p>
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
                            ₦{product.price.toLocaleString()} • {product.quantity} in stock
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!isAdminMode && adminSettings?.requireAdminForProductActions ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled
                              className="opacity-50 cursor-not-allowed"
                            >
                              <SettingsIcon className="w-4 h-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/edit-product/${product.id}`)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => handleDeleteProduct(product.id)}
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

        {/* Cashier Dialog - Only show if dialog is not disabled */}
        {!adminSettings?.disableCashierDialog && (
          <EnhancedCashierDialog
            open={showCashierDialog}
            onOpenChange={setShowCashierDialog}
            onConfirm={handleCashierConfirm}
            title="Delete Product"
            description="Please enter the cashier's name to proceed with deleting this product."
            loading={!!deletingProductId}
          />
        )}

        {/* Admin Dialogs */}
        <AdminSetupDialog
          open={showAdminSetup}
          onOpenChange={setShowAdminSetup}
        />
        
        <AdminSignInDialog
          open={showAdminSignIn}
          onOpenChange={setShowAdminSignIn}
          onForgotPin={() => {
            setShowAdminSignIn(false);
            setShowForgotPin(true);
          }}
        />
        
        <ForgotPinDialog
          open={showForgotPin}
          onOpenChange={setShowForgotPin}
          onBack={() => {
            setShowForgotPin(false);
            setShowAdminSignIn(true);
          }}
        />

        {/* App Walkthrough */}
        <AppWalkthrough 
          open={showWalkthrough} 
          onOpenChange={setShowWalkthrough} 
        />
      </div>
    </Layout>
  );
};

export default Settings;