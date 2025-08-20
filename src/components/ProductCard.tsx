import React from 'react';
import { Plus, Package, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onEdit?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit }) => {
  const { state, addItem } = useCart();
  const { updateProductQuantity } = useProducts();
  
  // Check if product is in cart and get quantity
  const cartItem = state.items.find(item => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;
  
  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 5;
  const stockLeft = product.quantity - quantityInCart;

  return (
    <div className={cn(
      "bg-gradient-card border border-border rounded-xl p-4 transition-smooth hover:shadow-lg hover:border-primary/20",
      isOutOfStock && "opacity-60"
    )}>
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
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          
          {onEdit && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              className="flex-shrink-0 ml-2"
            >
              <Minus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">₦{product.price.toLocaleString()}</p>
            <div className="flex items-center space-x-2">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                isOutOfStock 
                  ? "bg-destructive/10 text-destructive"
                  : isLowStock 
                    ? "bg-warning/10 text-warning"
                    : "bg-success/10 text-success"
              )}>
                {isOutOfStock ? 'Out of Stock' : `${product.quantity} in stock`}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="flex items-center space-x-2">
            {quantityInCart > 0 && (
              <div className="bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg">
                <span className="text-sm font-medium text-primary">{quantityInCart}</span>
              </div>
            )}
            
            <Button
              variant={quantityInCart > 0 ? "success" : "default"}
              size="icon"
              onClick={() => {
        const canAdd = addItem(product, product.quantity);
        // Don't update product quantity here - only when checking out
              }}
              disabled={stockLeft <= 0}
              className={cn(
                quantityInCart > 0 && "pulse-success"
              )}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;