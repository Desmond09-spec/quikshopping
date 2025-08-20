import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Lock } from 'lucide-react';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnhancedCashierDialog from '@/components/EnhancedCashierDialog';
import { useToast } from '@/hooks/use-toast';

const CategoryManager: React.FC = () => {
  const { categories, products, addCategory, editCategory, deleteCategory } = useProducts();
  const { isAdminMode, adminSettings } = useAdmin();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleAddCategory = async () => {
    if (newCategoryName.trim() && !categories.some(cat => cat.name === newCategoryName.trim())) {
      // If cashier dialog is disabled, add directly
      if (adminSettings?.disableCashierDialog) {
        setAddingCategory(true);
        try {
          await addCategory(newCategoryName.trim(), 'admin');
          setNewCategoryName('');
          setShowAddDialog(false);
        } finally {
          setAddingCategory(false);
        }
        return;
      }
      
      setCashierAction('add');
      setPendingCategoryData({ name: newCategoryName.trim() });
      setShowCashierDialog(true);
    }
  };

  const handleEditCategory = async () => {
    if (editCategoryName.trim() && editingCategory && !categories.some(cat => cat.name === editCategoryName.trim())) {
      // If cashier dialog is disabled, edit directly
      if (adminSettings?.disableCashierDialog) {
        setEditingCategoryLoading(true);
        try {
          await editCategory(editingCategory, editCategoryName.trim(), 'admin');
          setEditingCategory(null);
          setEditCategoryName('');
          setShowEditDialog(false);
        } finally {
          setEditingCategoryLoading(false);
        }
        return;
      }
      
      setCashierAction('edit');
      setPendingCategoryData({ id: editingCategory, name: editCategoryName.trim() });
      setShowCashierDialog(true);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryLoading, setEditingCategoryLoading] = useState(false);  
  const [showCashierDialog, setShowCashierDialog] = useState(false);
  const [cashierAction, setCashierAction] = useState<'add' | 'edit' | 'delete'>('add');
  const [pendingCategoryData, setPendingCategoryData] = useState<any>(null);

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      // If cashier dialog is disabled, delete directly
      if (adminSettings?.disableCashierDialog) {
        setDeletingCategory(true);
        try {
          await deleteCategory(categoryId, 'admin');
        } finally {
          setDeletingCategory(false);
        }
        return;
      }
      
      setCashierAction('delete');
      setPendingCategoryData({ id: categoryId, name: category.name });
      setShowCashierDialog(true);
    }
  };

  const confirmDeleteCategory = async (cashierName: string) => {
    if (pendingCategoryData) {
      setDeletingCategory(true);
      try {
        await deleteCategory(pendingCategoryData.id, cashierName);
      } finally {
        setDeletingCategory(false);
      }
    }
  };

  const handleCashierConfirm = async (cashierName: string) => {
    if (!pendingCategoryData) return;

    try {
      if (cashierAction === 'add') {
        setAddingCategory(true);
        await addCategory(pendingCategoryData.name, cashierName);
        setNewCategoryName('');
        setShowAddDialog(false);
      } else if (cashierAction === 'edit') {
        setEditingCategoryLoading(true);
        await editCategory(pendingCategoryData.id, pendingCategoryData.name, cashierName);
        setEditingCategory(null);
        setEditCategoryName('');
        setShowEditDialog(false);
      } else if (cashierAction === 'delete') {
        setDeletingCategory(true);
        await deleteCategory(pendingCategoryData.id, cashierName);
      }
    } finally {
      setAddingCategory(false);
      setEditingCategoryLoading(false);
      setDeletingCategory(false);
      setShowCashierDialog(false);
      setPendingCategoryData(null);
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
          
          {!isAdminMode && adminSettings?.requireAdminForProductActions ? (
            <Button 
              variant="outline" 
              size="sm" 
              disabled 
              className="opacity-50 cursor-not-allowed whitespace-nowrap"
              onClick={() => toast({
                title: "Admin access required",
                description: "Please sign in as admin to manage categories",
                variant: "destructive"
              })}
            >
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Admin Only</span>
              <span className="sm:hidden">Admin</span>
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
                    disabled={isEssential || (!isAdminMode && adminSettings?.requireAdminForProductActions)}
                    className={`flex-1 ${(!isAdminMode && adminSettings?.requireAdminForProductActions) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {(!isAdminMode && adminSettings?.requireAdminForProductActions) ? <Lock className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                    {(!isAdminMode && adminSettings?.requireAdminForProductActions) ? 'Admin' : 'Edit'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => (!isAdminMode && adminSettings?.requireAdminForProductActions) ? toast({
                      title: "Admin access required",
                      description: "Please sign in as admin to delete categories",
                      variant: "destructive"
                    }) : handleDeleteCategory(category.id)}
                    disabled={isEssential || (!isAdminMode && adminSettings?.requireAdminForProductActions) || deletingCategory}
                    className={`flex-1 ${(!isAdminMode && adminSettings?.requireAdminForProductActions) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {deletingCategory ? (
                      <div className="w-3 h-3 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                    ) : (!isAdminMode && adminSettings?.requireAdminForProductActions) ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    {(!isAdminMode && adminSettings?.requireAdminForProductActions) ? 'Admin' : 'Delete'}
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

        {/* Delete Category Dialog - Removed as we now use CashierDialog */}

        {/* Cashier Dialog - Only show if dialog is not disabled */}
        {!adminSettings?.disableCashierDialog && (
          <EnhancedCashierDialog
            open={showCashierDialog}
            onOpenChange={setShowCashierDialog}
            onConfirm={handleCashierConfirm}
            title={
              cashierAction === 'add' ? 'Add Category' :
              cashierAction === 'edit' ? 'Edit Category' :
              'Delete Category'
            }
            description={
              cashierAction === 'add' ? 'Please enter the cashier\'s name to proceed with adding this category.' :
              cashierAction === 'edit' ? 'Please enter the cashier\'s name to proceed with editing this category.' :
              'Please enter the cashier\'s name to proceed with deleting this category.'
            }
            loading={addingCategory || editingCategoryLoading || deletingCategory}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryManager;