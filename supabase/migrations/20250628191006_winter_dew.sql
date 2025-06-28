/*
  # Fix get_leaderboard RPC function

  1. Function Updates
    - Drop and recreate the `get_leaderboard` function
    - Fix the SQL structure to avoid mixing aggregate and window functions
    - Return proper leaderboard data with rankings

  2. Function Details
    - Takes a limit parameter to control number of results
    - Returns wallet address, total clicks, and rank
    - Orders by total clicks descending
    - Uses proper window function syntax
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_leaderboard(integer);

-- Create the corrected get_leaderboard function
CREATE OR REPLACE FUNCTION get_leaderboard(p_limit integer DEFAULT 10)
RETURNS TABLE(
  address text,
  clicks bigint,
  rank bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.wallet_address as address,
    u.total_clicks as clicks,
    ROW_NUMBER() OVER (ORDER BY u.total_clicks DESC, u.created_at ASC) as rank
  FROM users u
  WHERE u.total_clicks > 0
  ORDER BY u.total_clicks DESC, u.created_at ASC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_leaderboard(integer) TO anon;
GRANT EXECUTE ON FUNCTION get_leaderboard(integer) TO authenticated;