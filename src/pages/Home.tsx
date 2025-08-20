import React, { useState, useEffect } from 'react';
import { Plus, Filter, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, ProductCategory } from '@/types';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';

const Home: React.FC = () => {
  const { products, loading, loadProducts } = useProducts();
  const { isAdminMode, adminSettings } = useAdmin();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Load products when component mounts (lazy loading)
  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, []);

  // Initialize filtered products when products change
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Filter products based on category and search
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Search and Filter Loading */}
          <div className="space-y-4">
            <div className="h-12 bg-muted shimmer rounded-lg"></div>
            <div className="flex space-x-2 overflow-x-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 w-20 bg-muted shimmer rounded-lg flex-shrink-0"></div>
              ))}
            </div>
          </div>

          {/* Products Grid Loading */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="aspect-square bg-muted shimmer rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted shimmer rounded w-3/4"></div>
                  <div className="h-3 bg-muted shimmer rounded w-1/2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-muted shimmer rounded w-1/3"></div>
                    <div className="h-10 w-10 bg-muted shimmer rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products..."
        />

        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Add Product Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Products</h2>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>
          
          {!isAdminMode && adminSettings?.requireAdminForProductActions ? (
            <Button 
              variant="outline" 
              size="sm" 
              disabled 
              className="opacity-50 cursor-not-allowed"
              onClick={() => toast({
                title: "Admin access required",
                description: "Please sign in as admin to add products",
                variant: "destructive"
              })}
            >
              <Lock className="w-4 h-4" />
              Admin Only
            </Button>
          ) : (
            <Link to="/add-product">
              <Button variant="premium" size="sm" className="shadow-glow">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </Link>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            {!isAdminMode && adminSettings?.requireAdminForProductActions ? (
              <Button 
                variant="outline" 
                disabled 
                className="opacity-50 cursor-not-allowed"
                onClick={() => toast({
                  title: "Admin access required",
                  description: "Please sign in as admin to add products",
                  variant: "destructive"
                })}
              >
                <Lock className="w-4 h-4" />
                Admin Only
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
    </Layout>
  );
};

export default Home;