import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, History, Plus, Settings } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AppWalkthrough from '@/components/AppWalkthrough';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { state } = useCart();
  const { user } = useAuth();
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Check if user should see walkthrough on first visit
  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem('walkthrough-completed');
    if (!hasSeenWalkthrough) {
      // Show walkthrough after a short delay for better UX
      const timer = setTimeout(() => {
        setShowWalkthrough(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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
      badge: state.items.length > 0 ? state.items.reduce((sum, item) => sum + item.quantity, 0) : undefined
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
    <div className="min-h-screen bg-background">
      {/* App Walkthrough */}
      <AppWalkthrough 
        open={showWalkthrough} 
        onOpenChange={setShowWalkthrough} 
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img 
                  src="/lovable-uploads/ccafe85b-c445-42c7-994a-87b65284b41b.png" 
                  alt="Quik Shopping" 
                  className="w-full h-full object-cover"
                />
              </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Quik Shopping</h1>
              <p className="text-sm text-muted-foreground">
                {user ? `Welcome, ${user.user_metadata?.display_name || user.email}` : 'Demo Mode'}
              </p>
            </div>
            </div>
            
            {/* Cart Total Badge */}
            {state.total > 0 && (
              <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-primary">
                  ₦{state.total.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
        <div className="container mx-auto px-2">
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