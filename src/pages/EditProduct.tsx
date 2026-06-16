import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Package, ImageIcon, Upload, X, Lock } from 'lucide-react';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';

const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { products, categories, updateProduct } = useProducts();
  const { hasPermission, userRole } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(products.find(p => p.id === id));
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setFormData({
        name: foundProduct.name,
        price: foundProduct.price.toString(),
        quantity: foundProduct.quantity.toString(),
        category: foundProduct.category,
        imageUrl: foundProduct.imageUrl || ''
      });
    }
  }, [id, products]);

  // Check if admin access is required and redirect if not authorized
  useEffect(() => {
    if (!hasPermission('products:write')) {
      navigate('/settings');
    }
  }, [hasPermission, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.quantity || !formData.category || !id) {
      return;
    }

    setLoading(true);
    
    try {
      await updateProduct(id, {
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        imageUrl: formData.imageUrl || undefined
      }, userRole || 'user');
      
      navigate('/settings');
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show access denied if admin is required but user is not admin
  if (!hasPermission('products:write')) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 max-w-2xl text-center">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to sign in as admin to edit products.
          </p>
          <div className="flex space-x-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </Button>
            <Button onClick={() => navigate('/settings')}>
              Go to Settings
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/settings')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-primary" />
              <span>Product Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Product Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Coca Cola 350ml"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="bg-background border-border"
                />
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-foreground">Price (₦) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="300"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-foreground">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="24"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    required
                    min="0"
                    className="bg-background border-border"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-foreground flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Product Image (optional)</span>
                </Label>
                
                {!formData.imageUrl ? (
                  <div className="flex flex-col space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-32 border-dashed border-2 hover:bg-muted/50"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload image
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Max 5MB • JPG, PNG, GIF
                        </span>
                      </div>
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs text-muted-foreground">OR</span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                    
                    <Input
                      type="url"
                      placeholder="Paste image URL here..."
                      value=""
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative aspect-square w-32 rounded-lg overflow-hidden border border-border">
                      <img
                        src={formData.imageUrl}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={removeImage}
                        className="absolute top-2 right-2 h-6 w-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        removeImage();
                        fileInputRef.current?.click();
                      }}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4" />
                      Replace Image
                    </Button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/settings')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="premium"
                  disabled={loading || !formData.name || !formData.price || !formData.quantity || !formData.category}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
};

export default EditProduct;