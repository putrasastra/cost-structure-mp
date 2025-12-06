import { useState } from 'react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { TrendingDown, TrendingUp } from 'lucide-react';

type ActionType = 'buy_asset' | 'sell_shares' | 'new_company' | 'merger';

export function CorporateActionSimulator() {
  const [actionType, setActionType] = useState<ActionType>('buy_asset');
  
  // Params
  const [assetValue, setAssetValue] = useState<number>(2000000000);
  const [shareValue, setShareValue] = useState<number>(5000000000);
  const [newCompanyCapital, setNewCompanyCapital] = useState<number>(1000000000);
  
  const renderSimulation = () => {
    switch (actionType) {
        case 'buy_asset':
            const depreciationYearly = assetValue * 0.25; // Category 1 (4 years)
            const taxSavingYearly = depreciationYearly * 0.22;
            return (
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2">Simulasi Pembelian Aset (Capex)</h4>
                        <p className="text-sm text-blue-800 mb-4">
                            Pembelian aset tetap bukan biaya sekaligus (expense), melainkan dikapitalisasi dan disusutkan.
                        </p>
                        <ul className="list-disc pl-5 text-sm text-blue-800 space-y-2">
                            <li>Nilai Aset: <strong>Rp {assetValue.toLocaleString()}</strong></li>
                            <li>Estimasi Penyusutan (Garis Lurus 4 Thn): <strong>Rp {depreciationYearly.toLocaleString()}/tahun</strong></li>
                            <li>Penghematan PPh Badan per Tahun: <strong>Rp {taxSavingYearly.toLocaleString()}</strong></li>
                            <li>Total Penghematan Pajak (4 Thn): <strong>Rp {(taxSavingYearly * 4).toLocaleString()}</strong></li>
                        </ul>
                    </div>
                    <div className="flex items-start p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg">
                        <span className="mr-2">⚠️</span>
                        Pastikan aset digunakan untuk operasional bisnis agar penyusutan dapat dibiayakan (Deductible).
                    </div>
                </div>
            );
        
        case 'sell_shares':
            const founderTax = shareValue * 0.001; // 0.1% Final for Founder on IDX (Assuming Public) - Simplified logic
            // If private company: Capital Gain Tax (Progressive Rate for Individual)
            const capitalGainTax = (shareValue * 0.5) * 0.30; // Rough estimate: 50% gain, 30% tax bracket
            return (
                <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <h4 className="font-bold text-purple-900 mb-2">Simulasi Penjualan Saham (Private Company)</h4>
                        <p className="text-sm text-purple-800 mb-4">
                            Keuntungan penjualan saham (Capital Gain) pada perusahaan tertutup dikenakan tarif PPh Progresif.
                        </p>
                        <ul className="list-disc pl-5 text-sm text-purple-800 space-y-2">
                            <li>Nilai Transaksi: <strong>Rp {shareValue.toLocaleString()}</strong></li>
                            <li>Estimasi PPh Terutang (Asumsi Gain 50% & Bracket 30%): <strong>Rp {capitalGainTax.toLocaleString()}</strong></li>
                        </ul>
                    </div>
                    <div className="flex items-start p-3 bg-green-50 text-green-800 text-sm rounded-lg">
                        <TrendingDown className="h-4 w-4 mr-2 mt-0.5" />
                        Tips: Pertimbangkan restrukturisasi kepemilikan melalui Holding Company untuk efisiensi pajak jangka panjang.
                    </div>
                </div>
            );

        case 'new_company':
            return (
                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h4 className="font-bold text-green-900 mb-2">Pendirian PT Baru (Spin-off)</h4>
                        <p className="text-sm text-green-800 mb-4">
                            Memisahkan unit bisnis ke PT baru dapat memanfaatkan tarif PPh Final UMKM (0.5%) selama 3-4 tahun pertama jika omzet di bawah 4.8M.
                        </p>
                        <ul className="list-disc pl-5 text-sm text-green-800 space-y-2">
                            <li>Modal Disetor: <strong>Rp {newCompanyCapital.toLocaleString()}</strong></li>
                            <li>Potensi Hemat Pajak: Selisih tarif 22% (Normal) vs 0.5% (UMKM) dari Omzet.</li>
                        </ul>
                    </div>
                </div>
            );
        
        case 'merger':
             return (
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-2">Merger & Akuisisi</h4>
                        <p className="text-sm text-slate-800 mb-4">
                            Penggunaan Nilai Buku (Pooling of Interest) dalam pengalihan harta dapat menghindari PPh atas keuntungan pengalihan harta (Capital Gain), namun memerlukan persetujuan DJP.
                        </p>
                    </div>
                </div>
            );
    }
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Pilih Aksi Korporasi</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => setActionType('buy_asset')}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 ${actionType === 'buy_asset' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
                    >
                        <span className="font-medium block">Beli Aset Besar</span>
                        <span className="text-xs text-slate-500">Simulasi depresiasi & cashflow</span>
                    </button>
                    <button
                        onClick={() => setActionType('sell_shares')}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 ${actionType === 'sell_shares' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
                    >
                        <span className="font-medium block">Jual Saham Pribadi (Exit)</span>
                        <span className="text-xs text-slate-500">Estimasi Capital Gain Tax</span>
                    </button>
                    <button
                        onClick={() => setActionType('new_company')}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 ${actionType === 'new_company' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
                    >
                        <span className="font-medium block">Buka PT Baru</span>
                        <span className="text-xs text-slate-500">Manfaat tarif UMKM</span>
                    </button>
                    <button
                        onClick={() => setActionType('merger')}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 ${actionType === 'merger' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
                    >
                        <span className="font-medium block">Merger / Akuisisi</span>
                        <span className="text-xs text-slate-500">Nilai Buku vs Nilai Pasar</span>
                    </button>
                </div>
            </div>

            <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
                    <div className="mb-6 pb-6 border-b border-slate-100">
                         <h3 className="text-lg font-medium text-slate-900 mb-4">Input Parameter</h3>
                         {actionType === 'buy_asset' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nilai Pembelian Aset</label>
                                <CurrencyInput value={assetValue} onChange={setAssetValue} />
                            </div>
                         )}
                         {actionType === 'sell_shares' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nilai Penjualan Saham</label>
                                <CurrencyInput value={shareValue} onChange={setShareValue} />
                            </div>
                         )}
                         {actionType === 'new_company' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Modal Disetor</label>
                                <CurrencyInput value={newCompanyCapital} onChange={setNewCompanyCapital} />
                            </div>
                         )}
                         {actionType === 'merger' && (
                            <p className="text-slate-500 text-sm">Simulasi Merger bersifat kualitatif. Silakan hubungi konsultan untuk valuasi detail.</p>
                         )}
                    </div>

                    {renderSimulation()}
                </div>
            </div>
        </div>
    </div>
  );
}
