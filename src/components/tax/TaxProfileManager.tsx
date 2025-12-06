import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit2, Search, X, User, Save, Database, AlertCircle, Copy, Check, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface TaxProfile {
  id: string;
  name: string;
  npwp?: string;
  address?: string;
  contact?: string;
}

interface TaxProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSelect?: (profileId: string) => void;
}

const MIGRATION_SQL = `
-- Create tax_profiles table
create table if not exists tax_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  npwp text,
  address text,
  contact text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table tax_profiles enable row level security;

-- Create Policies
create policy "Users can view their own tax profiles"
  on tax_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tax profiles"
  on tax_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tax profiles"
  on tax_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tax profiles"
  on tax_profiles for delete
  using (auth.uid() = user_id);

-- Add profile_id to personal_tax_records
alter table personal_tax_records 
add column if not exists profile_id uuid references tax_profiles(id);
`;

export function TaxProfileManager({ isOpen, onClose, onProfileSelect }: TaxProfileManagerProps) {
  const [profiles, setProfiles] = useState<TaxProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [dbError, setDbError] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaxProfile>();

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  const loadProfiles = async () => {
    setIsLoading(true);
    setDbError(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Don't load profiles if not logged in, just stop loading
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('tax_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading profiles:', error);
        // Detect missing table error (42P01 is Postgres code for undefined_table)
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setDbError(true);
        }
        return;
      }
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data: TaxProfile) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const confirmLogin = confirm('Anda harus login terlebih dahulu untuk menyimpan profil. Ingin login sekarang?');
        if (confirmLogin) {
          onClose();
          navigate('/login');
        }
        return;
      }

      let error;
      if (editingId) {
        const result = await supabase
          .from('tax_profiles')
          .update({
            name: data.name,
            npwp: data.npwp,
            address: data.address,
            contact: data.contact,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);
        error = result.error;
      } else {
        const result = await supabase
          .from('tax_profiles')
          .insert({
            user_id: user.id,
            name: data.name,
            npwp: data.npwp,
            address: data.address,
            contact: data.contact,
          });
        error = result.error;
      }

      if (error) {
        console.error('Supabase Error:', error);
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
            setDbError(true);
            alert('Tabel database belum siap. Silakan klik "Perbaiki Database".');
        } else {
            throw new Error(error.message || 'Database error');
        }
        return;
      }

      reset();
      setEditingId(null);
      setView('list');
      loadProfiles();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(`Gagal menyimpan profil: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (profile: TaxProfile) => {
    setEditingId(profile.id);
    setValue('name', profile.name);
    setValue('npwp', profile.npwp);
    setValue('address', profile.address);
    setValue('contact', profile.contact);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus profil ini?')) return;
    
    try {
      const { error } = await supabase.from('tax_profiles').delete().eq('id', id);
      if (error) throw error;
      loadProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Gagal menghapus profil');
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.npwp && p.npwp.includes(searchQuery))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Manajemen Profil Wajib Pajak
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            {dbError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Database Belum Dikonfigurasi</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Tabel `tax_profiles` belum ditemukan di Supabase. Anda perlu membuatnya.</p>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setShowSql(!showSql)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {showSql ? 'Sembunyikan SQL' : 'Perbaiki Database (Lihat SQL)'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showSql && (
              <div className="mb-4 bg-slate-900 rounded-md p-4 overflow-hidden relative">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">SQL Query (Run in Supabase Dashboard)</span>
                    <button 
                        onClick={copyToClipboard}
                        className="text-slate-400 hover:text-white flex items-center text-xs"
                    >
                        {copied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copied ? 'Tersalin!' : 'Salin'}
                    </button>
                 </div>
                 <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {MIGRATION_SQL}
                 </pre>
                 <div className="mt-2 text-xs text-slate-500">
                    <p>1. Buka Dashboard Supabase Project Anda.</p>
                    <p>2. Masuk ke menu "SQL Editor".</p>
                    <p>3. Paste kode di atas dan klik "Run".</p>
                 </div>
              </div>
            )}

            {view === 'list' ? (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Cari nama atau NPWP..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => {
                      reset();
                      setEditingId(null);
                      setView('form');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah
                  </button>
                </div>

                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nama</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">NPWP</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredProfiles.map((profile) => (
                        <tr key={profile.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {profile.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {profile.npwp || '-'}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleEdit(profile)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(profile.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredProfiles.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-10 text-center text-gray-500 text-sm">
                            {dbError ? 'Database belum siap.' : 'Tidak ada profil ditemukan.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Nama wajib diisi' })}
                    className={cn(
                      "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50",
                      errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                    placeholder="Nama Wajib Pajak"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">NPWP</label>
                  <input
                    type="text"
                    {...register('npwp')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    placeholder="XX.XXX.XXX.X-XXX.XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Alamat</label>
                  <textarea
                    {...register('address')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    placeholder="Alamat lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Kontak (Email/HP)</label>
                  <input
                    type="text"
                    {...register('contact')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    placeholder="Email atau Nomor HP"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
