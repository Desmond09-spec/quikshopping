import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  ChevronLeft
} from 'lucide-react';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import PullToRefresh from '@/components/PullToRefresh';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type DateRange = 'today' | 'week' | 'month' | 'all';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { products, transactions, loading, loadProducts, loadTransactions } = useProducts();
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleRefresh = async () => {
    await Promise.all([
      loadProducts(true),
      loadTransactions(true)
    ]);
  };

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['all', ...cats];
  }, [products]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = endOfDay(now);

    switch (dateRange) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'all':
      default:
        return transactions;
    }

    return transactions.filter(t => {
      const date = new Date(t.timestamp);
      return date >= startDate && date <= endDate;
    });
  }, [transactions, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    const avgSalePerTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Calculate total items sold and product-level metrics
    const itemsSold = new Map<string, { quantity: number; revenue: number; name: string; category: string }>();

    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const existing = itemsSold.get(item.productId) || {
          quantity: 0,
          revenue: 0,
          name: item.name,
          category: item.category
        };
        itemsSold.set(item.productId, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity)
        });
      });
    });

    // Filter by category if selected
    const filteredItems = Array.from(itemsSold.entries())
      .filter(([_, data]) => selectedCategory === 'all' || data.category === selectedCategory);

    // Find top and slowest selling products
    const sortedByQuantity = [...filteredItems].sort((a, b) => b[1].quantity - a[1].quantity);
    const topSelling = sortedByQuantity[0];
    const slowestSelling = sortedByQuantity[sortedByQuantity.length - 1];

    // Find highest profit margin product (using revenue as proxy since we don't have cost data yet)
    const sortedByRevenue = [...filteredItems].sort((a, b) => b[1].revenue - a[1].revenue);
    const highestRevenue = sortedByRevenue[0];

    return {
      totalRevenue,
      totalCost: 0, // Placeholder - will need cost_price field in products
      totalProfit: 0, // Placeholder - will need cost_price field in products
      totalTransactions,
      avgSalePerTransaction,
      topSelling: topSelling ? {
        name: topSelling[1].name,
        quantity: topSelling[1].quantity,
        revenue: topSelling[1].revenue
      } : null,
      slowestSelling: slowestSelling ? {
        name: slowestSelling[1].name,
        quantity: slowestSelling[1].quantity,
        revenue: slowestSelling[1].revenue
      } : null,
      highestRevenue: highestRevenue ? {
        name: highestRevenue[1].name,
        revenue: highestRevenue[1].revenue
      } : null
    };
  }, [filteredTransactions, selectedCategory]);

  // Find low-stock products
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.quantity <= 10).sort((a, b) => a.quantity - b.quantity);
  }, [products]);

  // Generate PDF Report
  const downloadPDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Store Analytics Report', pageWidth / 2, 20, { align: 'center' });

    // Date Range
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Report Period: ${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy • hh:mm a')}`, pageWidth / 2, 33, { align: 'center' });

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Summary', 14, 45);

    const summaryData = [
      ['Total Revenue', `₦${metrics.totalRevenue.toLocaleString()}`],
      ['Total Transactions', metrics.totalTransactions.toString()],
      ['Avg Sale/Transaction', `₦${metrics.avgSalePerTransaction.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
      ['Total Profit/Loss', '₦0 (Cost tracking required)']
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] },
      margin: { left: 14, right: 14 }
    });

    // Insights Section
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Key Insights', 14, finalY);

    const insightsData = [];
    if (metrics.topSelling) {
      insightsData.push(['Top-Selling Product', `${metrics.topSelling.name} (${metrics.topSelling.quantity} sold)`]);
    }
    if (metrics.slowestSelling) {
      insightsData.push(['Slowest-Moving Product', `${metrics.slowestSelling.name} (${metrics.slowestSelling.quantity} sold)`]);
    }
    if (metrics.highestRevenue) {
      insightsData.push(['Highest Revenue Product', `${metrics.highestRevenue.name} (₦${metrics.highestRevenue.revenue.toLocaleString()})`]);
    }

    if (insightsData.length > 0) {
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Insight', 'Details']],
        body: insightsData,
        theme: 'striped',
        headStyles: { fillColor: [46, 204, 113] },
        margin: { left: 14, right: 14 }
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Low Stock Section
    if (lowStockProducts.length > 0) {
      doc.setFontSize(14);
      doc.text('Low Stock Alert', 14, finalY);

      const lowStockData = lowStockProducts.slice(0, 10).map(p => [
        p.name,
        p.quantity.toString(),
        '10' // Reorder level placeholder
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [['Product Name', 'Current Stock', 'Reorder Level']],
        body: lowStockData,
        theme: 'grid',
        headStyles: { fillColor: [231, 76, 60] },
        margin: { left: 14, right: 14 }
      });
    }

    // Save PDF
    doc.save(`store-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const getRangeName = () => {
    switch (dateRange) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
    }
  };

  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/settings')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
                  <p className="text-muted-foreground">Comprehensive store performance overview</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date Range
                    </label>
                    <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      <Filter className="w-4 h-4 inline mr-2" />
                      Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat === 'all' ? 'All Categories' : cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={downloadPDFReport} className="w-full md:w-auto">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground">₦{metrics.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">{getRangeName()}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Profit/Loss</p>
                      <p className="text-2xl font-bold text-foreground">₦0</p>
                      <p className="text-xs text-muted-foreground mt-1">Cost tracking required</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                      <p className="text-2xl font-bold text-foreground">{metrics.totalTransactions}</p>
                      <p className="text-xs text-muted-foreground mt-1">{getRangeName()}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Sale</p>
                      <p className="text-2xl font-bold text-foreground">₦{metrics.avgSalePerTransaction.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Insights */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Sales Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.topSelling && (
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Top-Selling Product</p>
                      <p className="text-lg font-bold text-green-400">{metrics.topSelling.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {metrics.topSelling.quantity} units sold • ₦{metrics.topSelling.revenue.toLocaleString()} revenue
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                )}

                {metrics.slowestSelling && (
                  <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Slowest-Moving Product</p>
                      <p className="text-lg font-bold text-orange-400">{metrics.slowestSelling.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {metrics.slowestSelling.quantity} units sold • ₦{metrics.slowestSelling.revenue.toLocaleString()} revenue
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-orange-400" />
                  </div>
                )}

                {metrics.highestRevenue && (
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Highest Revenue Product</p>
                      <p className="text-lg font-bold text-blue-400">{metrics.highestRevenue.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₦{metrics.highestRevenue.revenue.toLocaleString()} total revenue
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-400" />
                  </div>
                )}

                {!metrics.topSelling && !metrics.slowestSelling && !metrics.highestRevenue && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No sales data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span>Low Stock Alert</span>
                  {lowStockProducts.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {lowStockProducts.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="text-xs">
                            Low Stock
                          </Badge>
                          <p className="text-sm font-bold text-red-400 mt-1">{product.quantity} left</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>All products are well-stocked</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Note about Cost Tracking */}
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Cost Tracking Not Enabled</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      To track profit/loss accurately, add a cost price field to your products.
                      This will enable profit margin calculations and better financial insights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PullToRefresh>
    </Layout>
  );
};

export default Reports;
