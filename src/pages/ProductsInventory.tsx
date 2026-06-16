import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Edit, Trash2, Plus, ScanBarcode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { useStore } from '@/contexts/StoreContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';
import BarcodeScanner from '@/components/BarcodeScanner';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import PullToRefresh from '@/components/PullToRefresh';

const ProductsInventory: React.FC = () => {
  const navigate = useNavigate();
  const { products, deleteProduct, categories, loadProducts, loading, isInitialLoading } = useProducts();
  const { hasPermission, userRole } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Load products when component mounts (lazy loading)
  useEffect(() => {
    if (products.length === 0 && !loading) {
      loadProducts();
    }
  }, [products.length, loading, loadProducts]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm));
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleEdit = (product: Product) => {
    navigate(`/edit-product/${product.id}`);
  };

  const handleDelete = async (product: Product) => {
    setDeletingProductId(product.id);
    try {
      await deleteProduct(product.id, userRole || 'user');
    } catch (error) {
      console.error('Delete product error:', error);
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleScan = (result: string) => {
    setSearchTerm(result);
    setShowScanner(false);
    toast({
      title: "Barcode Scanned",
      description: `Searching for: ${result}`,
    });
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-destructive/10 text-destructive' };
    if (quantity <= 5) return { label: 'Low Stock', color: 'bg-warning/10 text-warning' };
    return { label: 'In Stock', color: 'bg-success/10 text-success' };
  };

  const handleRefresh = async () => {
    await loadProducts(true);
  };

  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Products Inventory</h1>
                  <p className="text-muted-foreground">Manage your product catalog</p>
                </div>
              </div>

              <Button
                onClick={() => navigate('/add-product')}
                variant="premium"
                className="shadow-glow"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {/* Filters and Search */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowScanner(true)}
                      className="flex-shrink-0"
                    >
                      <ScanBarcode className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Category Filter */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Order */}
                  <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Products Grid */}
            {isInitialLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.quantity);

                  return (
                    <Card
                      key={product.id}
                      className="bg-gradient-card border border-border hover:shadow-lg transition-smooth"
                    >
                      <CardContent className="p-4">
                        {/* Product Image */}
                        <div className="aspect-square bg-muted/30 rounded-lg mb-3 flex items-center justify-center border border-border/50">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            {product.barcode && (
                              <p className="text-xs text-muted-foreground mt-1 font-mono">
                                {product.barcode}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                ₦{product.price.toLocaleString()}
                              </span>
                              <Badge className={cn("text-xs", stockStatus.color)}>
                                {stockStatus.label}
                              </Badge>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              Quantity: <span className="font-medium text-foreground">{product.quantity}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product)}
                              disabled={deletingProductId === product.id}
                              className="flex-1"
                            >
                              {deletingProductId === product.id ? (
                                <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!isInitialLoading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first product'
                  }
                </p>
                <Button onClick={() => navigate('/add-product')} variant="default">
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              </div>
            )}

            {/* Barcode Scanner */}
            {showScanner && (
              <BarcodeScanner
                onScan={handleScan}
                onClose={() => setShowScanner(false)}
              />
            )}
          </div>
        </div>
      </PullToRefresh>
    </Layout>
  );
};

export default ProductsInventory;