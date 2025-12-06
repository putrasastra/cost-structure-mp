import { useState, useEffect } from 'react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

export function DividendSalaryOptimizer() {
  const [revenue, setRevenue] = useState<number>(2000000000); // 2 Miliar Omzet
  const [profit, setProfit] = useState<number>(1000000000); // 1 Miliar Laba
  const [ptkp, setPtkp] = useState<number>(54000000); // TK/0
  const [salaryAmount, setSalaryAmount] = useState<number>(0); // Monthly
  const [dividendTaxRate, setDividendTaxRate] = useState<number>(10); // 0 or 10
  const [useUmkmRate, setUseUmkmRate] = useState<boolean>(false);

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    calculate();
  }, [revenue, profit, ptkp, salaryAmount, dividendTaxRate, useUmkmRate]);

  const calculateTaxPPh21 = (taxableIncome: number) => {
    if (taxableIncome <= 0) return 0;
    let tax = 0;
    let remaining = taxableIncome;

    // Layer 1: 5% up to 60jt
    const layer1 = Math.min(remaining, 60000000);
    tax += layer1 * 0.05;
    remaining -= layer1;

    // Layer 2: 15% up to 250jt (190jt range)
    if (remaining > 0) {
        const layer2 = Math.min(remaining, 190000000);
        tax += layer2 * 0.15;
        remaining -= layer2;
    }

    // Layer 3: 25% up to 500jt (250jt range)
    if (remaining > 0) {
        const layer3 = Math.min(remaining, 250000000);
        tax += layer3 * 0.25;
        remaining -= layer3;
    }

    // Layer 4: 30% up to 5M (4.5M range)
    if (remaining > 0) {
        const layer4 = Math.min(remaining, 4500000000);
        tax += layer4 * 0.30;
        remaining -= layer4;
    }

    // Layer 5: 35% above 5M
    if (remaining > 0) {
        tax += remaining * 0.35;
    }

    return tax;
  };

  const calculateCorporateTaxNormal = (taxableIncome: number, totalRevenue: number) => {
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

  const calculate = () => {
    // Scenario: Current Input
    const yearlySalary = salaryAmount * 12;
    // Biaya Jabatan (Max 6jt/year)
    const biayaJabatan = Math.min(yearlySalary * 0.05, 6000000);
    const netSalary = yearlySalary - biayaJabatan;
    const pkp = Math.max(0, netSalary - ptkp);
    const pph21 = calculateTaxPPh21(pkp);

    // Corporate Tax Base
    const companyProfitBeforeTax = Math.max(0, profit - yearlySalary);
    let companyTax = 0;

    if (useUmkmRate) {
        // UMKM Tax is 0.5% of GROSS REVENUE (Omzet)
        // IMPORTANT: Salary expense does NOT reduce the tax base for UMKM Final Tax.
        // However, user input 'profit' might be accounting profit.
        // For UMKM, tax is strictly on Revenue.
        // But 'companyProfit' here represents the money left in company.
        // Tax amount = Revenue * 0.5%
        companyTax = revenue * 0.005;
    } else {
        // Normal Rate with Pasal 31E
        companyTax = calculateCorporateTaxNormal(companyProfitBeforeTax, revenue);
    }

    const netCompanyProfit = companyProfitBeforeTax - companyTax;
    const dividendAmount = Math.max(0, netCompanyProfit); // Assume all distributed
    const dividendTax = dividendAmount * (dividendTaxRate / 100);
    
    const totalTax = pph21 + companyTax + dividendTax;
    const takeHomePay = (yearlySalary - pph21) + (dividendAmount - dividendTax);

    setResult({
        yearlySalary,
        pph21,
        companyTax,
        dividendTax,
        totalTax,
        takeHomePay
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Parameter Simulasi</h3>
            
            <div>
                <label className="block text-sm font-medium text-slate-700">Omzet Usaha (Peredaran Bruto)</label>
                <CurrencyInput value={revenue} onChange={setRevenue} />
                <p className="text-xs text-slate-500 mt-1">Basis perhitungan PPh Final UMKM atau Fasilitas Pasal 31E.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Laba Sebelum Gaji Owner (per Tahun)</label>
                <CurrencyInput value={profit} onChange={setProfit} />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Gaji Owner (per Bulan)</label>
                <CurrencyInput value={salaryAmount} onChange={setSalaryAmount} />
                <p className="text-xs text-slate-500 mt-1">Set ke 0 untuk simulasi "Full Dividen"</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Status PTKP</label>
                <select 
                  value={ptkp}
                  onChange={(e) => setPtkp(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-2 border-slate-400 shadow-sm focus:border-primary focus:ring focus:ring-primary sm:text-sm"
                >
                  <option value={54000000}>TK/0 (Sendiri) - Rp 54jt</option>
                  <option value={58500000}>TK/1 (1 Tanggungan) - Rp 58.5jt</option>
                  <option value={63000000}>K/0 (Kawin) - Rp 58.5jt</option>
                  <option value={67500000}>K/1 (Kawin + 1) - Rp 63jt</option>
                  <option value={72000000}>K/2 (Kawin + 2) - Rp 67.5jt</option>
                </select>
            </div>

            <div className="flex items-center space-x-4">
                 <div className="flex items-center">
                    <input
                      id="umkm-rate"
                      type="checkbox"
                      checked={useUmkmRate}
                      onChange={(e) => setUseUmkmRate(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-2 border-slate-400 rounded"
                    />
                    <label htmlFor="umkm-rate" className="ml-2 block text-sm text-slate-900">
                      Tarif UMKM (0.5%)
                    </label>
                 </div>
                 <div className="flex items-center">
                    <input
                      id="invest-dividend"
                      type="checkbox"
                      checked={dividendTaxRate === 0}
                      onChange={(e) => setDividendTaxRate(e.target.checked ? 0 : 10)}
                      className="h-4 w-4 text-primary focus:ring-primary border-2 border-slate-400 rounded"
                    />
                    <label htmlFor="invest-dividend" className="ml-2 block text-sm text-slate-900">
                      Dividen Diinvestasikan (Bebas Pajak)
                    </label>
                 </div>
            </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Hasil Perhitungan</h3>
            {result && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-slate-500">Pajak Perusahaan</p>
                            <p className="font-semibold text-red-600">Rp {result.companyTax.toLocaleString('id-ID')}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{(profit > 0 ? (result.companyTax / profit * 100) : 0).toFixed(1)}% dari Laba</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-slate-500">Pajak Pribadi (Gaji)</p>
                            <p className="font-semibold text-red-600">Rp {result.pph21.toLocaleString('id-ID')}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{(profit > 0 ? (result.pph21 / profit * 100) : 0).toFixed(1)}% dari Laba</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-slate-500">Pajak Dividen</p>
                            <p className="font-semibold text-red-600">Rp {result.dividendTax.toLocaleString('id-ID')}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{(profit > 0 ? (result.dividendTax / profit * 100) : 0).toFixed(1)}% dari Laba</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-green-500">
                            <p className="text-xs text-slate-500">Total Take Home Pay</p>
                            <p className="font-semibold text-green-700">Rp {result.takeHomePay.toLocaleString('id-ID')}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">Total Beban Pajak</span>
                            <span className="font-bold text-red-600 text-lg">Rp {result.totalTax.toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 text-right">
                            {(result.totalTax / profit * 100).toFixed(2)}% dari Total Laba
                        </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex items-start">
                        <TrendingUp className="h-5 w-5 mr-2 flex-shrink-0" />
                        <div>
                            <span className="font-semibold">Rekomendasi:</span>
                            <p className="mt-1">
                                {useUmkmRate ? 
                                    "Menggunakan PPh Final UMKM (0.5% dari Omzet). Perhatikan bahwa Gaji Owner TIDAK mengurangi dasar pengenaan pajak (Omzet), namun mengurangi Laba Ditahan untuk dividen." :
                                    (revenue <= 4800000000 ? 
                                        "Anda mendapatkan Fasilitas Pasal 31E (Diskon Tarif 50% menjadi 11%) karena omzet di bawah Rp 4.8 Miliar." :
                                        (revenue <= 50000000000 ? 
                                            "Anda mendapatkan Fasilitas Pasal 31E sebagian (Tarif campuran 11% & 22%) karena omzet di antara Rp 4.8 M - Rp 50 M." :
                                            "Menggunakan Tarif Normal Flat 22% karena omzet di atas Rp 50 Miliar."))
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
