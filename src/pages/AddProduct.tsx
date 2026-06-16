import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Package, ImageIcon, Lock, ScanBarcode } from 'lucide-react';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import BarcodeScanner from '@/components/BarcodeScanner';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct, categories } = useProducts();
  const { hasPermission, userRole } = useStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
    description: '',
    barcode: ''
  });

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.quantity || !formData.category) {
      return;
    }

    setLoading(true);

    try {
      // Convert image to base64 if selected
      let imageUrl = undefined;
      if (selectedImage) {
        imageUrl = await compressImage(selectedImage);
      }

      await addProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        imageUrl,
        barcode: formData.barcode
      }, userRole || 'user');

      navigate('/');
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleScan = (result: string) => {
    setFormData(prev => ({ ...prev, barcode: result }));
    setShowScanner(false);

    toast({
      title: "Barcode Scanned",
      description: `Barcode: ${result}`,
    });
  };

  // Show access denied message if admin is required but user is not admin
  const showAccessDenied = !hasPermission('products:write');

  return (
    <Layout>
      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add Product</h1>
            <p className="text-muted-foreground">Add a new product to your inventory</p>
          </div>
        </div>

        {/* Access Denied Message */}
        {showAccessDenied && (
          <Card className="bg-card border-border mb-6 max-w-6xl mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-4">
                You need to sign in as admin to add products.
              </p>
              <Button onClick={() => navigate('/settings')} variant="premium">
                Go to Admin Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Two-Column Layout: Form on left, Image upload on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Left Column: Form Fields */}
          <Card className={cn("bg-card border-border", showAccessDenied && "opacity-50 pointer-events-none")}>
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

              {/* Barcode */}
              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-foreground">Barcode (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    type="text"
                    placeholder="Scan or enter barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    className="bg-background border-border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowScanner(true)}
                    className="flex-shrink-0"
                  >
                    <ScanBarcode className="w-5 h-5" />
                  </Button>
                </div>
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
                <Select onValueChange={(value) => handleInputChange('category', value)}>
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

              {/* Submit Button - Full Width */}
              <div className="flex space-x-3 pt-4 lg:flex-col-reverse lg:space-x-0 lg:space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
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
                      <Plus className="w-4 h-4" />
                      Add Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          </Card>

          {/* Right Column: Image Upload (Desktop Only) */}
          <Card className={cn("bg-card border-border", showAccessDenied && "opacity-50 pointer-events-none")}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span>Product Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Drag & Drop Image Upload */}
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-smooth cursor-pointer"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Drag files here or click
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supported formats: JPG, PNG, GIF
                  </p>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden bg-background border-border cursor-pointer"
                  />
                </div>

                {/* Image Preview */}
                {imagePreview ? (
                  <div className="space-y-3">
                    <Label className="text-foreground">Selected Image</Label>
                    <div className="aspect-square w-full rounded-lg overflow-hidden border border-border shadow-md">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedImage(null);
                      }}
                      className="w-full"
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No image selected yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barcode Scanner */}
        {showScanner && (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default AddProduct;
