-- NebenkostenAI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bills table
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT DEFAULT 'uploaded', -- uploaded, verifying, analyzing, completed
  extracted_data JSONB,
  verified_data JSONB,
  analysis_result JSONB,
  total_errors INTEGER DEFAULT 0,
  estimated_refund DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending', -- pending, paid
  payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Line items table
CREATE TABLE line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2),
  unit TEXT,
  cost_per_unit DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  category TEXT,
  score TEXT, -- green, yellow, red
  error_type TEXT, -- formal_error, outlier, none
  error_details TEXT,
  benchmark_low DECIMAL(10,2),
  benchmark_high DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_payment_status ON bills(payment_status);
CREATE INDEX idx_line_items_bill_id ON line_items(bill_id);

-- Enable Row Level Security
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;

-- Create policies for bills
CREATE POLICY "Allow anonymous insert" ON bills
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public read" ON bills
  FOR SELECT USING (true);

CREATE POLICY "Allow public update" ON bills
  FOR UPDATE USING (true) WITH CHECK (true);

-- Create policies for line_items
CREATE POLICY "Allow anonymous insert" ON line_items
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public read" ON line_items
  FOR SELECT USING (true);

CREATE POLICY "Allow public update" ON line_items
  FOR UPDATE USING (true) WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
