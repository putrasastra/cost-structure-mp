import { useState, useEffect } from 'react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { ArrowRight, TrendingDown } from 'lucide-react';

export function PPhBadanSimulator() {
  const [revenue, setRevenue] = useState<number>(5000000000);
  const [grossProfit, setGrossProfit] = useState<number>(2000000000);
  
  // Simulation Parameters
  const [marketingIncrease, setMarketingIncrease] = useState<number>(0);
  const [assetPurchase, setAssetPurchase] = useState<number>(0);
  const [fiscalCorrection, setFiscalCorrection] = useState<number>(0); // Positive adds to tax base

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    calculate();
  }, [revenue, grossProfit, marketingIncrease, assetPurchase, fiscalCorrection]);

  const calculate = () => {
    // Helper to calculate Tax with Pasal 31E Facility
    const calculateCorporateTax = (taxableIncome: number, totalRevenue: number) => {
        if (taxableIncome <= 0) return 0;
        
        // If revenue > 50B: Flat 22%
        if (totalRevenue > 50000000000) {
            return taxableIncome * 0.22;
        }

        // If revenue <= 4.8B:
        // Technically this often falls under Final Tax (UMKM), but if choosing General Rate, 
        // they get 50% discount on ALL taxable income (since 4.8B covers 100% of revenue).
        // Rate: 11% (50% x 22%)
        if (totalRevenue <= 4800000000) {
            return taxableIncome * 0.11;
        }

        // If 4.8B < revenue <= 50B:
        // Facility Portion: (4.8B / TotalRevenue) * TaxableIncome -> Rate 11%
        // Non-Facility Portion: Remaining TaxableIncome -> Rate 22%
        const facilityPortion = (4800000000 / totalRevenue) * taxableIncome;
        const nonFacilityPortion = taxableIncome - facilityPortion;
        
        return (facilityPortion * 0.11) + (nonFacilityPortion * 0.22);
    };

    // Base Calculation
    const baseTaxableIncome = grossProfit;
    const baseTax = calculateCorporateTax(baseTaxableIncome, revenue);

    // Simulated Calculation
    // Asset Purchase -> Depreciation (Assume 25% per year - Category 1)
    const depreciation = assetPurchase * 0.25;
    
    const simulatedTaxableIncome = grossProfit - marketingIncrease - depreciation + fiscalCorrection;
    const simulatedTax = calculateCorporateTax(simulatedTaxableIncome, revenue);

    const taxSaving = baseTax - simulatedTax;
    const effectiveRate = baseTaxableIncome > 0 ? (baseTax / baseTaxableIncome) * 100 : 0;

    setResult({
        baseTax,
        simulatedTax,
        taxSaving,
        depreciation,
        effectiveRate
    });
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Parameter Keuangan Saat Ini</h3>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700">Omzet Usaha (Peredaran Bruto)</label>
                    <CurrencyInput value={revenue} onChange={setRevenue} />
                    <p className="text-xs text-slate-500 mt-1">Digunakan untuk menentukan fasilitas pengurangan tarif (Pasal 31E).</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Laba Komersial (Sebelum Pajak)</label>
                    <CurrencyInput value={grossProfit} onChange={setGrossProfit} />
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <h3 className="text-lg font-medium text-slate-900 mb-3">Skenario Perubahan</h3>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tambah Biaya Marketing</label>
                            <CurrencyInput value={marketingIncrease} onChange={setMarketingIncrease} />
                            <p className="text-xs text-slate-500 mt-1">Biaya promosi yang memiliki daftar nominatif (Deductible).</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Beli Aset Baru (Capex)</label>
                            <CurrencyInput value={assetPurchase} onChange={setAssetPurchase} />
                            <p className="text-xs text-slate-500 mt-1">Asumsi depresiasi Garis Lurus 4 Tahun (25%/tahun).</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Koreksi Fiskal Positif</label>
                            <CurrencyInput value={fiscalCorrection} onChange={setFiscalCorrection} />
                            <p className="text-xs text-slate-500 mt-1">Biaya yang tidak boleh dibebankan (Non-Deductible).</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Dampak Pajak</h3>
                
                {result && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                            <div>
                                <p className="text-sm text-slate-600">PPh Badan Awal</p>
                                <p className="text-[10px] text-slate-400">Tarif Efektif: {result.effectiveRate.toFixed(2)}%</p>
                            </div>
                            <span className="font-medium">Rp {result.baseTax.toLocaleString('id-ID')}</span>
                        </div>

                        <div className="flex justify-center">
                            <ArrowRight className="h-5 w-5 text-slate-400 transform rotate-90 md:rotate-0" />
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
                            <span className="text-sm text-slate-600">PPh Badan Simulasi</span>
                            <span className="font-bold text-blue-700">Rp {result.simulatedTax.toLocaleString('id-ID')}</span>
                        </div>

                        <div className={`p-4 rounded-lg flex items-center ${result.taxSaving > 0 ? 'bg-green-50 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                            <TrendingDown className="h-5 w-5 mr-3" />
                            <div>
                                <p className="text-sm font-medium">
                                    {result.taxSaving > 0 ? 'Potensi Penghematan Pajak:' : 'Selisih Pajak:'}
                                </p>
                                <p className="text-xl font-bold">Rp {Math.abs(result.taxSaving).toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        <div className="text-sm text-slate-600 mt-4">
                            <p className="font-medium mb-2">Analisis:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                {marketingIncrease > 0 && (
                                    <li>
                                        Meningkatkan marketing sebesar Rp {marketingIncrease.toLocaleString('id-ID')} menurunkan pajak Rp {(marketingIncrease * 0.22).toLocaleString('id-ID')}.
                                    </li>
                                )}
                                {assetPurchase > 0 && (
                                    <li>
                                        Pembelian aset Rp {assetPurchase.toLocaleString('id-ID')} menciptakan beban penyusutan Rp {result.depreciation.toLocaleString('id-ID')}/tahun, menghemat pajak Rp {(result.depreciation * 0.22).toLocaleString('id-ID')}.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}