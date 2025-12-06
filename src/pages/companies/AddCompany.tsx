import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { companyService } from '../../services/companyService';
import { Link } from 'react-router-dom';

interface AddCompanyForm {
  name: string;
  npwp: string;
  is_pkp: boolean;
  business_type: string;
  address: string;
}

export function AddCompany() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<AddCompanyForm>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: AddCompanyForm) => {
    setSubmitting(true);
    setError(null);
    try {
      await companyService.createCompany(data);
      navigate('/companies');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat perusahaan. Pastikan NPWP belum terdaftar.';
      console.error('Error creating company:', err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/companies" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">Tambah Perusahaan Baru</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Nama Perusahaan
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 rounded-md p-2 border"
                  {...register('name', { required: 'Nama perusahaan wajib diisi' })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="npwp" className="block text-sm font-medium text-slate-700">
                NPWP
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="npwp"
                  placeholder="00.000.000.0-000.000"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 rounded-md p-2 border"
                  {...register('npwp', { required: 'NPWP wajib diisi' })}
                />
                {errors.npwp && (
                  <p className="mt-1 text-sm text-red-600">{errors.npwp.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="business_type" className="block text-sm font-medium text-slate-700">
                Jenis Usaha (KLU)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="business_type"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 rounded-md p-2 border"
                  {...register('business_type')}
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="is_pkp"
                    type="checkbox"
                    className="focus:ring-primary h-4 w-4 text-primary border-slate-300 rounded"
                    {...register('is_pkp')}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="is_pkp" className="font-medium text-slate-700">
                    Pengusaha Kena Pajak (PKP)
                  </label>
                  <p className="text-slate-500">Centang jika perusahaan ini wajib memungut PPN.</p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                Alamat Lengkap
              </label>
              <div className="mt-1">
                <textarea
                  id="address"
                  rows={3}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 rounded-md p-2 border"
                  {...register('address')}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Link
              to="/companies"
              className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-3"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perusahaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
