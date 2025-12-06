import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PersonalIncome } from '../../types';
import { CurrencyInput } from '../ui/CurrencyInput';

export function PersonalRecording() {
  const [incomes, setIncomes] = useState<PersonalIncome[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, control } = useForm<Partial<PersonalIncome>>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {

      const { data, error } = await supabase
        .from('personal_tax_records')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      
      const mappedIncomes = data.map((item: {
        id: string;
        user_id: string | null;
        transaction_date: string;
        income_type: string;
        gross_amount: number;
        tax_withheld: number;
        source_description?: string;
        created_at: string;
      }) => ({
        id: item.id,
        user_id: item.user_id,
        date: item.transaction_date,
        source: item.income_type,
        gross_amount: item.gross_amount,
        tax_deducted: item.tax_withheld,
        description: item.source_description,
        created_at: item.created_at
      }));

      setIncomes(mappedIncomes);
    } catch (error) {
      console.error('Error loading personal tax data:', error);
    }
  };

  const onSubmit = async (data: {
    date: string;
    source: string;
    gross_amount: number;
    tax_deducted?: number;
    description?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const { error } = await supabase.from('personal_tax_records').insert({
        user_id: userId,
        income_type: data.source,
        gross_amount: data.gross_amount,
        tax_withheld: data.tax_deducted ?? 0,
        transaction_date: data.date,
        source_description: data.description
      });

      if (error) throw error;
      
      reset();
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Gagal menyimpan data');
    }
  };

  const deleteIncome = async (id: string) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      const { error } = await supabase.from('personal_tax_records').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">Pencatatan PPh Pribadi (Bukti Potong)</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Catat Penghasilan
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Tanggal</label>
              <input type="date" {...register('date', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Sumber Penghasilan</label>
              <select {...register('source', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                <option value="salary">Gaji (Pegawai)</option>
                <option value="dividend">Dividen</option>
                <option value="fee">Honor / Jasa</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Bruto (Rp)</label>
              <Controller
                name="gross_amount"
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
              <label className="block text-sm font-medium text-slate-700">PPh Dipotong (Rp)</label>
              <Controller
                name="tax_deducted"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <CurrencyInput
                    value={value || 0}
                    onChange={onChange}
                    className="mt-1"
                    placeholder="0"
                  />
                )}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Keterangan / No Bukti Potong</label>
              <input type="text" {...register('description')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
              <button onClick={handleSubmit(onSubmit)} type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700">Simpan</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sumber</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Bruto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">PPh Dipotong</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {incomes.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 capitalize">
                  {item.source}
                  {item.description && <span className="block text-xs text-slate-500">{item.description}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right">Rp {item.gross_amount.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">Rp {item.tax_deducted.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => deleteIncome(item.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
