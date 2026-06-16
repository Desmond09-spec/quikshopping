import React from 'react';
import { Search, X, ScanBarcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onScan?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search products...",
  onScan
}) => {
  return (
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => onChange('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {onScan && (
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 flex-shrink-0"
          onClick={onScan}
        >
          <ScanBarcode className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;