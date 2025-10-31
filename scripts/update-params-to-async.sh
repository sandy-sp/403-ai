#!/bin/bash

# Script to update all API route params to async (Promise) for Next.js 16

# Find all route files with params
find app/api -name "route.ts" -type f | while read file; do
  # Check if file contains params pattern
  if grep -q "{ params }: { params: { id: string } }" "$file"; then
    echo "Updating $file..."
    
    # Replace the params type
    sed -i 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"
    
    # Add await params before first params.id usage in each function
    # This is a simplified approach - manual review recommended
    echo "  - Updated params type to Promise"
  fi
done

echo "Done! Please review the changes and add 'const { id } = await params;' where needed."
