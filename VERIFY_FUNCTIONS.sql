-- Verify function definitions and return types
-- Run this to check if functions were updated correctly

-- Check function signatures
SELECT 
    p.proname AS function_name,
    pg_get_function_result(p.oid) AS return_type,
    pg_get_function_arguments(p.oid) AS arguments,
    p.provolatile AS volatility -- 'i'=IMMUTABLE, 's'=STABLE, 'v'=VOLATILE
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_team_member', 'get_team_member_count')
ORDER BY p.proname;

