import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Lock } from 'lucide-react';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const CategoryManager: React.FC = () => {
  const { categories, products, addCategory, editCategory, deleteCategory } = useProducts();
  const { hasPermission, userRole } = useStore();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleAddCategory = async () => {
    if (newCategoryName.trim() && !categories.some(cat => cat.name === newCategoryName.trim())) {
      setAddingCategory(true);
      try {
        await addCategory(newCategoryName.trim(), userRole || 'user');
        setNewCategoryName('');
        setShowAddDialog(false);
      } finally {
        setAddingCategory(false);
      }
    }
  };

  const handleEditCategory = async () => {
    if (editCategoryName.trim() && editingCategory && !categories.some(cat => cat.name === editCategoryName.trim())) {
      setEditingCategoryLoading(true);
      try {
        await editCategory(editingCategory, editCategoryName.trim(), userRole || 'user');
        setEditingCategory(null);
        setEditCategoryName('');
        setShowEditDialog(false);
      } finally {
        setEditingCategoryLoading(false);
      }
    }
  };

  const [deletingCategory, setDeletingCategory] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryLoading, setEditingCategoryLoading] = useState(false);

  const handleDeleteCategory = async (categoryId: string) => {
    setDeletingCategory(true);
    try {
      await deleteCategory(categoryId, userRole || 'user');
    } finally {
      setDeletingCategory(false);
    }
  };

  const startEditCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setEditingCategory(categoryId);
      setEditCategoryName(category.name);
      setShowEditDialog(true);
    }
  };

  const getCategoryProductCount = (category: string) => {
    return products.filter(p => p.category === category).length;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-primary" />
            <span>Category Management</span>
          </CardTitle>
          
          {!hasPermission('products:write') ? (
            <Button 
              variant="outline" 
              size="sm" 
              disabled 
              className="opacity-50 cursor-not-allowed whitespace-nowrap"
              onClick={() => toast({
                title: "Permission denied",
                description: "You don't have permission to manage categories",
                variant: "destructive"
              })}
            >
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Read Only</span>
              <span className="sm:hidden">Read Only</span>
            </Button>
          ) : (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Add Category</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName" className="text-foreground">Category Name</Label>
                    <Input
                      id="categoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      className="mt-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setShowAddDialog(false)}
                      variant="outline" 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddCategory}
                      disabled={!newCategoryName.trim() || categories.some(cat => cat.name === newCategoryName.trim()) || addingCategory}
                      className="flex-1"
                    >
                      {addingCategory ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        'Add Category'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...categories].sort((a, b) => {
            if (a.name === 'Other') return 1;
            if (b.name === 'Other') return -1;
            return a.name.localeCompare(b.name);
          }).map((category) => {
            const productCount = getCategoryProductCount(category.name);
            const isEssential = ['Other'].includes(category.name);
            
            return (
              <div
                key={category.id}
                className="bg-gradient-card border border-border rounded-lg p-3 hover:shadow-md transition-smooth"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Tag className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-foreground truncate">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {productCount}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditCategory(category.id)}
                    disabled={isEssential || !hasPermission('products:write')}
                    className={`flex-1 ${!hasPermission('products:write') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {!hasPermission('products:write') ? <Lock className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                    {!hasPermission('products:write') ? 'Locked' : 'Edit'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => !hasPermission('products:write') ? toast({
                      title: "Permission denied",
                      description: "You don't have permission to delete categories",
                      variant: "destructive"
                    }) : handleDeleteCategory(category.id)}
                    disabled={isEssential || !hasPermission('products:write') || deletingCategory}
                    className={`flex-1 ${!hasPermission('products:write') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {deletingCategory ? (
                      <div className="w-3 h-3 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                    ) : !hasPermission('products:write') ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    {!hasPermission('products:write') ? 'Locked' : 'Delete'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Category Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCategoryName" className="text-foreground">Category Name</Label>
                <Input
                  id="editCategoryName"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="mt-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleEditCategory()}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowEditDialog(false)}
                  variant="outline" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditCategory}
                  disabled={!editCategoryName.trim() || categories.some(cat => cat.name === editCategoryName.trim()) || editingCategoryLoading}
                  className="flex-1"
                >
                  {editingCategoryLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    'Update Category'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


      </CardContent>
    </Card>
  );
};

export default CategoryManager;