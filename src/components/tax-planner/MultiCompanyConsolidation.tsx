import { useState } from 'react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Plus, Trash2, TrendingUp } from 'lucide-react';

interface CompanyData {
    id: number;
    name: string;
    revenue: number;
    profit: number;
    taxRate: 'umkm' | 'normal';
}

export function MultiCompanyConsolidation() {
    const [companies, setCompanies] = useState<CompanyData[]>([
        { id: 1, name: 'PT Alpha (Trading)', revenue: 10000000000, profit: 1500000000, taxRate: 'normal' },
        { id: 2, name: 'CV Beta (Jasa)', revenue: 2500000000, profit: 800000000, taxRate: 'umkm' },
    ]);

    const addCompany = () => {
        setCompanies([...companies, { id: Date.now(), name: 'New Company', revenue: 0, profit: 0, taxRate: 'normal' }]);
    };

    const updateCompany = (id: number, field: keyof CompanyData, value: any) => {
        setCompanies(companies.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const removeCompany = (id: number) => {
        setCompanies(companies.filter(c => c.id !== id));
    };

    const calculateTax31E = (taxableIncome: number, totalRevenue: number) => {
        if (taxableIncome <= 0) return 0;
        
        // If revenue > 50B: Flat 22%
        if (totalRevenue > 50000000000) {
            return taxableIncome * 0.22;
        }

        // If revenue <= 4.8B: 50% discount on rate -> 11%
        if (totalRevenue <= 4800000000) {
            return taxableIncome * 0.11;
        }

        // If 4.8B < revenue <= 50B: Proportional
        // Facility Portion: (4.8B / TotalRevenue) * TaxableIncome -> Rate 11%
        const facilityPortion = (4800000000 / totalRevenue) * taxableIncome;
        const nonFacilityPortion = taxableIncome - facilityPortion;
        
        return (facilityPortion * 0.11) + (nonFacilityPortion * 0.22);
    };

    const calculateTax = (company: CompanyData) => {
        if (company.taxRate === 'umkm') {
            return company.revenue * 0.005;
        } else {
            return calculateTax31E(company.profit, company.revenue);
        }
    };

    const getEffectiveRate = (company: CompanyData) => {
        const tax = calculateTax(company);
        if (company.taxRate === 'umkm') {
            return company.revenue > 0 ? (tax / company.revenue * 100) : 0;
        }
        return company.profit > 0 ? (tax / company.profit * 100) : 0;
    };

    const totalRevenue = companies.reduce((sum, c) => sum + c.revenue, 0);
    const totalProfit = companies.reduce((sum, c) => sum + c.profit, 0);
    const totalTax = companies.reduce((sum, c) => sum + calculateTax(c), 0);
    const effectiveRate = totalProfit > 0 ? (totalTax / totalProfit) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900">Struktur Grup Perusahaan</h3>
                <button onClick={addCompany} className="flex items-center text-sm text-blue-600 font-medium">
                    <Plus className="h-4 w-4 mr-1" /> Tambah Entitas
                </button>
            </div>

            <div className="space-y-4">
                {companies.map((company) => {
                    const tax = calculateTax(company);
                    const rate = getEffectiveRate(company);
                    const is31E = company.taxRate === 'normal' && company.revenue <= 50000000000;
                    
                    return (
                    <div key={company.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Nama Perusahaan</label>
                                <input
                                    type="text"
                                    value={company.name}
                                    onChange={(e) => updateCompany(company.id, 'name', e.target.value)}
                                    className="block w-full rounded-md border-2 border-slate-400 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Omzet</label>
                                <CurrencyInput
                                    value={company.revenue}
                                    onChange={(val) => updateCompany(company.id, 'revenue', val)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Laba Bersih</label>
                                <CurrencyInput
                                    value={company.profit}
                                    onChange={(val) => updateCompany(company.id, 'profit', val)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Skema Pajak</label>
                                <select
                                    value={company.taxRate}
                                    onChange={(e) => updateCompany(company.id, 'taxRate', e.target.value)}
                                    className="block w-full rounded-md border-2 border-slate-400 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                >
                                    <option value="normal">Normal (Pasal 17/31E)</option>
                                    <option value="umkm">UMKM (0.5% Omzet)</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-right w-full mr-4">
                                    <p className="text-xs text-slate-500">Estimasi Pajak</p>
                                    <p className="font-medium text-red-600">Rp {tax.toLocaleString('id-ID')}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[10px] text-slate-400">
                                            Eff: {rate.toFixed(2)}% {company.taxRate === 'umkm' ? '(Final)' : ''}
                                        </span>
                                        {is31E && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                                31E
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => removeCompany(company.id)} className="text-slate-400 hover:text-red-500 mb-1">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )})}
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-xl mt-8">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Analisis Efisiensi Grup
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-slate-400 text-sm">Total Omzet Grup</p>
                        <p className="text-xl font-bold">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Total Laba Grup</p>
                        <p className="text-xl font-bold">Rp {totalProfit.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Total Beban Pajak</p>
                        <p className="text-xl font-bold text-red-400">Rp {totalTax.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Tarif Efektif Grup</p>
                        <p className="text-xl font-bold text-green-400">{effectiveRate.toFixed(2)}%</p>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700 text-sm text-slate-300">
                    <p className="font-bold text-white mb-2">Rekomendasi:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Pastikan transaksi antar perusahaan (Transfer Pricing) memiliki dokumentasi wajar (Arm's Length Principle).</li>
                        <li>
                            {effectiveRate < 11 ? 
                                "Efisiensi pajak grup sudah sangat baik karena pemanfaatan tarif UMKM." : 
                                "Pertimbangkan memecah unit bisnis baru jika omzet mendekati 4.8M untuk memanfaatkan tarif UMKM."}
                        </li>
                        <li>Pusatkan biaya operasional (seperti HR, Finance, IT) di entitas dengan profit tertinggi untuk memaksimalkan pengurang pajak.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
