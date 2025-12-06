-- Add 'business' to allowed income_types in personal_tax_records
ALTER TABLE personal_tax_records DROP CONSTRAINT IF EXISTS personal_tax_records_income_type_check;
ALTER TABLE personal_tax_records ADD CONSTRAINT personal_tax_records_income_type_check 
  CHECK (income_type IN ('salary', 'dividend', 'fee', 'business', 'other'));

-- Create Personal Assets Table
CREATE TABLE IF NOT EXISTS personal_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  profile_id UUID REFERENCES tax_profiles(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  acquisition_year INTEGER NOT NULL,
  acquisition_price NUMERIC NOT NULL,
  year INTEGER NOT NULL, -- Tax Year this asset is reported for
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Personal Liabilities Table
CREATE TABLE IF NOT EXISTS personal_liabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  profile_id UUID REFERENCES tax_profiles(id) ON DELETE CASCADE,
  lender_name TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  year INTEGER NOT NULL, -- Tax Year this liability is reported for
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Assets
ALTER TABLE personal_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assets"
  ON personal_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
  ON personal_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON personal_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON personal_assets FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON personal_assets TO authenticated;
GRANT SELECT ON personal_assets TO anon;

-- RLS for Liabilities
ALTER TABLE personal_liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own liabilities"
  ON personal_liabilities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liabilities"
  ON personal_liabilities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own liabilities"
  ON personal_liabilities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liabilities"
  ON personal_liabilities FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON personal_liabilities TO authenticated;
GRANT SELECT ON personal_liabilities TO anon;
