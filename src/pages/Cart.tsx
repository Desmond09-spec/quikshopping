import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, X, PlusCircle, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { PaymentMethod, TransactionFormData, Transaction } from '@/types';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { formatPhoneNumber, validatePhoneNumber } from '@/lib/phoneUtils';
import PullToRefresh from '@/components/PullToRefresh';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { carts, activeCart, activeCartId, removeItem, updateQuantity, clearCart, createNewCart, switchToCart, closeCart, validateAndAdjustCarts, validateCartItems } = useCart();
  const { addTransaction, updateProductQuantity, products, loadProducts } = useProducts();
  const { toast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'customer' | 'order'>('method');
  const [isCompletingSale, setIsCompletingSale] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    paymentMethod: 'cash',
    cashierName: '',
    customer: undefined
  });
  const [validationErrors, setValidationErrors] = useState<{
    customerName?: string;
    customerPhone?: string;
  }>({});
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);

  // Real-time cart validation: Adjust cart quantities when product quantities change
  useEffect(() => {
    if (products.length > 0) {
      const result = validateAndAdjustCarts(products);

      if (result.adjusted && result.adjustedItems.length > 0) {
        // Show notification for adjusted items
        const message = result.adjustedItems.map(item =>
          `${item.productName}: ${item.oldQuantity} → ${item.newQuantity}`
        ).join('\n');

        toast({
          title: "🔄 Cart Updated",
          description: (
            <div className="space-y-1">
              <p className="font-semibold">Product quantities adjusted due to stock changes:</p>
              {result.adjustedItems.map((item, idx) => (
                <p key={idx} className="text-sm">
                  • {item.productName}: {item.oldQuantity} → {item.newQuantity}
                  {item.newQuantity === 0 && " (removed - out of stock)"}
                </p>
              ))}
            </div>
          ),
          duration: 5000,
        });
      }
    }
  }, [products, validateAndAdjustCarts, toast]);

  const handleRefresh = async () => {
    await loadProducts(true);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (!activeCart) return;

    const cartItem = activeCart.items.find(item => item.id === itemId);
    if (!cartItem) return;

    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      const quantityDiff = newQuantity - cartItem.quantity;
      const product = products.find(p => p.id === cartItem.productId);

      if (product && quantityDiff > 0 && product.quantity < quantityDiff) {
        toast({
          title: "Insufficient stock",
          description: `Only ${product.quantity} items available`,
          variant: "destructive"
        });
        return;
      }

      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCreateNewCart = () => {
    if (carts.length >= 10) {
      toast({
        title: "Maximum carts reached",
        description: "You can have up to 10 carts at once",
        variant: "destructive"
      });
      return;
    }
    createNewCart();
  };

  const handleCloseCart = (cartId: string) => {
    const cart = carts.find(c => c.id === cartId);
    if (cart && cart.items.length > 0) {
      if (!confirm(`Close cart with ${cart.items.length} items?`)) {
        return;
      }
    }
    closeCart(cartId);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));

    if (method === 'transfer') {
      setPaymentStep('customer');
    } else {
      setPaymentStep('order');
    }
  };

  const validateCustomerName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required';

    // Check if name contains only alphabetic characters and spaces
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name should contain only letters and spaces';
    }

    // Check if name has at least two words
    const words = name.trim().split(/\s+/);
    if (words.length < 2) {
      return 'Please enter your full name (first and last).';
    }

    return undefined;
  };

  const validateCustomerPhone = (phone: string): string | undefined => {
    if (!phone.trim()) return 'Phone number is required';

    if (!validatePhoneNumber(phone)) {
      return 'Please enter a valid Nigerian phone number';
    }

    return undefined;
  };

  const capitalizeWords = (str: string): string => {
    // Don't trim to preserve spaces while typing
    return str
      .split(' ')
      .map(word => {
        if (word.length === 0) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const handleCustomerNameChange = (value: string) => {
    // Allow only letters and spaces during typing
    const filtered = value.replace(/[^a-zA-Z\s]/g, '');
    const capitalized = capitalizeWords(filtered);

    setFormData(prev => ({
      ...prev,
      customer: { ...prev.customer, name: capitalized, phone: prev.customer?.phone || '' }
    }));

    // Clear error on change
    if (validationErrors.customerName) {
      setValidationErrors(prev => ({ ...prev, customerName: undefined }));
    }
  };

  const handleCustomerPhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      customer: { ...prev.customer, name: prev.customer?.name || '', phone: value }
    }));

    // Clear error on change
    if (validationErrors.customerPhone) {
      setValidationErrors(prev => ({ ...prev, customerPhone: undefined }));
    }
  };

  const handleCustomerSubmit = () => {
    const nameError = validateCustomerName(formData.customer?.name || '');
    const phoneError = validateCustomerPhone(formData.customer?.phone || '');

    if (nameError || phoneError) {
      setValidationErrors({
        customerName: nameError,
        customerPhone: phoneError
      });
      return;
    }

    // Format phone number to +234 format before proceeding
    let formattedPhone = formData.customer?.phone || '';
    if (formattedPhone) {
      formattedPhone = formatPhoneNumber(formattedPhone);
      setFormData(prev => ({
        ...prev,
        customer: { ...prev.customer!, phone: formattedPhone }
      }));
    }

    setPaymentStep('order');
  };

  const handleFinalSubmit = async () => {
    if (!activeCart || !activeCartId) return;

    // Pre-sale validation: Check if all items are still available
    const validation = validateCartItems(products);
    if (!validation.isValid) {
      // Show detailed error message
      toast({
        title: "❌ Cannot Complete Sale",
        description: (
          <div className="space-y-2">
            <p className="font-semibold">The following items are no longer available:</p>
            {validation.errors.map((error, idx) => (
              <p key={idx} className="text-sm">
                • {error.productName}: Requested {error.requested}, Available {error.available}
              </p>
            ))}
            <p className="text-sm font-semibold mt-2">Please adjust your cart and try again.</p>
          </div>
        ),
        variant: "destructive",
        duration: 8000,
      });
      return;
    }

    setIsCompletingSale(true);
    try {
      // Update product quantities based on cart items
      for (const cartItem of activeCart.items) {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
          await updateProductQuantity(cartItem.productId, -cartItem.quantity, true);
        }
      }

      const transaction: Omit<Transaction, 'id'> = {
        items: activeCart.items,
        total: activeCart.total,
        paymentMethod: formData.paymentMethod,
        cashierName: formData.cashierName,
        customer: formData.customer,
        timestamp: new Date()
      };

      await addTransaction(transaction);

      // Close the current cart after successful transaction
      closeCart(activeCartId);

      // Reset form
      setShowPaymentModal(false);
      setPaymentStep('method');
      setFormData({
        paymentMethod: 'cash',
        cashierName: '',
        customer: undefined
      });
    } catch (error: any) {
      toast({
        title: "Error completing sale",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCompletingSale(false);
    }
  };

  const resetModal = () => {
    setPaymentStep('method');
    setFormData({
      paymentMethod: 'cash',
      cashierName: '',
      customer: undefined
    });
    setValidationErrors({});
  };

  const isCartEmpty = !activeCart || activeCart.items.length === 0;

  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 pb-[152px] md:pb-6">
          <div className="max-w-4xl mx-auto space-y-5 md:space-y-6">
            {/* Cart Tabs - Always Visible */}
            <div className="bg-card shadow-md border border-border rounded-xl p-3 md:p-4 transition-smooth">
              <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                {carts.map((cart) => (
                  <button
                    key={cart.id}
                    onClick={() => switchToCart(cart.id)}
                    className={cn(
                      "group flex items-center gap-2.5 px-4 md:px-5 py-3 md:py-3.5 rounded-xl transition-smooth min-w-[140px] md:min-w-[160px] flex-shrink-0 touch-target",
                      cart.id === activeCartId
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "bg-secondary/50 text-foreground hover:bg-secondary shadow-sm hover:shadow-md"
                    )}
                  >
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-bold text-sm md:text-base truncate">{cart.name}</p>
                      <p className="text-xs opacity-75 truncate font-medium">
                        {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>

                    {carts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseCart(cart.id);
                        }}
                        className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-smooth touch-target"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </button>
                ))}

                {carts.length < 10 && (
                  <button
                    onClick={handleCreateNewCart}
                    className="flex items-center gap-2.5 px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-secondary/30 hover:bg-secondary text-foreground transition-smooth min-w-[130px] md:min-w-[140px] border-2 border-dashed border-border hover:border-primary/30 flex-shrink-0 shadow-sm hover:shadow-md touch-target"
                  >
                    <PlusCircle className="w-4 h-4 md:w-4.5 md:h-4.5" />
                    <span className="text-sm md:text-base font-bold">New Cart</span>
                  </button>
                )}
              </div>
            </div>

            {/* Empty State */}
            {isCartEmpty ? (
              <div className="max-w-xl mx-auto text-center space-y-4 py-8 md:py-12">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Your cart is empty</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Start adding products to create your first transaction
                </p>
                <Button size="lg" onClick={() => navigate("/")} className="mt-4">
                  <Package className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </div>
            ) : (
              <>

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {activeCart?.name || 'Cart'}
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground font-medium mt-0.5">
                      {activeCart?.items.length || 0} {activeCart?.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {/* Desktop: Clear button with text */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearCartDialog(true)}
                    className="hidden md:flex hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-smooth shadow-sm hover:shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="ml-2">Clear</span>
                  </Button>

                  {/* Mobile: Clear + Checkout icons */}
                  <Dialog open={showPaymentModal} onOpenChange={(open) => {
                    setShowPaymentModal(open);
                    if (!open) resetModal();
                  }}>
                    <div className="flex md:hidden items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowClearCartDialog(true)}
                        className="h-11 w-11 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-smooth shadow-sm hover:shadow-md touch-target"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          className="h-11 w-11 shadow-lg hover:shadow-glow transition-smooth touch-target"
                        >
                          <CreditCard className="w-5 h-5" />
                        </Button>
                      </DialogTrigger>
                    </div>
                  </Dialog>
                </div>

                {/* Cart Items - Mobile Optimized */}
                <div className="space-y-4 md:space-y-5">
                  {activeCart?.items.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    const stockStatus = product ? (
                      item.quantity >= product.quantity ? 'low' : 'available'
                    ) : 'unknown';

                    return (
                      <div
                        key={item.id}
                        className="bg-card shadow-md hover:shadow-lg border border-border rounded-xl md:rounded-2xl p-4 md:p-5 transition-smooth"
                      >
                        <div className="flex gap-4 md:gap-5">
                          {/* Product Icon */}
                          <div className="flex-shrink-0 w-16 h-16 md:w-18 md:h-18 bg-gradient-subtle rounded-xl shadow-sm flex items-center justify-center border border-border">
                            <Package className="w-8 h-8 md:w-9 md:h-9 text-primary" />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-base md:text-lg text-foreground truncate leading-tight">
                                    {item.name}
                                  </h3>
                                  <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
                                    {item.category}
                                  </p>
                                </div>

                                {stockStatus === 'low' && (
                                  <span className="text-xs px-2.5 py-1 rounded-lg bg-warning/10 text-warning border border-warning/30 font-semibold whitespace-nowrap shadow-sm">
                                    Low Stock
                                  </span>
                                )}
                              </div>

                              <p className="text-xl md:text-2xl font-bold text-primary">
                                ₦{item.price.toLocaleString()}
                              </p>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between gap-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center bg-secondary rounded-xl shadow-sm border border-border">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="h-10 w-10 md:h-11 md:w-11 rounded-l-xl hover:bg-primary/10 hover:text-primary transition-smooth touch-target"
                                >
                                  <Minus className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>

                                <span className="w-12 md:w-14 text-center font-bold text-base md:text-lg text-foreground">
                                  {item.quantity}
                                </span>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  disabled={(() => {
                                    const product = products.find(p => p.id === item.productId);
                                    return !product || item.quantity >= product.quantity;
                                  })()}
                                  className="h-10 w-10 md:h-11 md:w-11 rounded-r-xl hover:bg-primary/10 hover:text-primary disabled:opacity-30 transition-smooth touch-target"
                                >
                                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                              </div>

                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="hover:bg-destructive/10 hover:text-destructive h-10 w-10 md:h-11 md:w-11 rounded-xl transition-smooth shadow-sm hover:shadow-md touch-target"
                              >
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                              </Button>
                            </div>

                            {/* Item Subtotal */}
                            <div className="pt-3 border-t border-border">
                              <div className="flex justify-between items-center">
                                <span className="text-sm md:text-base text-muted-foreground font-semibold">Subtotal</span>
                                <span className="font-bold text-lg md:text-xl text-foreground">
                                  ₦{(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </PullToRefresh>

      {/* Total Summary - Fixed at Bottom (Outside PullToRefresh for proper positioning) */}
      {!isCartEmpty && (
        <div className="fixed md:relative bottom-[60px] md:bottom-auto left-0 right-0 bg-card/98 backdrop-blur-md border-t md:border md:border-border py-5 px-4 md:p-6 z-10 shadow-lg md:shadow-glow md:rounded-2xl">
          <div className="max-w-4xl mx-auto">
            <Dialog open={showPaymentModal} onOpenChange={(open) => {
              setShowPaymentModal(open);
              if (!open) resetModal();
            }}>
              {/* Mobile Layout: Total Amount Only */}
              <div className="flex md:hidden items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="font-bold text-lg text-foreground">Total Amount</span>
                  <p className="text-sm text-muted-foreground font-medium mt-0.5">
                    {activeCart?.items.length || 0} items
                  </p>
                </div>
                <span className="font-bold text-3xl text-primary">
                  ₦{activeCart?.total.toLocaleString() || 0}
                </span>
              </div>

              {/* Desktop Layout: Total + Full Button */}
              <div className="hidden md:block space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-xl text-foreground">Total Amount</span>
                    <p className="text-sm text-muted-foreground font-medium mt-0.5">
                      {activeCart?.items.length || 0} items
                    </p>
                  </div>
                  <span className="font-bold text-4xl text-primary">
                    ₦{activeCart?.total.toLocaleString() || 0}
                  </span>
                </div>

                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full h-16 text-lg font-bold shadow-lg hover:shadow-glow transition-smooth"
                  >
                    <CreditCard className="w-6 h-6 mr-2.5" />
                    Complete Sale
                  </Button>
                </DialogTrigger>
              </div>

              <DialogContent className="sm:max-w-md bg-card border-border shadow-elegant rounded-2xl">
                <DialogHeader className="pb-2">
                  <DialogTitle className="text-foreground text-xl md:text-2xl font-bold">
                    {paymentStep === 'method' && 'Payment Method'}
                    {paymentStep === 'customer' && 'Customer Details'}
                    {paymentStep === 'order' && 'Order Details'}
                  </DialogTitle>
                </DialogHeader>

                {/* Payment Method Selection */}
                {paymentStep === 'method' && (
                  <div className="space-y-3 md:space-y-4">
                    {[
                      { value: 'cash', label: 'Cash', desc: 'Physical cash payment' },
                      { value: 'pos', label: 'POS', desc: 'Card payment via terminal' },
                      { value: 'transfer', label: 'Transfer', desc: 'Bank transfer' }
                    ].map((method) => (
                      <button
                        key={method.value}
                        className={cn(
                          "w-full flex items-center gap-3.5 p-4 md:p-5 border rounded-xl cursor-pointer transition-smooth touch-target",
                          formData.paymentMethod === method.value
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/30 hover:bg-secondary/30 shadow-sm hover:shadow-md'
                        )}
                        onClick={() => handlePaymentMethodSelect(method.value as PaymentMethod)}
                      >
                        <div className={cn(
                          "w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-smooth",
                          formData.paymentMethod === method.value
                            ? 'border-primary bg-primary shadow-sm'
                            : 'border-muted-foreground'
                        )}>
                          {formData.paymentMethod === method.value && (
                            <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-base md:text-lg text-foreground">{method.label}</p>
                          <p className="text-sm md:text-base text-muted-foreground font-medium">{method.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Customer Information */}
                {paymentStep === 'customer' && (
                  <div className="space-y-4 md:space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="text-foreground font-semibold">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={formData.customer?.name || ''}
                        onChange={(e) => handleCustomerNameChange(e.target.value)}
                        placeholder="John Doe"
                        className={cn(
                          "transition-smooth",
                          validationErrors.customerName && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {validationErrors.customerName && (
                        <div className="flex items-start gap-2 text-destructive text-sm mt-1.5">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{validationErrors.customerName}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-foreground font-semibold">Phone Number</Label>
                      <Input
                        id="customerPhone"
                        value={formData.customer?.phone || ''}
                        onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                        placeholder="08012345678"
                        className={cn(
                          "transition-smooth",
                          validationErrors.customerPhone && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {validationErrors.customerPhone && (
                        <div className="flex items-start gap-2 text-destructive text-sm mt-1.5">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{validationErrors.customerPhone}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Enter Nigerian phone number (e.g., 08012345678)
                      </p>
                    </div>

                    <Button
                      onClick={handleCustomerSubmit}
                      disabled={!formData.customer?.name || !formData.customer?.phone}
                      className="w-full h-12 text-base font-bold shadow-md hover:shadow-glow transition-smooth mt-2"
                    >
                      Continue
                    </Button>
                  </div>
                )}

                {/* Cashier Information */}
                {paymentStep === 'order' && (
                  <div className="space-y-3 md:space-y-4">
                    {/* Transaction Summary */}
                    <div className="bg-secondary/50 rounded-xl p-4 md:p-5 space-y-3 border border-border shadow-sm">
                      <p className="text-sm md:text-base font-bold text-muted-foreground uppercase">
                        Summary
                      </p>
                      <div className="space-y-2 text-sm md:text-base">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-semibold">Items</span>
                          <span className="font-bold text-foreground">{activeCart?.items.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-semibold">Payment</span>
                          <span className="font-bold text-foreground capitalize">{formData.paymentMethod}</span>
                        </div>
                        {formData.customer && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-semibold">Customer</span>
                            <span className="font-bold text-foreground truncate ml-2">{formData.customer.name}</span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-border flex justify-between items-center">
                          <span className="font-bold text-base md:text-lg text-foreground">Total</span>
                          <span className="font-bold text-xl md:text-2xl text-primary">
                            ₦{activeCart?.total.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleFinalSubmit}
                      disabled={isCompletingSale}
                      className="w-full h-12 md:h-14 text-base md:text-lg font-bold shadow-md hover:shadow-glow transition-smooth"
                    >
                      {isCompletingSale ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2.5" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 md:w-6 md:h-6 mr-2.5" />
                          Complete Sale
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Dialog */}
      <Dialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-elegant rounded-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-foreground text-xl md:text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-warning" />
              Clear Cart?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <p className="text-muted-foreground text-sm md:text-base">
              Are you sure you want to clear the cart? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowClearCartDialog(false)}
                className="flex-1 h-11 font-semibold transition-smooth shadow-sm hover:shadow-md"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  clearCart();
                  setShowClearCartDialog(false);
                }}
                className="flex-1 h-11 font-semibold transition-smooth shadow-md hover:shadow-lg"
              >
                Yes, Clear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Cart;
