import { supabase } from '../lib/supabase';
import { PpnTransaction, PphTransaction, PersonalIncome } from '../types';

export const transactionService = {
  // PPN Transactions
  async createPpnTransaction(transaction: Omit<PpnTransaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('ppn_transactions')
      .insert([transaction])
      .select()
      .single();
    
    if (error) throw error;
    return data as PpnTransaction;
  },

  async getPpnTransactions(companyId?: string) {
    let query = supabase
      .from('ppn_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });
    
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as PpnTransaction[];
  },

  // PPh Transactions
  async createPphTransaction(transaction: Omit<PphTransaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('pph_transactions')
      .insert([transaction])
      .select()
      .single();
    
    if (error) throw error;
    return data as PphTransaction;
  },

  async getPphTransactions(companyId?: string) {
    let query = supabase
      .from('pph_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as PphTransaction[];
  },

  // Personal Tax Transactions
  async getPersonalTaxTransactions(userId?: string, profileId?: string) {
    let query = supabase
      .from('personal_tax_records')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (profileId) {
      query = query.eq('profile_id', profileId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Map DB columns to PersonalIncome type
    return data.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      date: item.transaction_date,
      source: item.income_type,
      gross_amount: item.gross_amount,
      tax_deducted: item.tax_withheld,
      description: item.source_description,
      created_at: item.created_at
    })) as PersonalIncome[];
  }
};
