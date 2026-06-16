import React, { useState, useEffect } from 'react';
import { Plus, Filter, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, ProductCategory } from '@/types';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import BarcodeScanner from '@/components/BarcodeScanner';
import PullToRefresh from '@/components/PullToRefresh';

const Home: React.FC = () => {
  const { products, loading, productsLoading, loadProducts } = useProducts();
  const { hasPermission } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  // Load products when component mounts (lazy loading)
  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, []);

  // Auto-retry verification: If products fail to load, retry after delay
  useEffect(() => {
    // Only activate this check if:
    // 1. Loading has completed (loading === false)
    // 2. No products are present (products.length === 0)
    // 3. Not currently in a loading state (to avoid retriggering during retry)
    if (!loading && !productsLoading && products.length === 0) {
      console.log('⚠️ Products empty after load - scheduling auto-retry in 3 seconds...');

      const timer = setTimeout(() => {
        // Double-check conditions before retrying
        if (products.length === 0 && !loading && !productsLoading) {
          console.log('🔄 Auto-retrying product load...');
          loadProducts(true);
        }
      }, 3000); // Wait 3 seconds before retrying

      return () => clearTimeout(timer);
    }
  }, [products.length, loading, productsLoading]);

  // Filter products based on category and search
  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.barcode && product.barcode.includes(searchQuery))
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const handleScan = (result: string) => {
    setSearchQuery(result);
    setShowScanner(false);
    toast({
      title: "Barcode Scanned",
      description: `Searching for: ${result}`,
    });
  };



  const handleRefresh = async () => {
    await loadProducts(true);
  };

  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="w-full px-4 md:px-6 lg:px-8 py-6 space-y-6">
          {/* Top Controls - Horizontal on Desktop */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar - Full width on mobile, flex-grow on desktop */}
            <div className="flex-1 md:flex-grow">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search products..."
                onScan={() => setShowScanner(true)}
              />
            </div>

            {/* Category Filter - Full width on mobile, inline on desktop */}
            <div className="md:flex-shrink-0">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* Add Product Button - Full width on mobile, right-aligned on desktop */}
            {hasPermission('products:write') && (
              <Link to="/add-product" className="md:flex-shrink-0">
                <Button variant="premium" size="sm" className="shadow-glow w-full md:w-auto">
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              </Link>
            )}
            
            {!hasPermission('products:write') && (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="opacity-50 cursor-not-allowed md:flex-shrink-0 w-full md:w-auto"
                onClick={() => toast({
                  title: "Permission Denied",
                  description: "You don't have permission to add products",
                  variant: "destructive"
                })}
              >
                <Lock className="w-4 h-4" />
                Read Only
              </Button>
            )}
          </div>

          {/* Product Info Header */}
          <div>
            <h2 className="text-xl font-semibold text-foreground">Products</h2>
            <p className="text-sm text-muted-foreground">
              {loading || productsLoading ? 'Loading...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}
              {!loading && !productsLoading && selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Products Grid */}
          {loading || productsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery || selectedCategory !== 'All' ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first product to the inventory'
                }
              </p>
              {!hasPermission('products:write') ? (
                <Button
                  variant="outline"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                  onClick={() => toast({
                    title: "Permission Denied",
                    description: "You don't have permission to add products",
                    variant: "destructive"
                  })}
                >
                  <Lock className="w-4 h-4" />
                  Read Only
                </Button>
              ) : (
                <Link to="/add-product">
                  <Button variant="default">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Barcode Scanner */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </Layout>
  );
};

export default Home;
