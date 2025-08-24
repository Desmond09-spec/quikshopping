import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Activity, 
  Plus, 
  Edit, 
  Trash, 
  Receipt, 
  LogIn, 
  LogOut, 
  Calendar, 
  User, 
  Package,
  DollarSign,
  Hash,
  Tag,
  Settings,
  ShieldCheck,
  ShieldX,
  Mail
} from 'lucide-react';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/Layout';

const ActivityDetails: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { activityLogs } = useProducts();

  const activity = activityLogs.find(log => log.id === activityId);

  if (!activity) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Activity not found</h3>
            <p className="text-muted-foreground mb-4">
              The activity you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/history')} variant="outline">
              <ArrowLeft className="w-4 h-4" />
              Back to History
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product_added':
        return <Plus className="w-6 h-6" />;
      case 'product_edited':
        return <Edit className="w-6 h-6" />;
      case 'product_deleted':
        return <Trash className="w-6 h-6" />;
      case 'sale_completed':
        return <Receipt className="w-6 h-6" />;
      case 'sign_in':
      case 'user_signin':
        return <LogIn className="w-6 h-6" />;
      case 'sign_out':
      case 'user_signout':
        return <LogOut className="w-6 h-6" />;
      case 'admin_signin':
        return <ShieldCheck className="w-6 h-6" />;
      case 'admin_signin_failed':
        return <ShieldX className="w-6 h-6" />;
      case 'admin_signout':
        return <ShieldX className="w-6 h-6" />;
      case 'admin_settings_changed':
        return <Settings className="w-6 h-6" />;
      case 'admin_pin_reset':
        return <ShieldCheck className="w-6 h-6" />;
      case 'admin_pin_reset_failed':
        return <ShieldX className="w-6 h-6" />;
      case 'security_question_updated':
        return <Settings className="w-6 h-6" />;
      case 'cashier_mode_changed':
        return <Settings className="w-6 h-6" />;
      case 'cashier_added':
        return <User className="w-6 h-6" />;
      case 'cashier_removed':
        return <User className="w-6 h-6" />;
      case 'category_added':
        return <Plus className="w-6 h-6" />;
      case 'category_edited':
        return <Edit className="w-6 h-6" />;
      case 'category_deleted':
        return <Trash className="w-6 h-6" />;
      case 'admin_setup':
      case 'admin_initialized':
        return <ShieldCheck className="w-6 h-6" />;
      case 'data_cleared':
      case 'system_reset':
        return <Trash className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'product_added':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'product_edited':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'product_deleted':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'sale_completed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'sign_in':
      case 'user_signin':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'sign_out':
      case 'user_signout':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'admin_signin':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'admin_signin_failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'admin_signout':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'admin_settings_changed':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'admin_pin_reset':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'admin_pin_reset_failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'security_question_updated':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'cashier_mode_changed':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'cashier_added':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'cashier_removed':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'category_added':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'category_edited':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'category_deleted':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'admin_setup':
      case 'admin_initialized':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'data_cleared':
      case 'system_reset':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'product_added':
        return 'Product Added';
      case 'product_edited':
        return 'Product Edited';
      case 'product_deleted':
        return 'Product Deleted';
      case 'sale_completed':
        return 'Sale Completed';
      case 'sign_in':
      case 'user_signin':
        return 'User Sign In';
      case 'sign_out':
      case 'user_signout':
        return 'User Sign Out';
      case 'admin_signin':
        return 'Admin Sign In';
      case 'admin_signin_failed':
        return 'Admin Sign In Failed';
      case 'admin_signout':
        return 'Admin Sign Out';
      case 'admin_settings_changed':
        return 'Admin Settings Changed';
      case 'admin_pin_reset':
        return 'Admin PIN Reset';
      case 'admin_pin_reset_failed':
        return 'Admin PIN Reset Failed';
      case 'security_question_updated':
        return 'Security Question Updated';
      case 'cashier_mode_changed':
        return 'Cashier Sign-In Mode Changed';
      case 'cashier_added':
        return 'Cashier Added';
      case 'cashier_removed':
        return 'Cashier Removed';
      case 'category_added':
        return 'Category Added';
      case 'category_edited':
        return 'Category Edited';
      case 'category_deleted':
        return 'Category Deleted';
      case 'admin_setup':
      case 'admin_initialized':
        return 'Admin Setup';
      case 'data_cleared':
      case 'system_reset':
        return 'Data Cleared';
      default:
        return 'Activity';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/history')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{getActivityTitle(activity.type)}</h1>
            <p className="text-muted-foreground">Activity details and information</p>
          </div>
        </div>

        {/* Main Activity Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-foreground">{activity.description}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getActivityColor(activity.type)} text-xs`}>
                    {activity.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(activity.timestamp, 'MMMM dd, yyyy • hh:mm:ss a')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Activity ID:</span>
                  <span className="text-foreground font-mono">{activity.id}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="text-foreground">{format(activity.timestamp, 'PPPppp')}</span>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Cashier Information */}
            {activity.details?.cashierName && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Cashier Information</h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Performed by:</span>
                    <span className="text-foreground font-medium">{activity.details.cashierName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Information */}
            {activity.details && (activity.type === 'sale_completed' || activity.type === 'product_added' || activity.type === 'product_edited' || activity.type === 'product_deleted' || activity.type === 'category_added' || activity.type === 'category_edited' || activity.type === 'category_deleted' || activity.type === 'cashier_mode_changed' || activity.type === 'cashier_added' || activity.type === 'cashier_removed' || activity.type === 'admin_pin_reset' || activity.type === 'admin_signin_failed' || activity.type === 'admin_pin_reset_failed' || activity.type === 'security_question_updated' || activity.type === 'admin_settings_changed') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Detailed Information</h3>
                
                {/* Sale Completed Details */}
                {activity.type === 'sale_completed' && activity.details.items && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-muted/30 border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="text-sm text-muted-foreground">Total Amount</p>
                              <p className="text-xl font-bold text-foreground">{activity.details.total}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/30 border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Package className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="text-sm text-muted-foreground">Items Count</p>
                              <p className="text-xl font-bold text-foreground">{activity.details.items?.length || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/30 border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Receipt className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="text-sm text-muted-foreground">Payment Method</p>
                              <p className="text-xl font-bold text-foreground capitalize">{activity.details.paymentMethod}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Customer Details for Transfer Payments */}
                    {activity.details.paymentMethod === 'transfer' && activity.details.customer && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Customer Details</h4>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Name:</span>
                            <span className="text-foreground font-medium">{activity.details.customer.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Phone:</span>
                            <span className="text-foreground font-medium">{activity.details.customer.phone}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Items Sold</h4>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                        {activity.details.items.map((item: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-card rounded border-l-4 border-primary">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Added Details */}
                {activity.type === 'product_added' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-muted/30 border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Price</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.price}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30 border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Package className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Initial Stock</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.quantity}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30 border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.category}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Product Edited Details */}
                {activity.type === 'product_edited' && activity.details.changes && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Changes Made</h4>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      {activity.details.changes.map((change: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-card rounded border-l-4 border-blue-500">
                          <Edit className="w-4 h-4 text-blue-400" />
                          <span className="text-foreground">{change}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Deleted Details */}
                {activity.type === 'product_deleted' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Last Price</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.price}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Package className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Stock at Deletion</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.quantity}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.category}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Category Added Details */}
                {activity.type === 'category_added' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-green-500/10 border-green-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Category Name</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.categoryName}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Category Edited Details */}
                {activity.type === 'category_edited' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-blue-500/10 border-blue-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Previous Name</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.oldName}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-500/10 border-blue-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">New Name</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.newName}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Category Deleted Details */}
                {activity.type === 'category_deleted' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-red-500/10 border-red-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Tag className="w-5 h-5 text-red-400" />
                            <div>
                              <p className="text-sm text-muted-foreground">Category Name</p>
                              <p className="text-lg font-bold text-foreground">{activity.details.categoryName}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-red-500/10 border-red-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Package className="w-5 h-5 text-red-400" />
                            <div>
                              <p className="text-sm text-muted-foreground">Products Affected</p>
                              <p className="text-lg font-bold text-foreground">{activity.details.productsAffected}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {activity.details.productsMoved && activity.details.productsMoved.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Products Moved to 'Other'</h4>
                        <div className="bg-red-500/10 rounded-lg p-4 space-y-2">
                          {activity.details.productsMoved.map((productName: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-card rounded border-l-4 border-red-500">
                              <Package className="w-4 h-4 text-red-400" />
                              <span className="text-foreground">{productName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Action</p>
                            <p className="text-sm text-foreground">{activity.details.action}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Cashier Mode Changed Details */}
                {activity.type === 'cashier_mode_changed' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-orange-500/10 border-orange-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Settings className="w-5 h-5 text-orange-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">New Mode</p>
                            <p className="text-lg font-bold text-foreground">
                              {activity.details.newMode === 'dropdown' ? 'Secure (Dropdown)' : 'Free Text'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-orange-500/10 border-orange-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Mail className="w-5 h-5 text-orange-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-muted-foreground">Changed by</p>
                            <p className="text-lg font-bold text-foreground truncate" title={activity.details.changedBy || 'Admin'}>
                              {activity.details.changedBy || 'Admin'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Cashier Added Details */}
                {activity.type === 'cashier_added' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-teal-500/10 border-teal-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-teal-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Cashier Name</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.cashierName}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-teal-500/10 border-teal-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Mail className="w-5 h-5 text-teal-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-muted-foreground">Added by</p>
                            <p className="text-lg font-bold text-foreground truncate" title={activity.details.addedBy || 'Admin'}>
                              {activity.details.addedBy || 'Admin'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Cashier Removed Details */}
                {activity.type === 'cashier_removed' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-pink-500/10 border-pink-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-pink-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Cashier Name</p>
                            <p className="text-lg font-bold text-foreground">{activity.details.cashierName}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-pink-500/10 border-pink-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Mail className="w-5 h-5 text-pink-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-muted-foreground">Removed by</p>
                            <p className="text-lg font-bold text-foreground truncate" title={activity.details.removedBy || 'Admin'}>
                              {activity.details.removedBy || 'Admin'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Admin Sign In Failed Details */}
                {activity.type === 'admin_signin_failed' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Mail className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-muted-foreground">Admin Email</p>
                            <p className="text-lg font-bold text-foreground truncate" title={activity.details.adminEmail}>
                              {activity.details.adminEmail}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-sm text-muted-foreground">Attempt Time</p>
                            <p className="text-sm font-medium text-foreground">
                              {activity.details.attemptTime ? format(new Date(activity.details.attemptTime), 'PPp') : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                 {/* Admin PIN Reset Details */}
                 {activity.type === 'admin_pin_reset' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-cyan-500/10 border-cyan-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 min-w-0">
                            <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground">Admin Email</p>
                              <p className="text-lg font-bold text-foreground truncate" title={activity.details.adminEmail}>
                                {activity.details.adminEmail}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                     
                     <Card className="bg-cyan-500/10 border-cyan-500/20">
                       <CardContent className="p-4">
                         <div className="flex items-center space-x-2">
                           <Calendar className="w-5 h-5 text-cyan-400" />
                           <div>
                             <p className="text-sm text-muted-foreground">Reset Time</p>
                             <p className="text-sm font-medium text-foreground">
                               {activity.details.resetTime ? format(new Date(activity.details.resetTime), 'PPp') : 'N/A'}
                             </p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   </div>
                 )}

                 {/* Admin PIN Reset Failed Details */}
                 {activity.type === 'admin_pin_reset_failed' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <Card className="bg-red-500/10 border-red-500/20">
                       <CardContent className="p-4">
                         <div className="flex items-center space-x-2 min-w-0">
                           <Mail className="w-5 h-5 text-red-400 flex-shrink-0" />
                           <div className="min-w-0 flex-1">
                             <p className="text-sm text-muted-foreground">Admin Email</p>
                             <p className="text-lg font-bold text-foreground truncate" title={activity.details.adminEmail}>
                               {activity.details.adminEmail}
                             </p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                     
                     <Card className="bg-red-500/10 border-red-500/20">
                       <CardContent className="p-4">
                         <div className="flex items-center space-x-2">
                           <Calendar className="w-5 h-5 text-red-400" />
                           <div>
                             <p className="text-sm text-muted-foreground">Attempt Time</p>
                             <p className="text-sm font-medium text-foreground">
                               {activity.details.attemptTime ? format(new Date(activity.details.attemptTime), 'PPp') : 'N/A'}
                             </p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>

                     <Card className="bg-red-500/10 border-red-500/20">
                       <CardContent className="p-4">
                         <div className="flex items-center space-x-2">
                           <Hash className="w-5 h-5 text-red-400" />
                           <div>
                             <p className="text-sm text-muted-foreground">Attempt Number</p>
                             <p className="text-lg font-bold text-foreground">
                               {activity.details.attemptNumber}/3
                             </p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>

                     {activity.details.locked && (
                       <Card className="bg-red-500/10 border-red-500/20 md:col-span-2 lg:col-span-3">
                         <CardContent className="p-4">
                           <div className="flex items-center space-x-2">
                             <ShieldX className="w-5 h-5 text-red-400" />
                             <div>
                               <p className="text-sm text-muted-foreground">Account Status</p>
                               <p className="text-lg font-bold text-red-400">Temporarily Locked</p>
                             </div>
                           </div>
                         </CardContent>
                       </Card>
                     )}
                   </div>
                 )}

                 {/* Security Question Updated Details */}
                 {activity.type === 'security_question_updated' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Card className="bg-violet-500/10 border-violet-500/20">
                       <CardContent className="p-4">
                         <div className="flex items-center space-x-2 min-w-0">
                           <Mail className="w-5 h-5 text-violet-400 flex-shrink-0" />
                           <div className="min-w-0 flex-1">
                             <p className="text-sm text-muted-foreground">Admin Email</p>
                             <p className="text-lg font-bold text-foreground truncate" title={activity.details.adminEmail}>
                               {activity.details.adminEmail}
                             </p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                     
                     <Card className="bg-violet-500/10 border-violet-500/20">
                       <CardContent className="p-4">
                         <div className="flex items-center space-x-2">
                           <Calendar className="w-5 h-5 text-violet-400" />
                           <div>
                             <p className="text-sm text-muted-foreground">Update Time</p>
                             <p className="text-sm font-medium text-foreground">
                               {activity.details.updateTime ? format(new Date(activity.details.updateTime), 'PPp') : 'N/A'}
                             </p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                    </div>
                  )}

                {/* Admin Settings Explanation Section */}
                {(activity.type === 'admin_settings_changed' || activity.type === 'admin_signin_failed' || activity.type === 'admin_pin_reset' || activity.type === 'admin_pin_reset_failed' || activity.type === 'security_question_updated') && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">What This Means</h4>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      {activity.type === 'admin_settings_changed' && activity.details.settingChanged && (
                        <div className="space-y-2">
                          <p className="text-sm text-foreground font-medium">Setting Changed:</p>
                          {activity.details.settingChanged === 'disable_cashier_dialog' && (
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>• <strong>Cashier Dialog Modal:</strong> {activity.details.newValue ? 'Disabled' : 'Enabled'}</p>
                              {activity.details.newValue ? (
                                <p>• Product operations (add, edit, delete) will no longer require cashier name confirmation</p>
                              ) : (
                                <p>• Product operations will now require cashier name confirmation for better tracking</p>
                              )}
                              <p>• This affects how your team interacts with product management features</p>
                            </div>
                          )}
                          {activity.details.settingChanged === 'require_admin_for_product_actions' && (
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>• <strong>Admin Requirement for Products:</strong> {activity.details.newValue ? 'Enabled' : 'Disabled'}</p>
                              {activity.details.newValue ? (
                                <p>• Only admin users can now add, edit, or delete products</p>
                              ) : (
                                <p>• Any authorized user can now manage products without admin access</p>
                              )}
                              <p>• This setting controls who has permission to modify your product inventory</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {activity.type === 'admin_signin_failed' && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• Someone attempted to sign in as admin but entered an incorrect PIN</p>
                          <p>• Multiple failed attempts may temporarily lock the admin account for security</p>
                          <p>• If this wasn't you, consider updating your admin PIN immediately</p>
                        </div>
                      )}
                      
                      {activity.type === 'admin_pin_reset' && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• The admin PIN has been successfully changed</p>
                          <p>• Use the new PIN for future admin sign-ins</p>
                          <p>• Old PIN is no longer valid and cannot be used</p>
                        </div>
                      )}
                      
                      {activity.type === 'admin_pin_reset_failed' && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• An attempt to reset the admin PIN was unsuccessful</p>
                          <p>• This could be due to invalid verification or security question answer</p>
                          <p>• Contact support if you're unable to reset your PIN after multiple attempts</p>
                        </div>
                      )}
                      
                      {activity.type === 'security_question_updated' && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• Your security question has been updated successfully</p>
                          <p>• This question will be used for PIN recovery if you forget your admin PIN</p>
                          <p>• Keep your security answer confidential and memorable</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
               </div>
             )}
           </CardContent>
         </Card>
      </div>
    </Layout>
  );
};

export default ActivityDetails;