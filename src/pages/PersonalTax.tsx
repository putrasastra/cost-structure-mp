import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Calculator, Save, Trash2, User, Calendar, Settings, Briefcase, DollarSign, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PersonalIncome, PersonalAsset, PersonalLiability, PTKPStatus } from '../types';
import { cn } from '../lib/utils';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { TaxProfileManager } from '../components/tax/TaxProfileManager';

// Generate years from 2020 to 2030
const YEARS = Array.from({ length: 11 }, (_, i) => 2030 - i);

export function PersonalTax() {
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [profiles, setProfiles] = useState<{id: string, name: string}[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [incomes, setIncomes] = useState<PersonalIncome[]>([]);
  const [assets, setAssets] = useState<PersonalAsset[]>([]);
  const [liabilities, setLiabilities] = useState<PersonalLiability[]>([]);
  
  const [ptkpStatus, setPtkpStatus] = useState<PTKPStatus>('TK/0');
  
  // UI State
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [activeTab, setActiveTab] = useState<'income' | 'assets'>('income');
  const [loading, setLoading] = useState(false);
  
  const [simulationResult, setSimulationResult] = useState<{
    totalGross: number;
    biayaJabatan: number;
    netIncome: number;
    ptkp: number;
    pkp: number;
    taxPayable: number;
    totalWithheld: number;
    underpayment: number;
    overpayment: number;
  } | null>(null);

  // Forms
  const incomeForm = useForm<Partial<PersonalIncome>>();
  const assetForm = useForm<Partial<PersonalAsset>>();
  const liabilityForm = useForm<Partial<PersonalLiability>>();

  // PTKP Rates 2024
  const PTKP_RATES = {
    'TK/0': 54000000,
    'TK/1': 58500000,
    'TK/2': 63000000,
    'TK/3': 67500000,
    'K/0': 58500000,
    'K/1': 63000000,
    'K/2': 67500000,
    'K/3': 72000000,
  };

  useEffect(() => {
    loadProfiles();
  }, [showProfileManager]);

  useEffect(() => {
    if (selectedProfile) {
      loadData();
    }
  }, [selectedYear, selectedProfile]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_profiles')
        .select('id, name')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setProfiles(data || []);
      
      if (!selectedProfile && data && data.length > 0) {
        setSelectedProfile(data[0].id);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user && user.user_metadata?.ptkp_status) {
        setPtkpStatus(user.user_metadata.ptkp_status);
      }

      // 1. Load Incomes
      let incomeQuery = supabase
        .from('personal_tax_records')
        .select('*')
        .eq('profile_id', selectedProfile)
        .gte('transaction_date', `${selectedYear}-01-01`)
        .lte('transaction_date', `${selectedYear}-12-31`)
        .order('transaction_date', { ascending: false });
      
      const { data: incomeData, error: incomeError } = await incomeQuery;
      if (incomeError) throw incomeError;
      
      const mappedIncomes = (incomeData || []).map((item: any) => ({
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

      // 2. Load Assets
      const { data: assetData, error: assetError } = await supabase
        .from('personal_assets')
        .select('*')
        .eq('profile_id', selectedProfile)
        .eq('year', selectedYear)
        .order('created_at', { ascending: false });
        
      if (assetError) throw assetError;
      setAssets(assetData || []);

      // 3. Load Liabilities
      const { data: liabilityData, error: liabilityError } = await supabase
        .from('personal_liabilities')
        .select('*')
        .eq('profile_id', selectedProfile)
        .eq('year', selectedYear)
        .order('created_at', { ascending: false });
        
      if (liabilityError) throw liabilityError;
      setLiabilities(liabilityData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { ptkp_status: ptkpStatus }
      });
      if (error) throw error;
      alert('Profil pajak berhasil disimpan');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Gagal menyimpan profil');
    }
  };

  const onSubmitIncome = async (data: any) => {
    try {
      if (!selectedProfile) {
        alert('Silakan pilih profil Wajib Pajak terlebih dahulu.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const { error } = await supabase.from('personal_tax_records').insert({
        user_id: userId,
        profile_id: selectedProfile,
        income_type: data.source,
        gross_amount: data.gross_amount,
        tax_withheld: data.tax_deducted ?? 0,
        transaction_date: data.date,
        source_description: data.description
      });

      if (error) throw error;
      
      incomeForm.reset();
      setShowIncomeForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Gagal menyimpan penghasilan: ' + (error as Error).message);
    }
  };

  const onSubmitAsset = async (data: any) => {
    try {
      if (!selectedProfile) return;
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('personal_assets').insert({
        user_id: user?.id,
        profile_id: selectedProfile,
        year: selectedYear,
        asset_name: data.asset_name,
        acquisition_year: data.acquisition_year,
        acquisition_price: data.acquisition_price,
        description: data.description
      });

      if (error) throw error;

      assetForm.reset();
      setShowAssetForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Gagal menyimpan harta');
    }
  };

  const onSubmitLiability = async (data: any) => {
    try {
      if (!selectedProfile) return;
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('personal_liabilities').insert({
        user_id: user?.id,
        profile_id: selectedProfile,
        year: selectedYear,
        lender_name: data.lender_name,
        start_year: data.start_year,
        amount: data.amount,
        description: data.description
      });

      if (error) throw error;

      liabilityForm.reset();
      setShowLiabilityForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving liability:', error);
      alert('Gagal menyimpan utang');
    }
  };

  const deleteIncome = async (id: string) => {
    if (!confirm('Hapus data penghasilan ini?')) return;
    try {
      const { error } = await supabase.from('personal_tax_records').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const deleteAsset = async (id: string) => {
    if (!confirm('Hapus data harta ini?')) return;
    try {
      const { error } = await supabase.from('personal_assets').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const deleteLiability = async (id: string) => {
    if (!confirm('Hapus data utang ini?')) return;
    try {
      const { error } = await supabase.from('personal_liabilities').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting liability:', error);
    }
  };

  const calculateTax = () => {
    const totalGross = incomes.reduce((sum, item) => sum + (item.gross_amount || 0), 0);
    const totalWithheld = incomes.reduce((sum, item) => sum + (item.tax_deducted || 0), 0);
    const ptkp = PTKP_RATES[ptkpStatus] || 54000000;
    
    const salaryIncomes = incomes.filter(i => i.source === 'salary');
    const totalSalary = salaryIncomes.reduce((sum, i) => sum + i.gross_amount, 0);
    const biayaJabatan = Math.min(totalSalary * 0.05, 6000000);
    
    const netIncome = totalGross - biayaJabatan;
    const pkp = Math.max(0, netIncome - ptkp);
    
    let tax = 0;
    let remainingPkp = pkp;
    
    if (remainingPkp > 0) {
      const tier1 = Math.min(remainingPkp, 60000000);
      tax += tier1 * 0.05;
      remainingPkp -= tier1;
    }
    if (remainingPkp > 0) {
      const tier2 = Math.min(remainingPkp, 190000000);
      tax += tier2 * 0.15;
      remainingPkp -= tier2;
    }
    if (remainingPkp > 0) {
      const tier3 = Math.min(remainingPkp, 250000000);
      tax += tier3 * 0.25;
      remainingPkp -= tier3;
    }
    if (remainingPkp > 0) {
      const tier4 = Math.min(remainingPkp, 4500000000);
      tax += tier4 * 0.30;
      remainingPkp -= tier4;
    }
     if (remainingPkp > 0) {
      tax += remainingPkp * 0.35;
    }

    const taxPayable = tax;
    const underpayment = Math.max(0, taxPayable - totalWithheld);
    const overpayment = Math.max(0, totalWithheld - taxPayable);

    setSimulationResult({
      totalGross,
      biayaJabatan,
      netIncome,
      ptkp,
      pkp,
      taxPayable,
      totalWithheld,
      underpayment,
      overpayment
    });
  };

  return (
    <div className="space-y-8">
      <TaxProfileManager 
        isOpen={showProfileManager} 
        onClose={() => setShowProfileManager(false)}
      />

      {/* Top Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <User className="h-5 w-5 text-slate-500" />
            <select 
              value={selectedProfile} 
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer min-w-[150px]"
            >
              <option value="" disabled>Pilih Wajib Pajak</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowProfileManager(true)}
              className="ml-2 text-slate-400 hover:text-primary"
              title="Kelola Profil"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Calendar className="h-5 w-5 text-slate-500" />
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-2 w-full md:w-auto justify-end">
          <button 
            onClick={calculateTax}
            disabled={loading}
            className="w-full md:w-auto inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Hitung PPh Tahunan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Total Penghasilan (Bruto)</h3>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            Rp {incomes.reduce((sum, i) => sum + i.gross_amount, 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Pajak Dipotong Pihak Lain</h3>
          <p className="mt-2 text-2xl font-semibold text-blue-600">
            Rp {incomes.reduce((sum, i) => sum + i.tax_deducted, 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Estimasi PPh Terutang</h3>
          <p className="mt-2 text-2xl font-semibold text-orange-600">
            {simulationResult ? `Rp ${Math.floor(simulationResult.taxPayable).toLocaleString('id-ID')}` : '-'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('income')}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm",
              activeTab === 'income'
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            Penghasilan & Pajak
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm",
              activeTab === 'assets'
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >Harta &amp; Kewajiban (SPT)</button>
        </nav>
      </div>

      {activeTab === 'income' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tax Profile */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Profil Pajak (PTKP)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status PTKP</label>
                  <select 
                    value={ptkpStatus}
                    onChange={(e) => setPtkpStatus(e.target.value as PTKPStatus)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  >
                    {Object.keys(PTKP_RATES).map(k => (
                      <option key={k} value={k}>{k} - Rp {PTKP_RATES[k as keyof typeof PTKP_RATES].toLocaleString('id-ID')}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={saveProfile}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Profil
                </button>
              </div>
            </div>

            {simulationResult && (
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Hasil Simulasi</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Penghasilan Netto</span>
                    <span className="font-medium">Rp {simulationResult.netIncome.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">PTKP</span>
                    <span className="font-medium">Rp {simulationResult.ptkp.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2">
                    <span className="text-blue-700">PKP</span>
                    <span className="font-medium">Rp {simulationResult.pkp.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-900 pt-2">
                    <span>PPh Terutang</span>
                    <span>Rp {Math.floor(simulationResult.taxPayable).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Kredit Pajak</span>
                    <span>- Rp {simulationResult.totalWithheld.toLocaleString('id-ID')}</span>
                  </div>
                  <div className={cn("flex justify-between font-bold pt-2 border-t border-blue-200", simulationResult.underpayment > 0 ? "text-red-600" : "text-green-600")}>
                    <span>{simulationResult.underpayment > 0 ? "Kurang Bayar" : "Lebih Bayar"}</span>
                    <span>Rp {Math.max(simulationResult.underpayment, simulationResult.overpayment).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Income List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900">Daftar Penghasilan ({selectedYear})</h3>
                <button
                  onClick={() => setShowIncomeForm(!showIncomeForm)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Penghasilan
                </button>
              </div>

              {showIncomeForm && (
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                  <form onSubmit={incomeForm.handleSubmit(onSubmitIncome)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Tanggal</label>
                      <input type="date" {...incomeForm.register('date', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Sumber</label>
                      <select {...incomeForm.register('source', { required: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                        <option value="salary">Gaji (Pegawai)</option>
                        <option value="dividend">Dividen</option>
                        <option value="fee">Honor / Fee</option>
                        <option value="business">Laba Usaha</option>
                        <option value="other">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Jumlah Bruto</label>
                      <Controller
                        name="gross_amount"
                        control={incomeForm.control}
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
                      <label className="block text-sm font-medium text-slate-700">Pajak Dipotong</label>
                      <Controller
                        name="tax_deducted"
                        control={incomeForm.control}
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
                      <label className="block text-sm font-medium text-slate-700">Keterangan</label>
                      <input type="text" {...incomeForm.register('description')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-3">
                      <button type="button" onClick={() => setShowIncomeForm(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
                      <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700">Simpan</button>
                    </div>
                  </form>
                </div>
              )}

              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sumber</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Bruto</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Pajak Dipotong</th>
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
                  {incomes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                        {selectedProfile ? `Belum ada data penghasilan untuk tahun ${selectedYear}.` : 'Pilih profil wajib pajak terlebih dahulu.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
              <div className="flex-shrink-0">
                 <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Daftar Harta & Kewajiban (SPT Tahunan)</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Fitur ini digunakan untuk mencatat aset (rumah, kendaraan, tabungan) dan utang yang wajib dilaporkan dalam SPT Tahunan.</p>
                  <p className="mt-1">Status per Akhir Tahun Pajak ({selectedYear}).</p>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Assets Section */}
              <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-medium text-slate-900 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-slate-500" />
                    Harta (Assets)
                  </h3>
                  <button 
                    onClick={() => setShowAssetForm(!showAssetForm)}
                    className="text-xs text-primary hover:text-blue-700 font-medium"
                  >
                    + Tambah Harta
                  </button>
                </div>

                {showAssetForm && (
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                     <form onSubmit={assetForm.handleSubmit(onSubmitAsset)} className="space-y-3">
                       <div>
                         <label className="block text-xs font-medium text-slate-700">Nama Harta</label>
                         <input {...assetForm.register('asset_name', { required: true })} type="text" className="mt-1 block w-full rounded-md border-slate-300 text-sm" placeholder="Contoh: Rumah, Mobil, Tabungan" />
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                         <div>
                            <label className="block text-xs font-medium text-slate-700">Tahun Perolehan</label>
                            <input {...assetForm.register('acquisition_year', { required: true })} type="number" className="mt-1 block w-full rounded-md border-slate-300 text-sm" placeholder="Tahun" />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-700">Harga Perolehan</label>
                            <Controller
                              name="acquisition_price"
                              control={assetForm.control}
                              rules={{ required: true }}
                              render={({ field: { onChange, value } }) => (
                                <CurrencyInput
                                  value={value || 0}
                                  onChange={onChange}
                                  className="mt-1 text-sm"
                                />
                              )}
                            />
                         </div>
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-slate-700">Keterangan</label>
                         <input {...assetForm.register('description')} type="text" className="mt-1 block w-full rounded-md border-slate-300 text-sm" />
                       </div>
                       <div className="flex justify-end space-x-2 pt-2">
                         <button type="button" onClick={() => setShowAssetForm(false)} className="px-3 py-1 border border-slate-300 rounded text-xs text-slate-600">Batal</button>
                         <button type="submit" className="px-3 py-1 bg-primary text-white rounded text-xs hover:bg-blue-700">Simpan</button>
                       </div>
                     </form>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  {assets.map(asset => (
                    <div key={asset.id} className="p-4 hover:bg-slate-50 flex justify-between group">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{asset.asset_name}</p>
                        <p className="text-xs text-slate-500">Thn {asset.acquisition_year} • {asset.description || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">Rp {asset.acquisition_price.toLocaleString('id-ID')}</p>
                        <button onClick={() => deleteAsset(asset.id)} className="text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 mt-1">Hapus</button>
                      </div>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      Belum ada data harta tercatat.
                    </div>
                  )}
                </div>
              </div>

              {/* Liabilities Section */}
              <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                 <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-medium text-slate-900 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-slate-500" />
                    Kewajiban / Utang (Liabilities)
                  </h3>
                  <button 
                    onClick={() => setShowLiabilityForm(!showLiabilityForm)}
                    className="text-xs text-primary hover:text-blue-700 font-medium"
                  >
                    + Tambah Utang
                  </button>
                </div>

                {showLiabilityForm && (
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                     <form onSubmit={liabilityForm.handleSubmit(onSubmitLiability)} className="space-y-3">
                       <div>
                         <label className="block text-xs font-medium text-slate-700">Nama Pemberi Pinjaman</label>
                         <input {...liabilityForm.register('lender_name', { required: true })} type="text" className="mt-1 block w-full rounded-md border-slate-300 text-sm" placeholder="Contoh: Bank BCA, Leasing" />
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                         <div>
                            <label className="block text-xs font-medium text-slate-700">Tahun Peminjaman</label>
                            <input {...liabilityForm.register('start_year', { required: true })} type="number" className="mt-1 block w-full rounded-md border-slate-300 text-sm" placeholder="Tahun" />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-700">Sisa Pokok Utang</label>
                            <Controller
                              name="amount"
                              control={liabilityForm.control}
                              rules={{ required: true }}
                              render={({ field: { onChange, value } }) => (
                                <CurrencyInput
                                  value={value || 0}
                                  onChange={onChange}
                                  className="mt-1 text-sm"
                                />
                              )}
                            />
                         </div>
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-slate-700">Keterangan</label>
                         <input {...liabilityForm.register('description')} type="text" className="mt-1 block w-full rounded-md border-slate-300 text-sm" />
                       </div>
                       <div className="flex justify-end space-x-2 pt-2">
                         <button type="button" onClick={() => setShowLiabilityForm(false)} className="px-3 py-1 border border-slate-300 rounded text-xs text-slate-600">Batal</button>
                         <button type="submit" className="px-3 py-1 bg-primary text-white rounded text-xs hover:bg-blue-700">Simpan</button>
                       </div>
                     </form>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  {liabilities.map(liability => (
                    <div key={liability.id} className="p-4 hover:bg-slate-50 flex justify-between group">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{liability.lender_name}</p>
                        <p className="text-xs text-slate-500">Thn {liability.start_year} • {liability.description || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">Rp {liability.amount.toLocaleString('id-ID')}</p>
                        <button onClick={() => deleteLiability(liability.id)} className="text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 mt-1">Hapus</button>
                      </div>
                    </div>
                  ))}
                  {liabilities.length === 0 && (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      Belum ada data utang tercatat.
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
