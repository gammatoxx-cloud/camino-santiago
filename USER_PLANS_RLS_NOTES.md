# User Plans RLS (Row Level Security) Notes

## Overview
This document explains how the user plans SQL functions interact with RLS policies and ensures they work correctly.

## RLS Policies on Profiles Table

The `profiles` table has the following RLS policies:
- **SELECT**: Users can view their own profile and team member profiles
- **UPDATE**: Users can only update their own profile (`auth.uid() = id`)
- **INSERT**: Users can only insert their own profile

## SQL Files and RLS Considerations

### 1. USER_PLANS_SETUP.sql

**Operations:**
- `ALTER TABLE` - Adds `user_plan` column (not affected by RLS)
- `UPDATE profiles` - Sets default plan for existing users

**RLS Impact:**
- The `UPDATE` statement will be **blocked by RLS** if run as a regular authenticated user
- **Solution**: Run this script as the **service role** in Supabase SQL Editor
- The service role bypasses all RLS policies

**Recommendation:**
- Always run migrations like this as the service role
- The script includes a note about this requirement

### 2. ADMIN_UPDATE_USER_PLAN_FUNCTION.sql

**Function Security:**
- Uses `SECURITY DEFINER` which bypasses RLS policies
- Runs with the privileges of the function owner (typically postgres/service role)
- Includes admin email verification to ensure only the admin can use it

**RLS Bypass:**
- The `UPDATE profiles` statement inside the function **bypasses RLS** because:
  1. Function is marked `SECURITY DEFINER`
  2. Function runs with owner's privileges (service role)
  3. Service role has full access, bypassing RLS

**Verification:**
- Function checks that the caller is the admin user
- Only then does it perform the UPDATE
- This ensures security while bypassing RLS

### 3. ADMIN_GET_ALL_PROFILES_FUNCTION.sql (Updated)

**Changes Made:**
- Added `user_plan` to the return type
- Added `user_plan` to the SELECT statement
- Uses `COALESCE` to default to 'gratis' if NULL

**RLS Bypass:**
- Uses `SECURITY DEFINER` to bypass RLS
- Returns all profiles regardless of RLS policies
- Admin verification ensures only admin can call it

## How SECURITY DEFINER Works

When a function is marked `SECURITY DEFINER`:
1. It runs with the privileges of the function owner (not the caller)
2. RLS policies are bypassed for operations inside the function
3. The function can access any data the owner can access
4. This is why admin functions use this pattern

## Testing Recommendations

1. **Test as Admin:**
   - Verify admin can update any user's plan
   - Verify admin can see all profiles with plan information

2. **Test as Regular User:**
   - Verify regular users cannot call admin functions
   - Verify regular users can only update their own profile (existing RLS)

3. **Test Migration:**
   - Run `USER_PLANS_SETUP.sql` as service role
   - Verify all existing profiles get `user_plan = 'gratis'`

## Security Notes

- Admin functions verify the caller's email before executing
- Only the specified admin email can use these functions
- Regular users cannot bypass RLS through these functions
- The `SET search_path = public` prevents search path attacks

## Summary

✅ **All SQL functions are RLS-safe:**
- `USER_PLANS_SETUP.sql` - Run as service role (bypasses RLS)
- `ADMIN_UPDATE_USER_PLAN_FUNCTION.sql` - Uses SECURITY DEFINER (bypasses RLS)
- `ADMIN_GET_ALL_PROFILES_FUNCTION.sql` - Uses SECURITY DEFINER (bypasses RLS)

The functions follow the same pattern as existing admin functions in the codebase and will work correctly with RLS enabled.
