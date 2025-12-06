import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Search, Eye, Trash2, Filter, X, AlertCircle, CheckCircle, History, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface SPTDocument {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  tax_year: string;
  spt_type: 'Pribadi' | 'Perusahaan';
  reporting_date: string;
  created_at: string;
  file_url: string;
}

interface AuditLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user_id: string;
  user_email?: string; // joined field
}

export function SPTRepository() {
  const [activeTab, setActiveTab] = useState<'documents' | 'history'>('documents');
  const [documents, setDocuments] = useState<SPTDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Pribadi' | 'Perusahaan'>('All');
  const [previewDoc, setPreviewDoc] = useState<SPTDocument | null>(null);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear().toString());
  const [uploadType, setUploadType] = useState<'Pribadi' | 'Perusahaan'>('Pribadi');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchAuditLogs();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('spt_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      // Fetch logs and join with user email if possible, or just show user_id for now
      // Since we don't have a direct join setup easily without foreign keys setup in a specific way for 'details' or if we just want user info.
      // Assuming 'users' table is accessible or we just show ID/generic name.
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, users(email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedLogs = (data || []).map((log: any) => ({
        ...log,
        user_email: log.users?.email
      }));
      
      setAuditLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Format file harus PDF atau DOCX');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setUploadError('Ukuran file maksimal 10MB');
        return;
      }
      setUploadError('');
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadError('Silakan pilih file terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // 1. Upload to Storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('spt-files')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Get Public URL (or signed URL if private, assuming public for simplicity or handle signed url later)
      // For now, let's assume we generate a signed URL when viewing, or if bucket is public.
      // The bucket is private, so we'll need signed URLs. For storing in DB, we store the path or a permanent URL if public.
      // Let's store the path or the public URL. If bucket is private, public URL won't work without token.
      // We'll store the filePath and generate signed URL on demand, OR make bucket public.
      // For this implementation, let's assume we store the full path and handle display later.
      // Actually, let's get the public URL for simplicity if policies allow, otherwise just path.
      // The migration set bucket to private. So we should store the path.
      
      // 2. Insert into Database
      const { data: docData, error: dbError } = await supabase
        .from('spt_documents')
        .insert({
          user_id: user.id,
          file_name: uploadFile.name,
          file_size: uploadFile.size,
          file_type: uploadFile.type,
          file_url: filePath, // Storing path for private bucket access
          tax_year: uploadYear,
          spt_type: uploadType,
          reporting_date: uploadDate
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Create Audit Log
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'UPLOAD_SPT',
        details: {
          file_name: uploadFile.name,
          spt_type: uploadType,
          tax_year: uploadYear
        },
        target_id: docData.id
      });

      // Refresh Data
      await fetchDocuments();
      await fetchAuditLogs();
      
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadError('');
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Gagal mengunggah dokumen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // 1. Delete from Storage
        const { error: storageError } = await supabase.storage
          .from('spt-files')
          .remove([filePath]);

        if (storageError) console.error('Storage delete error:', storageError); // Continue even if storage fails (orphan cleanup later)

        // 2. Delete from Database
        const { error: dbError } = await supabase
          .from('spt_documents')
          .delete()
          .eq('id', id);

        if (dbError) throw dbError;

        // 3. Create Audit Log
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'DELETE_SPT',
          details: {
            document_id: id,
            file_path: filePath
          },
          target_id: id
        });

        await fetchDocuments();
        await fetchAuditLogs();
      } catch (error: any) {
        console.error('Delete failed:', error);
        alert('Gagal menghapus dokumen: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.tax_year.includes(searchQuery);
    const matchesFilter = filterType === 'All' || doc.spt_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = async (doc: SPTDocument) => {
    try {
      // Generate signed URL for private bucket
      const { data, error } = await supabase.storage
        .from('spt-files')
        .createSignedUrl(doc.file_url, 3600); // 1 hour expiry

      if (error) throw error;
      
      if (data?.signedUrl) {
        setPreviewDoc({ ...doc, file_url: data.signedUrl }); // Temporarily replace path with signed URL for preview
      }
    } catch (error) {
      console.error('Error getting signed URL:', error);
      alert('Gagal memuat preview dokumen');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Repository SPT</h1>
          <p className="text-slate-500">Arsip digital SPT Tahunan Pribadi dan Perusahaan</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsHelpModalOpen(true)}
            className="text-slate-500 hover:text-primary p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
            title="Panduan"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Unggah SPT Baru
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('documents')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'documents' 
              ? "border-primary text-primary" 
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          Dokumen
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'history' 
              ? "border-primary text-primary" 
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          Riwayat Aktivitas
        </button>
      </div>

      {activeTab === 'documents' ? (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama file atau tahun..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400 w-4 h-4" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="All">Semua Tipe</option>
                <option value="Pribadi">Pribadi</option>
                <option value="Perusahaan">Perusahaan</option>
              </select>
            </div>
          </div>

          {/* Document List */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Nama File</th>
                    <th className="px-6 py-3">Jenis SPT</th>
                    <th className="px-6 py-3">Tahun Pajak</th>
                    <th className="px-6 py-3">Tgl Lapor</th>
                    <th className="px-6 py-3">Ukuran</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Memuat dokumen...
                      </td>
                    </tr>
                  ) : filteredDocs.length > 0 ? (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded">
                            <FileText className="w-5 h-5" />
                          </div>
                          {doc.file_name}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            doc.spt_type === 'Pribadi' ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                          )}>
                            {doc.spt_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">{doc.tax_year}</td>
                        <td className="px-6 py-4">{doc.reporting_date}</td>
                        <td className="px-6 py-4 text-slate-500">{formatFileSize(doc.file_size)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(doc);
                              }}
                              className="p-1 text-slate-400 hover:text-primary transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(doc.id, doc.file_url);
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Tidak ada dokumen ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Audit Log Tab */
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Waktu</th>
                  <th className="px-6 py-3">Aktivitas</th>
                  <th className="px-6 py-3">Detail</th>
                  <th className="px-6 py-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-bold",
                        log.action.includes('UPLOAD') ? "bg-blue-100 text-blue-700" : 
                        log.action.includes('DELETE') ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {log.user_email || 'User'}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Belum ada riwayat aktivitas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Panduan Penggunaan
              </h2>
              <button onClick={() => setIsHelpModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">1. Mengunggah SPT</h3>
                <p>Klik tombol "Unggah SPT Baru", pilih file PDF/DOCX (maks 10MB), dan lengkapi data Tahun Pajak serta Tanggal Pelaporan.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">2. Mencari Dokumen</h3>
                <p>Gunakan kolom pencarian untuk mencari berdasarkan nama file atau tahun. Gunakan filter untuk menyaring berdasarkan jenis SPT (Pribadi/Perusahaan).</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">3. Preview & Hapus</h3>
                <p>Klik ikon mata (Eye) untuk melihat dokumen langsung di browser. Klik ikon sampah (Trash) untuk menghapus dokumen.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">4. Keamanan Data</h3>
                <p>Semua dokumen yang diunggah akan dienkripsi dalam penyimpanan sistem untuk menjaga kerahasiaan data pajak Anda.</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Unggah Dokumen SPT</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* File Input */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  uploadFile ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary hover:bg-slate-50"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.docx"
                />
                {uploadFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-primary" />
                    <p className="font-medium text-slate-900">{uploadFile.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(uploadFile.size)}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-slate-400" />
                    <p className="font-medium text-slate-900">Klik untuk pilih file</p>
                    <p className="text-xs text-slate-500">PDF atau DOCX (Maks. 10MB)</p>
                  </div>
                )}
              </div>
              {uploadError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  {uploadError}
                </div>
              )}

              {/* Metadata Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenis SPT</label>
                  <select 
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Pribadi">Pribadi</option>
                    <option value="Perusahaan">Perusahaan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Pajak</label>
                  <input 
                    type="number"
                    value={uploadYear}
                    onChange={(e) => setUploadYear(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Pelaporan</label>
                <input 
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
              >
                Batal
              </button>
              <button 
                onClick={handleUpload}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                Simpan Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div>
                <h2 className="font-bold text-slate-900">{previewDoc.file_name}</h2>
                <p className="text-xs text-slate-500">
                  {previewDoc.spt_type} • Tahun {previewDoc.tax_year}
                </p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center overflow-hidden">
              {previewDoc.file_type === 'application/pdf' ? (
                <iframe 
                  src={previewDoc.file_url} 
                  className="w-full h-full rounded bg-white shadow"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Preview tidak tersedia untuk format ini.</p>
                  <p className="text-sm text-slate-400 mt-2">Silakan unduh file untuk melihat isinya.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl flex justify-end">
               <p className="text-xs text-slate-400 italic mr-auto self-center">
                  *Dokumen dienkripsi saat penyimpanan
               </p>
               <button 
                 onClick={() => window.open(previewDoc.file_url, '_blank')}
                 className="text-primary hover:underline text-sm font-medium"
               >
                 Buka di Tab Baru
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
