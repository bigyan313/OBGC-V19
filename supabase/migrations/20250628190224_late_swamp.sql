/*
  # Create clicks tracking tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique) - Solana wallet address
      - `total_clicks` (bigint) - Total clicks for this user
      - `last_click_timestamp` (timestamp) - Last time user clicked
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `click_batches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `wallet_address` (text) - For easy querying
      - `clicks_count` (integer) - Number of clicks in this batch
      - `transaction_signature` (text, optional) - Solana transaction signature if submitted to blockchain
      - `created_at` (timestamp)
    
    - `global_stats`
      - `id` (uuid, primary key)
      - `total_clicks` (bigint) - Global total clicks
      - `total_users` (bigint) - Total unique users
      - `last_updated` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for public read access to leaderboard data
    - Add policies for global stats access

  3. Functions
    - Function to update global stats when clicks are added
    - Function to get leaderboard data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  total_clicks bigint DEFAULT 0,
  last_click_timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create click_batches table
CREATE TABLE IF NOT EXISTS click_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  clicks_count integer NOT NULL DEFAULT 0,
  transaction_signature text,
  created_at timestamptz DEFAULT now()
);

-- Create global_stats table
CREATE TABLE IF NOT EXISTS global_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_clicks bigint DEFAULT 0,
  total_users bigint DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Insert initial global stats record
INSERT INTO global_stats (total_clicks, total_users, last_updated)
VALUES (0, 0, now())
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = wallet_address OR true); -- Allow reading for leaderboard

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = wallet_address);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = wallet_address)
  WITH CHECK (auth.uid()::text = wallet_address);

-- Allow anonymous read access for leaderboard
CREATE POLICY "Anonymous users can read leaderboard"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for click_batches table
CREATE POLICY "Users can read own batches"
  ON click_batches
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = wallet_address);

CREATE POLICY "Users can insert own batches"
  ON click_batches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = wallet_address);

-- Allow anonymous read access for transparency
CREATE POLICY "Anonymous users can read all batches"
  ON click_batches
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for global_stats table
CREATE POLICY "Everyone can read global stats"
  ON global_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can update global stats"
  ON global_stats
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_total_clicks ON users(total_clicks DESC);
CREATE INDEX IF NOT EXISTS idx_click_batches_user_id ON click_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_click_batches_wallet_address ON click_batches(wallet_address);
CREATE INDEX IF NOT EXISTS idx_click_batches_created_at ON click_batches(created_at DESC);

-- Function to update global stats
CREATE OR REPLACE FUNCTION update_global_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE global_stats 
  SET 
    total_clicks = (SELECT COALESCE(SUM(total_clicks), 0) FROM users),
    total_users = (SELECT COUNT(DISTINCT id) FROM users),
    last_updated = now()
  WHERE id = (SELECT id FROM global_stats LIMIT 1);
END;
$$;

-- Function to add clicks for a user
CREATE OR REPLACE FUNCTION add_user_clicks(
  p_wallet_address text,
  p_clicks_count integer,
  p_transaction_signature text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_batch_id uuid;
  v_result json;
BEGIN
  -- Insert or update user
  INSERT INTO users (wallet_address, total_clicks, last_click_timestamp, updated_at)
  VALUES (p_wallet_address, p_clicks_count, now(), now())
  ON CONFLICT (wallet_address) 
  DO UPDATE SET 
    total_clicks = users.total_clicks + p_clicks_count,
    last_click_timestamp = now(),
    updated_at = now()
  RETURNING id INTO v_user_id;

  -- If user wasn't found (shouldn't happen with upsert), get the ID
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM users WHERE wallet_address = p_wallet_address;
  END IF;

  -- Insert click batch record
  INSERT INTO click_batches (user_id, wallet_address, clicks_count, transaction_signature)
  VALUES (v_user_id, p_wallet_address, p_clicks_count, p_transaction_signature)
  RETURNING id INTO v_batch_id;

  -- Update global stats
  PERFORM update_global_stats();

  -- Return result
  SELECT json_build_object(
    'success', true,
    'user_id', v_user_id,
    'batch_id', v_batch_id,
    'total_clicks', (SELECT total_clicks FROM users WHERE id = v_user_id)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(p_limit integer DEFAULT 10)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'address', wallet_address,
      'clicks', total_clicks,
      'rank', row_number() OVER (ORDER BY total_clicks DESC)
    )
  )
  INTO v_result
  FROM (
    SELECT wallet_address, total_clicks
    FROM users
    WHERE total_clicks > 0
    ORDER BY total_clicks DESC
    LIMIT p_limit
  ) ranked_users;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Function to get user rank
CREATE OR REPLACE FUNCTION get_user_rank(p_wallet_address text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  WITH ranked_users AS (
    SELECT 
      wallet_address,
      total_clicks,
      row_number() OVER (ORDER BY total_clicks DESC) as rank
    FROM users
    WHERE total_clicks > 0
  )
  SELECT json_build_object(
    'address', wallet_address,
    'clicks', total_clicks,
    'rank', rank
  )
  INTO v_result
  FROM ranked_users
  WHERE wallet_address = p_wallet_address;

  RETURN COALESCE(v_result, json_build_object('rank', null, 'clicks', 0));
END;
$$;