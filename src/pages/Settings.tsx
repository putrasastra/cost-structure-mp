import { useState, useEffect } from 'react';
import { User, Lock, Database, LogOut, Save, AlertCircle, Check, Copy, Users, Download, FileJson, RefreshCcw, Trash2, Edit, Search, ChevronLeft, ChevronRight, X, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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

-- Refresh Schema Cache
NOTIFY pgrst, 'reload config';
`;

const ITEMS_PER_PAGE = 5;

export function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // DB Tool State
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'backup' | 'database'>('profile');

  // User Management State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    let subscription: any;

    if (activeTab === 'users') {
      fetchUsers();

      // Subscribe to realtime changes
      subscription = supabase
        .channel('public:users')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
          fetchUsers();
        })
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [activeTab]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsersList(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Password tidak cocok', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'Password minimal 6 karakter', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ text: 'Password berhasil diubah', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const tables = [
        'companies', 
        'tax_profiles', 
        'personal_tax_records', 
        'personal_assets', 
        'personal_liabilities',
        'ppn_transactions',
        'pph_transactions'
      ];
      
      const backupData: Record<string, any> = {};

      for (const table of tables) {
        const { data } = await supabase.from(table).select('*');
        backupData[table] = data || [];
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taxplanner_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ text: 'Backup data berhasil didownload', type: 'success' });
    } catch (error) {
      console.error('Backup failed:', error);
      setMessage({ text: 'Gagal melakukan backup data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // User Management Handlers
  const confirmDelete = (user: any) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: userToDelete.id });
      if (error) throw error;
      setMessage({ text: 'User berhasil dihapus', type: 'success' });
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      setMessage({ text: 'Gagal menghapus user: ' + error.message, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const openRoleModal = (user: any) => {
    setEditingUser(user);
    setNewRole(user.role || 'individual');
    setShowRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    setIsUpdatingRole(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', editingUser.id);
      if (error) throw error;
      setMessage({ text: 'Role user berhasil diperbarui', type: 'success' });
      setShowRoleModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      setMessage({ text: 'Gagal update role: ' + error.message, type: 'error' });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Filter and Pagination
  const filteredUsers = usersList.filter(u => 
    (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (u.role?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-bold">Konfirmasi Hapus User</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus user <strong>{userToDelete?.email}</strong>? 
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait user ini.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isDeleting && <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />}
                {isDeleting ? 'Menghapus...' : 'Hapus User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center text-blue-600 mb-4">
              <ShieldAlert className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-bold">Kelola Role User</h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role untuk {editingUser?.email}
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="individual">Individual</option>
                <option value="admin">Admin</option>
                <option value="finance">Finance</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={isUpdatingRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isUpdatingRole && <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />}
                {isUpdatingRole ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pengaturan</h2>
          <p className="text-slate-500">Kelola akun, user, dan sistem.</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <User className="h-4 w-4 mr-2" />
            Profil Akun
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Users className="h-4 w-4 mr-2" />
            Manajemen User
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`${
              activeTab === 'backup'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Download className="h-4 w-4 mr-2" />
            Backup Data
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`${
              activeTab === 'database'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Database className="h-4 w-4 mr-2" />
            Database
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {message && (
          <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} flex justify-between items-center`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-current hover:opacity-75">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Profil Akun</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="mt-1 block w-full rounded-md border-slate-300 bg-slate-100 shadow-sm text-slate-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">Email tidak dapat diubah.</p>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-900 mb-4 flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-slate-500" />
                  Ganti Password
                </h4>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Password Baru</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
             <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Manajemen User</h3>
                  <p className="text-sm text-slate-500">Daftar pengguna dalam sistem.</p>
                </div>
              </div>
              <div className="flex space-x-2 w-full sm:w-auto">
                <div className="relative rounded-md shadow-sm flex-grow sm:flex-grow-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset page on search
                    }}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Cari user..."
                  />
                </div>
                <button
                  onClick={fetchUsers}
                  disabled={usersLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  <RefreshCcw className={`h-4 w-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Terdaftar</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                              u.role === 'finance' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {u.role || 'individual'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(u.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openRoleModal(u)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                            title="Ubah Role"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(u)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                        {usersList.length === 0 ? 'Tidak ada data user.' : 'User tidak ditemukan.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {filteredUsers.length > ITEMS_PER_PAGE && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> sampai <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> dari <span className="font-medium">{filteredUsers.length}</span> hasil
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Backup & Export Data</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Export Data (JSON)</h4>
                <p className="text-sm text-slate-500 mb-4">
                  Unduh salinan lengkap data Anda termasuk profil pajak, transaksi PPN/PPh, dan catatan aset dalam format JSON.
                </p>
                <button
                  onClick={handleBackup}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  {loading ? 'Mengunduh...' : 'Download Backup JSON'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Database Tools Tab */}
        {activeTab === 'database' && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Utilitas Database</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-6 w-6 text-slate-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-slate-900">Perbaikan Struktur Tabel</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Jika Anda mengalami error "Table not found" atau masalah penyimpanan data, gunakan skrip SQL ini untuk memperbaiki struktur database di Supabase.
                  </p>
                  
                  <button
                    onClick={() => setShowSql(!showSql)}
                    className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:text-blue-700"
                  >
                    {showSql ? 'Sembunyikan SQL' : 'Tampilkan Script Perbaikan SQL'}
                  </button>
                </div>
              </div>

              {showSql && (
                <div className="mt-4 bg-slate-900 rounded-md p-4 overflow-hidden relative">
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
                  <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {MIGRATION_SQL}
                  </pre>
                  <div className="mt-3 text-xs text-slate-500 border-t border-slate-700 pt-2">
                    <p className="font-semibold mb-1">Cara Penggunaan:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Salin kode di atas.</li>
                      <li>Buka <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Dashboard Supabase</a> project Anda.</li>
                      <li>Masuk ke menu <strong>SQL Editor</strong> di sidebar kiri.</li>
                      <li>Paste kode dan klik tombol <strong>RUN</strong>.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
