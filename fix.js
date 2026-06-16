const fs = require('fs');
let content = fs.readFileSync('src/contexts/SupabaseProductContext.tsx', 'utf8');

// 1. Add import
if (!content.includes('useStore')) {
  content = content.replace(
    /import \{ useAuth \} from '\.\/SupabaseAuthContext';/,
    "import { useAuth } from './SupabaseAuthContext';\nimport { useStore } from './StoreContext';"
  );
}

// 2. Add useStore hook
if (!content.includes('const { activeStore } = useStore();')) {
  content = content.replace(
    /const \{ user, loading: authLoading \} = useAuth\(\);/,
    "const { user, loading: authLoading } = useAuth();\n  const { activeStore } = useStore();"
  );
}

// 3. Update useEffect dependencies
content = content.replace(/\[user, authLoading\]/g, "[user, authLoading, activeStore?.id]");

// 4. Update early returns
content = content.replace(/if \(!user\) return;/g, "if (!user || !activeStore?.id) return;");

// 5. Update inserts
content = content.replace(/user_id: user\.id,/g, "user_id: user.id,\n          store_id: activeStore?.id,");

// 6. Update queries
content = content.replace(/\.eq\('user_id', user\.id\)/g, ".eq('user_id', user.id)\n        .eq('store_id', activeStore?.id)");

// 7. Fix `isSyncing` errors by adding isSyncing: false to state resets
content = content.replace(/productsLoading: false\n\s+\}\);/g, "productsLoading: false,\n        isSyncing: false\n      });");

fs.writeFileSync('src/contexts/SupabaseProductContext.tsx', content);
console.log('Fixed SupabaseProductContext scoping');
