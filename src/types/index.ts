export type UserRole = 'admin' | 'finance' | 'auditor' | 'individual';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  npwp: string;
  is_pkp: boolean;
  business_type?: string;
  address?: string;
  tax_settings?: Record<string, unknown>;
  created_at: string;
}

export type TransactionType = 'input' | 'output';

export interface PpnTransaction {
  id: string;
  company_id: string;
  transaction_type: TransactionType;
  invoice_number: string;
  transaction_date: string;
  dpp_amount: number;
  ppn_amount: number;
  counterparty_name?: string;
  tax_period: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type PphType = '21' | '22' | '23' | '25' | 'final';

export interface PphTransaction {
  id: string;
  company_id: string;
  pph_type: PphType;
  tax_period: string;
  tax_base: number;
  tax_rate: number;
  tax_amount: number;
  employee_name?: string;
  document_number?: string;
  created_at: string;
}

export interface TaxReport {
  id: string;
  company_id: string;
  report_type: string;
  period: string;
  report_data: unknown;
  file_url?: string;
  generated_at: string;
}

export interface PersonalIncome {
  id: string;
  user_id: string;
  date: string;
  source: string;
  gross_amount: number;
  tax_deducted: number;
  description?: string;
  created_at: string;
}

export type PTKPStatus = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';

export interface PersonalTaxProfile {
  id: string;
  user_id: string;
  npwp: string;
  ptkp_status: PTKPStatus;
  dependents: number;
  created_at: string;
}

export interface PersonalAsset {
  id: string;
  profile_id: string;
  asset_name: string;
  acquisition_year: number;
  acquisition_price: number;
  year: number;
  description?: string;
  created_at: string;
}

export interface PersonalLiability {
  id: string;
  profile_id: string;
  lender_name: string;
  start_year: number;
  amount: number;
  year: number;
  description?: string;
  created_at: string;
}

