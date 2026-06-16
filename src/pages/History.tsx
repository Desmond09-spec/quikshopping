import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { History as HistoryIcon, Receipt, CreditCard, Banknote, Smartphone, Calendar, User, Phone, Activity, Plus, Edit, Trash, LogIn, LogOut, Settings, ShieldCheck, ShieldX } from 'lucide-react';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { Transaction, PaymentMethod } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Layout from '@/components/Layout';
import PullToRefresh from '@/components/PullToRefresh';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, activityLogs, loading, loadTransactions, loadActivities } = useProducts();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedTab, setSelectedTab] = useState<'transactions' | 'activities'>('transactions');
  const [dataLoading, setDataLoading] = useState(false);
  const [isTotalSalesTruncated, setIsTotalSalesTruncated] = useState(false);
  const totalSalesRef = useRef<HTMLParagraphElement>(null);

  const handleRefresh = async () => {
    await Promise.all([
      loadTransactions(true),
      loadActivities(true)
    ]);
  };

  // Filter data based on selected period
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const date = new Date(transaction.timestamp);
      switch (selectedPeriod) {
        case 'today':
          return isToday(date);
        case 'week':
          return isThisWeek(date);
        case 'month':
          return isThisMonth(date);
        case 'all':
        default:
          return true;
      }
    });
  }, [transactions, selectedPeriod]);

  const filteredActivityLogs = useMemo(() => {
    return activityLogs.filter(activity => {
      const date = new Date(activity.timestamp);
      switch (selectedPeriod) {
        case 'today':
          return isToday(date);
        case 'week':
          return isThisWeek(date);
        case 'month':
          return isThisMonth(date);
        case 'all':
        default:
          return true;
      }
    });
  }, [activityLogs, selectedPeriod]);

  const totalRevenue = filteredTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalTransactions = filteredTransactions.length;

  // Check for text truncation
  useEffect(() => {
    const checkTruncation = () => {
      if (totalSalesRef.current) {
        const element = totalSalesRef.current;
        setIsTotalSalesTruncated(element.scrollWidth > element.clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);

    return () => window.removeEventListener('resize', checkTruncation);
  }, [totalRevenue]);

  // Always load all data when component mounts - ensures history shows all past records
  useEffect(() => {
    if (!loading) {
      setDataLoading(true);
      Promise.all([
        loadTransactions(), // Always load all transactions
        loadActivities()    // Always load all activities  
      ]).finally(() => setDataLoading(false));
    }
  }, []);

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'pos':
        return <CreditCard className="w-4 h-4" />;
      case 'transfer':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getPaymentColor = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pos':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'transfer':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product_added':
        return <Plus className="w-4 h-4" />;
      case 'product_edited':
        return <Edit className="w-4 h-4" />;
      case 'product_deleted':
        return <Trash className="w-4 h-4" />;
      case 'sale_completed':
        return <Receipt className="w-4 h-4" />;
      case 'sign_in':
      case 'user_signin':
        return <LogIn className="w-4 h-4" />;
      case 'sign_out':
      case 'user_signout':
        return <LogOut className="w-4 h-4" />;
      case 'admin_signin':
        return <ShieldCheck className="w-4 h-4" />;
      case 'admin_signin_failed':
        return <ShieldX className="w-4 h-4" />;
      case 'admin_signout':
        return <ShieldX className="w-4 h-4" />;
      case 'admin_settings_changed':
        return <Settings className="w-4 h-4" />;
      case 'admin_pin_reset':
        return <ShieldCheck className="w-4 h-4" />;
      case 'admin_pin_reset_failed':
        return <ShieldX className="w-4 h-4" />;
      case 'security_question_updated':
        return <Settings className="w-4 h-4" />;
      case 'cashier_mode_changed':
        return <Settings className="w-4 h-4" />;
      case 'cashier_added':
        return <User className="w-4 h-4" />;
      case 'cashier_removed':
        return <User className="w-4 h-4" />;
      case 'category_added':
        return <Plus className="w-4 h-4" />;
      case 'category_edited':
        return <Edit className="w-4 h-4" />;
      case 'category_deleted':
        return <Trash className="w-4 h-4" />;
      case 'admin_setup':
      case 'admin_initialized':
        return <ShieldCheck className="w-4 h-4" />;
      case 'data_cleared':
      case 'system_reset':
        return <Trash className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
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

  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <HistoryIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Activity History</h1>
                <p className="text-muted-foreground">Track all transactions and system activities</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                      <div className="flex items-center space-x-2">
                        <p
                          ref={totalSalesRef}
                          className="text-lg font-bold text-foreground truncate"
                        >
                          ₦{totalRevenue.toLocaleString()}
                        </p>
                        {isTotalSalesTruncated && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                                <Activity className="w-3 h-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-0 bg-gradient-card shadow-lg" align="start">
                              <div className="px-4 py-3 space-y-2 bg-gradient-subtle rounded-lg border border-border/50 backdrop-blur-sm">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Complete Amount</p>
                                <p className="text-xl font-bold text-primary bg-primary/5 px-3 py-2 rounded-md border border-primary/10">
                                  ₦{totalRevenue.toLocaleString()}
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <HistoryIcon className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                      <p className="text-lg font-bold text-foreground">{totalTransactions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Period Filter */}
            <div className="flex space-x-2 overflow-x-auto">
              {[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'all', label: 'All Time' }
              ].map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.key as any)}
                  className="flex-shrink-0"
                >
                  {period.label}
                </Button>
              ))}
            </div>

            {/* Main Content */}
            <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Sales</TabsTrigger>
                <TabsTrigger value="activities">All Activities</TabsTrigger>
              </TabsList>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-4">
                <div className="space-y-4">
                  {(loading || dataLoading) ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-card border-border">
                          <CardContent className="p-4">
                            <div className="animate-pulse space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                                <div className="space-y-2 flex-1">
                                  <div className="h-4 bg-muted rounded w-1/4"></div>
                                  <div className="h-3 bg-muted rounded w-1/3"></div>
                                </div>
                              </div>
                              <div className="h-16 bg-muted rounded"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <Card key={transaction.id} className="bg-card border-border hover:bg-muted/5 transition-smooth">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                {getPaymentIcon(transaction.paymentMethod)}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold text-foreground">
                                    ₦{transaction.total.toLocaleString()}
                                  </h3>
                                  <Badge className={`${getPaymentColor(transaction.paymentMethod)} text-xs`}>
                                    {transaction.paymentMethod.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(transaction.timestamp, 'MMM dd, yyyy • hh:mm a')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Transaction Details */}
                          <div className="space-y-3">
                            {/* Items */}
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-foreground">Items ({transaction.items.length})</p>
                              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                {transaction.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center text-sm">
                                    <div className="flex-1">
                                      <span className="text-foreground">{item.name}</span>
                                      <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                                    </div>
                                    <span className="text-foreground font-medium">
                                      ₦{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator className="bg-border" />

                            {/* Additional Info */}
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Cashier:</span>
                                <span className="text-foreground font-medium">{transaction.cashierName}</span>
                              </div>

                              {transaction.customer && (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2 text-sm">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Customer:</span>
                                    <span className="text-foreground font-medium">{transaction.customer.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="text-foreground font-medium">{transaction.customer.phone}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">No transactions yet</h3>
                      <p className="text-muted-foreground">
                        Completed sales will appear here
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="space-y-4">
                <div className="space-y-4">
                  {(loading || dataLoading) ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="bg-card border-border">
                          <CardContent className="p-4">
                            <div className="animate-pulse flex items-start space-x-3">
                              <div className="w-10 h-10 bg-muted rounded-lg"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                                <div className="h-12 bg-muted rounded mt-2"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredActivityLogs.length > 0 ? (
                    filteredActivityLogs.map((activity) => (
                      <Card
                        key={activity.id}
                        className="bg-card border-border hover:bg-muted/5 transition-smooth cursor-pointer"
                        onClick={() => navigate(`/activity/${activity.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium text-foreground truncate">
                                  {activity.description}
                                </h3>
                                <Badge className={`${getActivityColor(activity.type)} text-xs ml-2`}>
                                  {activity.type.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>

                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{format(activity.timestamp, 'MMM dd, yyyy • hh:mm a')}</span>
                              </div>

                              {/* Cashier name - shown for all activities */}
                              {activity.details?.cashierName && (
                                <div className="mt-2 flex items-center space-x-2 text-xs">
                                  <User className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Cashier:</span>
                                  <span className="text-foreground font-medium">{activity.details.cashierName}</span>
                                </div>
                              )}

                              {/* Activity-specific details */}
                              {activity.details && (activity.type === 'sale_completed' || activity.type === 'product_added' || activity.type === 'product_edited' || activity.type === 'product_deleted' || activity.type === 'category_added' || activity.type === 'category_edited' || activity.type === 'category_deleted') && (
                                <div className="mt-2 p-3 bg-muted/30 rounded text-sm space-y-2">
                                  {activity.type === 'sale_completed' && activity.details.items && (
                                    <div className="space-y-2">
                                      <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                          <span className="text-muted-foreground">Total: </span>
                                          <span className="text-foreground font-medium">{activity.details.total}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Payment: </span>
                                          <span className="text-foreground font-medium">{activity.details.paymentMethod}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground text-xs">Items sold:</span>
                                        <div className="mt-1 space-y-1">
                                          {activity.details.items.map((item: string, index: number) => (
                                            <div key={index} className="text-xs text-foreground pl-2 border-l-2 border-primary/30">
                                              {item}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {activity.type === 'product_added' && (
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-muted-foreground">Price: </span>
                                        <span className="text-foreground">{activity.details.price}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Quantity: </span>
                                        <span className="text-foreground">{activity.details.quantity}</span>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-muted-foreground">Category: </span>
                                        <span className="text-foreground">{activity.details.category}</span>
                                      </div>
                                    </div>
                                  )}

                                  {activity.type === 'product_edited' && activity.details.changes && (
                                    <div className="space-y-1">
                                      <span className="text-muted-foreground text-xs">Changes made:</span>
                                      {activity.details.changes.map((change: string, index: number) => (
                                        <div key={index} className="text-xs text-foreground pl-2 border-l-2 border-blue-500/30">
                                          {change}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {activity.type === 'product_deleted' && (
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-muted-foreground">Price: </span>
                                        <span className="text-foreground">{activity.details.price}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Stock: </span>
                                        <span className="text-foreground">{activity.details.quantity}</span>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-muted-foreground">Category: </span>
                                        <span className="text-foreground">{activity.details.category}</span>
                                      </div>
                                    </div>
                                  )}

                                  {activity.type === 'category_added' && (
                                    <div className="text-xs">
                                      <span className="text-muted-foreground">Category Name: </span>
                                      <span className="text-foreground">{activity.details.categoryName}</span>
                                    </div>
                                  )}

                                  {activity.type === 'category_edited' && (
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-muted-foreground">Old Name: </span>
                                        <span className="text-foreground">{activity.details.oldName}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">New Name: </span>
                                        <span className="text-foreground">{activity.details.newName}</span>
                                      </div>
                                    </div>
                                  )}

                                  {activity.type === 'category_deleted' && (
                                    <div className="space-y-2 text-xs">
                                      <div>
                                        <span className="text-muted-foreground">Category Name: </span>
                                        <span className="text-foreground">{activity.details.categoryName}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Products Affected: </span>
                                        <span className="text-foreground">{activity.details.productsAffected}</span>
                                      </div>
                                      {activity.details.productsMoved && activity.details.productsMoved.length > 0 && (
                                        <div>
                                          <span className="text-muted-foreground">Products Moved: </span>
                                          <span className="text-foreground">{activity.details.productsMoved.join(', ')}</span>
                                        </div>
                                      )}
                                      <div>
                                        <span className="text-muted-foreground">Action: </span>
                                        <span className="text-foreground">{activity.details.action}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">No activities yet</h3>
                      <p className="text-muted-foreground">
                        System activities will appear here
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PullToRefresh>
    </Layout>
  );
};

export default History;