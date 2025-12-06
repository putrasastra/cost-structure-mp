import { supabase } from '../lib/supabase';
import { Company } from '../types';

export const companyService = {
  async getCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Company[];
  },

  async getCompanyById(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Company;
  },

  async createCompany(company: Omit<Company, 'id' | 'created_at' | 'user_id'>) {
    // For now, we'll assume a default user_id or handle it via RLS/Auth later.
    // Since we are in development mode with permissive policies, we might need to mock user_id if the table requires it.
    // The schema says user_id REFERENCES users(id).
    // If we don't have a logged-in user, this might fail if we don't provide a valid user_id.
    // However, for the initial "Add Company" flow without full auth, we might need to relax the constraint or create a dummy user.
    
    // Let's check if we have a user.
    const { data: { user } } = await supabase.auth.getUser();
    
    let userId = user?.id;

    // If no user is logged in (development mode), we might need to create a dummy user or fetch one.
    if (!userId) {
       // Try to find a default user or create one if not exists
       const { data: users } = await supabase.from('users').select('id').limit(1);
       if (users && users.length > 0) {
         userId = users[0].id;
       } else {
         // Create a dummy user for dev
         const { data: newUser, error: userError } = await supabase.from('users').insert({
           email: 'dev@example.com',
           role: 'admin'
         }).select().single();
         
         if (userError) {
             console.error("Error creating dummy user:", userError);
             // Fallback to a random UUID if we can't create a user (might fail FK constraint)
         } else {
             userId = newUser.id;
         }
       }
    }

    const { data, error } = await supabase
      .from('companies')
      .insert([{ ...company, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
  },

  async updateCompany(id: string, updates: Partial<Company>) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
  },

  async deleteCompany(id: string) {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
