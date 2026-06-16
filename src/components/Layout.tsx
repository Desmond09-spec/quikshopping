import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, History, Plus, Settings, RefreshCw } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { useStore } from '@/contexts/StoreContext';
import AppWalkthrough from '@/components/AppWalkthrough';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { activeCart } = useCart();
  const { user } = useAuth();
  const { activeStore } = useStore();
  const { isSyncing } = useProducts();
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Check if user should see walkthrough on first visit
  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem('walkthrough-completed');
    if (!hasSeenWalkthrough && !user) {
      // Show walkthrough after a short delay for better UX, only when not signed in
      const timer = setTimeout(() => {
        setShowWalkthrough(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const navigation = [
    {
      name: 'Products',
      href: '/',
      icon: Package,
      active: location.pathname === '/'
    },
    {
      name: 'Cart',
      href: '/cart',
      icon: ShoppingBag,
      active: location.pathname === '/cart',
      badge: activeCart?.items.length ? activeCart.items.reduce((sum, item) => sum + item.quantity, 0) : undefined
    },
    {
      name: 'Add Product',
      href: '/add-product',
      icon: Plus,
      active: location.pathname === '/add-product'
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
      active: location.pathname === '/history'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: location.pathname === '/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* App Walkthrough */}
      <AppWalkthrough
        open={showWalkthrough}
        onOpenChange={setShowWalkthrough}
      />

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-16 lg:w-60 bg-sidebar-dark border-r border-border transition-all duration-300 z-40">
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-4 border-b border-border flex items-center justify-center lg:justify-start">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src="/lovable-uploads/ccafe85b-c445-42c7-994a-87b65284b41b.png"
                alt="Quik Shopping"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="hidden lg:block text-lg font-bold text-foreground ml-3">Quik</h2>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 lg:px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center justify-center lg:justify-start px-3 py-3 rounded-lg transition-smooth relative group",
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  title={item.name}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden lg:inline-block ml-3 text-sm font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium lg:static lg:ml-auto">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                  {/* Tooltip for icon-only view */}
                  <div className="hidden group-hover:block lg:hidden absolute left-full ml-2 px-2 py-1 bg-card text-foreground text-xs rounded whitespace-nowrap pointer-events-none">
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile & Main Layout */}
      <div className="flex-1 md:ml-16 lg:ml-60 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="md:hidden w-8 h-8 rounded-lg overflow-hidden">
                  <img
                    src="/lovable-uploads/ccafe85b-c445-42c7-994a-87b65284b41b.png"
                    alt="Quik Shopping"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Quik Shopping
                    {isSyncing && (
                      <RefreshCw className="w-3 h-3 text-primary animate-spin" />
                    )}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {activeStore ? activeStore.store_name : (user ? `Welcome, ${user.user_metadata?.full_name || user.user_metadata?.display_name || user.email}` : 'Demo Mode')}
                  </p>
                </div>
              </div>

              {/* Cart Total Badge */}
              {activeCart && activeCart.total > 0 && (
                <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    ₦{activeCart.total.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
        <div className="px-2">
          <div className="flex items-center justify-around py-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-smooth relative",
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
