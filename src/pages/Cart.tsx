import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, X, PlusCircle } from 'lucide-react';
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

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { carts, activeCart, activeCartId, removeItem, updateQuantity, clearCart, createNewCart, switchToCart, closeCart } = useCart();
  const { addTransaction, updateProductQuantity, products } = useProducts();
  const { toast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'customer' | 'cashier'>('method');
  const [isCompletingSale, setIsCompletingSale] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    paymentMethod: 'cash',
    cashierName: '',
    customer: undefined
  });

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
      setPaymentStep('cashier');
    }
  };

  const handleCustomerSubmit = () => {
    setPaymentStep('cashier');
  };

  const handleFinalSubmit = async () => {
    if (!activeCart || !activeCartId) return;
    
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
  };

  if (!activeCart || activeCart.items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
            <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add products to start a new transaction</p>
            <Button variant="default" onClick={() => navigate("/")}>
              Browse Products
            </Button>
          </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Cart Tabs */}
          <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {carts.map((cart) => (
                <button
                  key={cart.id}
                  onClick={() => switchToCart(cart.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all min-w-[140px]",
                    cart.id === activeCartId
                      ? "bg-gradient-primary text-primary-foreground shadow-md"
                      : "bg-muted/30 text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm truncate">{cart.name}</p>
                    <p className="text-xs opacity-80">{cart.items.length} items</p>
                  </div>
                  {carts.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseCart(cart.id);
                      }}
                      className="p-1 hover:bg-black/10 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </button>
              ))}
              
              {carts.length < 10 && (
                <button
                  onClick={handleCreateNewCart}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 text-foreground transition-all min-w-[120px]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">New Cart</span>
                </button>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{activeCart?.name || 'Shopping Cart'}</h1>
              <p className="text-muted-foreground">{activeCart?.items.length || 0} items</p>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={clearCart}
              className="hover:scale-105"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>

          {/* Cart Items */}
          <div className="space-y-3">
          {activeCart?.items.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-card border border-border rounded-xl p-4 transition-smooth hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <p className="text-lg font-bold text-primary">₦{item.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 bg-muted/30 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <span className="w-8 text-center font-medium text-foreground">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={(() => {
                        const product = products.find(p => p.id === item.productId);
                        return !product || item.quantity >= product.quantity;
                      })()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Remove Item */}
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Item Total */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

          {/* Total Summary */}
          <div className="bg-gradient-card border border-border rounded-xl p-6 sticky bottom-24">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-foreground">Total Amount</span>
              <span className="font-bold text-2xl text-primary">
                ₦{activeCart?.total.toLocaleString() || 0}
              </span>
            </div>

            <Dialog open={showPaymentModal} onOpenChange={(open) => {
              setShowPaymentModal(open);
              if (!open) resetModal();
            }}>
              <DialogTrigger asChild>
                <Button variant="premium" size="lg" className="w-full shadow-glow">
                  <CreditCard className="w-5 h-5" />
                  Complete Sale
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {paymentStep === 'method' && 'Payment Method'}
                    {paymentStep === 'customer' && 'Customer Information'}
                    {paymentStep === 'cashier' && 'Cashier Information'}
                  </DialogTitle>
                </DialogHeader>

                {/* Payment Method Selection */}
                {paymentStep === 'method' && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div 
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.paymentMethod === 'cash' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => handlePaymentMethodSelect('cash')}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === 'cash' 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {formData.paymentMethod === 'cash' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Cash</p>
                          <p className="text-sm text-muted-foreground">Physical cash payment</p>
                        </div>
                      </div>

                      <div 
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.paymentMethod === 'pos' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => handlePaymentMethodSelect('pos')}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === 'pos' 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {formData.paymentMethod === 'pos' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">POS</p>
                          <p className="text-sm text-muted-foreground">Card payment via POS terminal</p>
                        </div>
                      </div>

                      <div 
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.paymentMethod === 'transfer' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => handlePaymentMethodSelect('transfer')}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === 'transfer' 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {formData.paymentMethod === 'transfer' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Bank Transfer</p>
                          <p className="text-sm text-muted-foreground">Mobile/online bank transfer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Information */}
                {paymentStep === 'customer' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customerName" className="text-foreground">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={formData.customer?.name || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          customer: { ...prev.customer, name: e.target.value, phone: prev.customer?.phone || '' }
                        }))}
                        placeholder="Enter customer name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customerPhone" className="text-foreground">Phone Number</Label>
                      <Input
                        id="customerPhone"
                        value={formData.customer?.phone || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          customer: { ...prev.customer, name: prev.customer?.name || '', phone: e.target.value }
                        }))}
                        placeholder="080XXXXXXXX"
                        className="mt-1"
                      />
                    </div>

                    <Button 
                      onClick={handleCustomerSubmit}
                      className="w-full"
                      disabled={!formData.customer?.name || !formData.customer?.phone}
                    >
                      Continue
                    </Button>
                  </div>
                )}

                {/* Cashier Information */}
                {paymentStep === 'cashier' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cashierName" className="text-foreground">Cashier Name</Label>
                      <Input
                        id="cashierName"
                        value={formData.cashierName}
                        onChange={(e) => setFormData(prev => ({ ...prev, cashierName: e.target.value }))}
                        placeholder="Enter cashier name"
                        className="mt-1"
                      />
                    </div>

                    <div className="bg-muted/30 p-3 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Transaction Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span className="text-foreground capitalize">{formData.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-semibold text-primary">₦{activeCart?.total.toLocaleString() || 0}</span>
                        </div>
                        {formData.customer && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Customer:</span>
                              <span className="text-foreground">{formData.customer.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="text-foreground">{formData.customer.phone}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Button 
                      onClick={handleFinalSubmit}
                      variant="success"
                      className="w-full"
                      disabled={!formData.cashierName || isCompletingSale}
                    >
                      {isCompletingSale ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        'Complete Sale'
                      )}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default Cart;