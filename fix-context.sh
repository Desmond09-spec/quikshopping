#!/bin/bash

# This script applies surgical fixes to SupabaseProductContext.tsx

FILE="src/contexts/SupabaseProductContext.tsx"

# Backup the file
cp "$FILE" "$FILE.backup"

# Fix 1: Add barcode field to loadProducts transformation (after line 276)
# Find the line with "description: prod.description || ''" and add barcode after it
sed -i "/description: prod.description || ''/a\\        barcode: prod.barcode || ''" "$FILE"

# Fix 2: Add barcode field to addProduct INSERT
# Find the line with "description: product.description" in the INSERT and add barcode after it
sed -i "/description: product.description$/a\\          barcode: product.barcode" "$FILE"

# Fix 3: Add barcode field to addProduct transformation (replace temp product)
# Find the line with "description: data.description || ''" in the product map and add barcode after it
# This is in the section where we replace the temp product with the real one
sed -i "/{/,/}/s/description: data.description || ''/&,\\n                barcode: data.barcode || ''/g" "$FILE"

echo "Fixes applied successfully. Backup saved as $FILE.backup"
echo "Please test the changes and revert with: mv $FILE.backup $FILE if needed"
