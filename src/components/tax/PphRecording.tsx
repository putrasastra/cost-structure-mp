import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import { companyService } from '../../services/companyService';
import { PphTransaction, Company } from '../../types';
 
import { CurrencyInput } from '../ui/CurrencyInput';

interface PphForm {
  company_id: string;
  pph_type: '21' | '22' | '23' | '25' | 'final';
  tax_period: string;
  tax_base: number;
  tax_rate: number;
  tax_amount: number;
  employee_name: string;
  document_number: string;
}

export function PphRecording() {
  const [transactions, setTransactions] = useState<PphTransaction[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const { register, handleSubmit, reset, watch, setValue, control } = useForm<PphForm>();
  const [showForm, setShowForm] = useState(false);

  const taxBase = watch('tax_base');
  const taxRate = watch('tax_rate');
  const pphType = watch('pph_type');

  useEffect(() => {
    if (pphType) {
      let rate = 0;
      switch (pphType) {
        case 'final':
          rate = 0.5;
          break;
        case '23':
          rate = 2; // Defaulting to Jasa/Sewa
          break;
        case '22':
          rate = 1.5;
          break;
        default:
          // For 21 and 25, usually variable or progressive, so we don't set default
          break;
      }
      if (rate > 0) {
        setValue('tax_rate', rate);
      }
    }
  }, [pphType, setValue]);

  useEffect(() => {
    if (taxBase && taxRate) {
      setValue('tax_amount', Math.floor(taxBase * (taxRate / 100)));
    }
  }, [taxBase, taxRate, setValue]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txData, coData] = await Promise.all([
        transactionService.getPphTransactions(),
        companyService.getCompanies()
      ]);
      setTransactions(txData);
      setCompanies(coData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onSubmit = async (data: PphForm) => {
    try {
      await transactionService.createPphTransaction(data);
      reset();
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Gagal menyimpan transaksi');
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">Daftar Transaksi PPh Badan</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Transaksi
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h4 className="text-md font-medium text-slate-900 mb-4">Input Transaksi PPh</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Perusahaan</label>
              <select {...register('company_id', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                <option value="">Pilih Perusahaan</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Jenis PPh</label>
              <select {...register('pph_type', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                <option value="21">PPh 21 (Karyawan)</option>
                <option value="22">PPh 22</option>
                <option value="23">PPh 23 (Jasa/Sewa)</option>
                <option value="25">PPh 25 (Angsuran)</option>
                <option value="final">PPh Final UMKM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Masa Pajak (YYYY-MM)</label>
              <input type="month" {...register('tax_period', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Dasar Pengenaan Pajak (DPP)</label>
              <Controller
                name="tax_base"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <CurrencyInput
                    value={value || 0}
                    onChange={onChange}
                    className="mt-1"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tarif (%)</label>
              <input type="number" step="0.1" {...register('tax_rate', { required: true, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Jumlah Pajak</label>
              <Controller
                name="tax_amount"
                control={control}
                render={({ field: { value } }) => (
                  <CurrencyInput
                    value={value || 0}
                    onChange={() => {}} // Read only
                    readOnly
                    className="mt-1 bg-slate-100"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nama Karyawan / Pihak Lain (Opsional)</label>
              <input type="text" {...register('employee_name')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nomor Bukti Potong / Dokumen</label>
              <input type="text" {...register('document_number')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
              <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700">Simpan</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Masa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jenis PPh</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">DPP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tarif</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Pajak Terutang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Keterangan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{t.tax_period}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                    PPh {t.pph_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">Rp {t.tax_base.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.tax_rate}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right">Rp {t.tax_amount.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.employee_name || t.document_number || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
