import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import { companyService } from '../../services/companyService';
import { PpnTransaction, Company } from '../../types';
import { cn } from '../../lib/utils';
import { CurrencyInput } from '../ui/CurrencyInput';

interface PpnForm {
  company_id: string;
  transaction_type: 'input' | 'output';
  invoice_number: string;
  transaction_date: string;
  dpp_amount: number;
  ppn_amount: number;
  counterparty_name: string;
  tax_period: string;
}

export function PpnRecording() {
  const [transactions, setTransactions] = useState<PpnTransaction[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const { register, handleSubmit, reset, watch, setValue, control } = useForm<PpnForm>();
  const [showForm, setShowForm] = useState(false);

  const dppAmount = watch('dpp_amount');

  useEffect(() => {
    if (dppAmount) {
      setValue('ppn_amount', Math.floor(dppAmount * 0.11));
    }
  }, [dppAmount, setValue]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txData, coData] = await Promise.all([
        transactionService.getPpnTransactions(),
        companyService.getCompanies()
      ]);
      setTransactions(txData);
      setCompanies(coData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onSubmit = async (data: PpnForm) => {
    try {
      await transactionService.createPpnTransaction(data);
      reset();
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Gagal menyimpan transaksi');
    }
  };

  const totalInput = transactions
    .filter(t => t.transaction_type === 'input')
    .reduce((sum, t) => sum + t.ppn_amount, 0);

  const totalOutput = transactions
    .filter(t => t.transaction_type === 'output')
    .reduce((sum, t) => sum + t.ppn_amount, 0);

  const taxPayable = totalOutput - totalInput;

  return (
    <div className="space-y-6 p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Pajak Masukan</h3>
          <p className="text-xl font-bold text-green-600 mt-2">Rp {totalInput.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Pajak Keluaran</h3>
          <p className="text-xl font-bold text-blue-600 mt-2">Rp {totalOutput.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">
            {taxPayable >= 0 ? 'PPN Kurang Bayar' : 'PPN Lebih Bayar'}
          </h3>
          <p className={cn("text-xl font-bold mt-2", taxPayable >= 0 ? "text-orange-600" : "text-green-600")}>
            Rp {Math.abs(taxPayable).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">Daftar Transaksi PPN</h3>
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
          <h4 className="text-md font-medium text-slate-900 mb-4">Input Faktur Pajak</h4>
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
              <label className="block text-sm font-medium text-slate-700">Jenis Transaksi</label>
              <select {...register('transaction_type', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                <option value="input">Pajak Masukan (Pembelian)</option>
                <option value="output">Pajak Keluaran (Penjualan)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nomor Faktur</label>
              <input type="text" {...register('invoice_number', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tanggal Transaksi</label>
              <input type="date" {...register('transaction_date', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">DPP (Dasar Pengenaan Pajak)</label>
              <Controller
                name="dpp_amount"
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
              <label className="block text-sm font-medium text-slate-700">PPN (11%)</label>
              <Controller
                name="ppn_amount"
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
              <label className="block text-sm font-medium text-slate-700">Lawan Transaksi</label>
              <input type="text" {...register('counterparty_name', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Masa Pajak (YYYY-MM)</label>
              <input type="month" {...register('tax_period', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jenis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">No Faktur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lawan Transaksi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">DPP</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">PPN</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{format(new Date(t.transaction_date), 'dd MMM yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                    t.transaction_type === 'input' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  )}>
                    {t.transaction_type === 'input' ? 'Masukan' : 'Keluaran'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.invoice_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.counterparty_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right">Rp {t.dpp_amount.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right">Rp {t.ppn_amount.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
