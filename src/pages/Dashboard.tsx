import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, DollarSign, FileText, Building, RefreshCw, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { transactionService } from '../services/transactionService';
import { companyService } from '../services/companyService';
import { supabase } from '../lib/supabase';
import { format, parseISO, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface TaxProfile {
  id: string;
  name: string;
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalTaxLiability: 0,
    totalTaxPaid: 0,
    transactionCount: 0,
    topCompany: 'Belum ada data'
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [periodFilter, setPeriodFilter] = useState('year'); // 'month', 'year'
  const [entityFilter, setEntityFilter] = useState('ALL'); // 'ALL', 'COMPANY:id', 'PERSONAL:id'
  const [companies, setCompanies] = useState<any[]>([]);
  const [taxProfiles, setTaxProfiles] = useState<TaxProfile[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [periodFilter, entityFilter, companies]);

  const loadInitialData = async () => {
    try {
      const [comps, { data: profiles }] = await Promise.all([
        companyService.getCompanies(),
        supabase.from('tax_profiles').select('id, name')
      ]);
      setCompanies(comps);
      if (profiles) setTaxProfiles(profiles);
    } catch (error) {
      console.error("Error loading initial data", error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [type, id] = entityFilter.split(':');
      
      let ppnPromise, pphPromise, personalPromise;

      if (type === 'COMPANY') {
        ppnPromise = transactionService.getPpnTransactions(id);
        pphPromise = transactionService.getPphTransactions(id);
        personalPromise = Promise.resolve([]);
      } else if (type === 'PERSONAL') {
        ppnPromise = Promise.resolve([]);
        pphPromise = Promise.resolve([]);
        personalPromise = transactionService.getPersonalTaxTransactions(undefined, id);
      } else {
        ppnPromise = transactionService.getPpnTransactions();
        pphPromise = transactionService.getPphTransactions();
        personalPromise = transactionService.getPersonalTaxTransactions();
      }

      // 1. Fetch Data
      const [ppn, pph, personal] = await Promise.all([
        ppnPromise,
        pphPromise,
        personalPromise
      ]);

      // 2. Process Summary
      let liability = 0; // PPN Keluaran + PPh Badan/23/etc
      let paid = 0;      // PPN Masukan + PPh 21 (Withheld)
      
      // PPN Logic
      ppn.forEach(t => {
        if (t.transaction_type === 'output') {
          liability += t.ppn_amount;
        } else {
          paid += t.ppn_amount;
        }
      });

      // PPh Logic
      pph.forEach(t => {
        liability += t.tax_amount; // Assuming PPh recorded is liability
      });

      // Personal Tax Logic
      personal.forEach(t => {
        paid += t.tax_deducted; // Withheld is considered paid/credit
      });

      // Top Company Logic
      const companyTotals: Record<string, number> = {};
      ppn.forEach(t => {
        const cId = t.company_id;
        companyTotals[cId] = (companyTotals[cId] || 0) + t.ppn_amount;
      });
      pph.forEach(t => {
        const cId = t.company_id;
        companyTotals[cId] = (companyTotals[cId] || 0) + t.tax_amount;
      });

      let topCompId = '';
      let maxTotal = 0;
      Object.entries(companyTotals).forEach(([cId, total]) => {
        if (total > maxTotal) {
          maxTotal = total;
          topCompId = cId;
        }
      });
      const topCompanyName = companies.find(c => c.id === topCompId)?.name || 'Belum ada data';

      setSummary({
        totalTaxLiability: liability,
        totalTaxPaid: paid,
        transactionCount: ppn.length + pph.length + personal.length,
        topCompany: topCompanyName
      });

      // 3. Process Chart Data (Monthly)
      const monthlyData: Record<string, { name: string, PPN: number, PPh21: number, PPhBadan: number }> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      months.forEach(m => {
        monthlyData[m] = { name: m, PPN: 0, PPh21: 0, PPhBadan: 0 };
      });

      // Helper to get month name
      const getMonth = (dateStr: string) => format(parseISO(dateStr), 'MMM', { locale: idLocale }); // Using 'MMM' might return 'Jan', 'Feb' etc in ID locale? Actually 'MMM' in 'id' locale is 'Jan', 'Feb' etc.
      // Wait, date-fns locale 'id' might return 'Jan', 'Peb', 'Mar'. Let's stick to standard names or map index.
      const getMonthIndex = (dateStr: string) => parseISO(dateStr).getMonth();

      // PPN to Chart
      ppn.forEach(t => {
        const mIndex = getMonthIndex(t.transaction_date);
        const mName = months[mIndex];
        if (monthlyData[mName]) {
            monthlyData[mName].PPN += t.ppn_amount;
        }
      });

      // PPh to Chart (Split into PPh 21 vs Others/Badan)
      pph.forEach(t => {
        const mIndex = getMonthIndex(t.created_at); // Use created_at or tax_period? tax_period is string 'YYYY-MM'.
        // Better use tax_period if available, else created_at
        let date = t.created_at;
        if (t.tax_period) {
             // tax_period is YYYY-MM
             date = `${t.tax_period}-01`;
        }
        
        const mIndexVal = new Date(date).getMonth();
        const mName = months[mIndexVal];
        
        if (monthlyData[mName]) {
            if (t.pph_type === '21') {
                monthlyData[mName].PPh21 += t.tax_amount;
            } else {
                monthlyData[mName].PPhBadan += t.tax_amount;
            }
        }
      });
      
      // Personal to Chart (PPh 21)
      personal.forEach(t => {
          const mIndex = getMonthIndex(t.date);
          const mName = months[mIndex];
          if (monthlyData[mName]) {
            monthlyData[mName].PPh21 += t.tax_deducted;
          }
      });

      setChartData(Object.values(monthlyData));

      // 4. Process Recent Transactions
      const combined = [
        ...ppn.map(t => ({ ...t, type: 'PPN', date: t.transaction_date, amount: t.ppn_amount, name: t.counterparty_name || 'Transaksi PPN' })),
        ...pph.map(t => ({ ...t, type: `PPh ${t.pph_type}`, date: t.created_at, amount: t.tax_amount, name: t.employee_name || 'Setoran PPh' })),
        ...personal.map(t => ({ ...t, type: 'Pajak Pribadi', date: t.date, amount: t.tax_deducted, name: t.source }))
      ];
      
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(combined.slice(0, 5));

    } catch (error) {
      console.error("Error loading dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <div className="flex space-x-2">
          <button 
            onClick={loadDashboardData} 
            className="p-2 text-slate-600 hover:text-primary transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          </button>
          
          <select 
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 text-sm max-w-[200px]"
          >
            <option value="ALL">Semua Entitas</option>
            <optgroup label="Perusahaan">
              {companies.map(c => (
                <option key={c.id} value={`COMPANY:${c.id}`}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Pajak Pribadi">
              {taxProfiles.map(p => (
                <option key={p.id} value={`PERSONAL:${p.id}`}>{p.name}</option>
              ))}
            </optgroup>
          </select>

          <select 
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 text-sm"
          >
            <option value="year">Tahun Ini</option>
            <option value="all">Semua Waktu</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-50">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-500">Total Pajak Terutang</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">Rp {summary.totalTaxLiability.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-50">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-500">Pajak Sudah Dibayar/Kredit</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">Rp {summary.totalTaxPaid.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-orange-50">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-500">Total Transaksi</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.transactionCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-50">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-500">Kontributor Terbesar</h3>
            <p className="text-lg font-bold text-slate-900 mt-1 truncate" title={summary.topCompany}>{summary.topCompany}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tren Pajak (Tahun Ini)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                />
                <Legend />
                <Bar dataKey="PPN" fill="#2563eb" radius={[4, 4, 0, 0]} name="PPN" />
                <Bar dataKey="PPh21" fill="#059669" radius={[4, 4, 0, 0]} name="PPh 21" />
                <Bar dataKey="PPhBadan" fill="#ea580c" radius={[4, 4, 0, 0]} name="PPh Badan/Lain" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Table Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Transaksi Terkini</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Keterangan</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900 truncate max-w-[120px]" title={t.name}>
                        {t.name}
                        <div className="text-xs text-slate-400 font-normal">{format(new Date(t.date), 'dd MMM yyyy')}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{t.type}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      Rp {t.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                    <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                            Belum ada transaksi.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            {/* Link to recording page if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
