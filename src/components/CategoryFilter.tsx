import React from 'react';
import { Button } from '@/components/ui/button';
import { ProductCategory } from '@/types';
import { useProducts } from '@/contexts/SupabaseProductContext';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  const { categories } = useProducts();
  
  // Sort categories with 'Other' at the end
  const sortedCategories = [...categories.map(cat => cat.name as ProductCategory)].sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });
  
  const displayCategories: ProductCategory[] = ['All', ...sortedCategories];

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-2 px-4">
        {displayCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className={cn(
              "whitespace-nowrap flex-shrink-0",
              selectedCategory === category 
                ? "shadow-glow" 
                : "hover:border-primary/50"
            )}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;