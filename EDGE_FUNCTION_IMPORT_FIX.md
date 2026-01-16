# Fix for Edge Function Import Error

## The Problem

When deploying the Edge Function, you get this error:
```
Relative import path "@supabase/supabase-js" not prefixed with / or ./ or ../
```

## The Solution

**You MUST use the `npm:` prefix for npm packages in Deno/Supabase Edge Functions.**

### ❌ WRONG (will cause deployment error):
```typescript
import { createClient } from '@supabase/supabase-js';
```

### ✅ CORRECT (will deploy successfully):
```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';
```

## Why This Happens

Supabase Edge Functions run on **Deno**, not Node.js. Deno requires:
- `npm:` prefix for npm packages
- `jsr:` prefix for JSR packages  
- Full URLs for other packages (like `https://esm.sh/...`)

Bare module specifiers like `@supabase/supabase-js` are **not supported** in Deno.

## Current Status

The file `supabase/functions/wix-payments/index.ts` already has the correct import on **line 4**:
```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';
```

## If You Still Get the Error

1. **Check the file in Supabase Dashboard:**
   - Go to Edge Functions → `wix-payments` → Edit
   - Verify line 4 (or the import line) shows: `import { createClient } from 'npm:@supabase/supabase-js@2';`
   - If it shows `@supabase/supabase-js` without `npm:`, change it back

2. **Copy the entire file from your local version:**
   - The local file at `supabase/functions/wix-payments/index.ts` has the correct import
   - Copy all the code and paste it into the Supabase Dashboard editor

3. **Remove any deno.d.ts references:**
   - The `deno.d.ts` file is optional and not needed
   - Remove any `/// <reference path="./deno.d.ts" />` lines if present

## Verification

Before deploying, verify the import line looks exactly like this:
```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';
```

**Key points:**
- ✅ Starts with `npm:`
- ✅ Has `@supabase/supabase-js@2`
- ✅ No quotes around the package name after `npm:`
- ✅ Includes version `@2`

## Alternative: Using import_map.json

If you prefer, you can also use an `import_map.json` file, but the `npm:` prefix is simpler and recommended for Supabase Edge Functions.
