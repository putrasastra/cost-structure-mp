import { useState } from 'react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { ArrowRight, PieChart } from 'lucide-react';

export function PersonalCorporateHarmonization() {
  const [corporateProfit, setCorporateProfit] = useState<number>(2000000000);
  const [ownerSalary, setOwnerSalary] = useState<number>(600000000); // 50jt/mo
  const [dividendPayoutRatio, setDividendPayoutRatio] = useState<number>(80); // % of net profit
  
  const calculate = () => {
    // Corporate Side
    const corporateTaxableIncome = Math.max(0, corporateProfit - ownerSalary);
    const corporateTax = corporateTaxableIncome * 0.22;
    const netProfit = corporateTaxableIncome - corporateTax;
    
    // Dividend Side
    const dividendAmount = netProfit * (dividendPayoutRatio / 100);
    const dividendTax = dividendAmount * 0.1; // 10% Final
    const retainedEarnings = netProfit - dividendAmount;

    // Personal Side (Salary)
    // Simplified PPh 21 Calculation (No PTKP for simplicity in overview, or assume high bracket)
    // Using rough effective rate for estimation:
    // 0-60: 5%, 60-250: 15%, 250-500: 25%, 500-5M: 30%, >5M: 35%
    // 600jt salary -> ~120jt tax roughly (20%)
    const personalTax = calculatePPh21(ownerSalary);
    const netSalary = ownerSalary - personalTax;

    const totalTax = corporateTax + dividendTax + personalTax;
    const totalOwnerIncome = netSalary + (dividendAmount - dividendTax);
    const effectiveTaxRate = (totalTax / corporateProfit) * 100;

    return {
        corporateTax,
        dividendTax,
        personalTax,
        totalTax,
        totalOwnerIncome,
        effectiveTaxRate,
        retainedEarnings
    };
  };

  const calculatePPh21 = (grossIncome: number) => {
    // Simple progressive calculation ignoring PTKP/Biaya Jabatan details for high-level view
    let tax = 0;
    let remaining = grossIncome - 54000000; // Assume PTKP TK/0
    if (remaining <= 0) return 0;

    const brackets = [
        { limit: 60000000, rate: 0.05 },
        { limit: 190000000, range: 250000000, rate: 0.15 }, // up to 250
        { limit: 250000000, range: 500000000, rate: 0.25 }, // up to 500
        { limit: 4500000000, range: 5000000000, rate: 0.30 }, // up to 5B
        { limit: Infinity, rate: 0.35 }
    ];

    let currentLimit = 0;
    // 0 - 60
    let taxable = Math.min(remaining, 60000000);
    tax += taxable * 0.05;
    remaining -= taxable;

    // 60 - 250 (Range 190)
    if (remaining > 0) {
        taxable = Math.min(remaining, 190000000);
        tax += taxable * 0.15;
        remaining -= taxable;
    }

    // 250 - 500 (Range 250)
    if (remaining > 0) {
        taxable = Math.min(remaining, 250000000);
        tax += taxable * 0.25;
        remaining -= taxable;
    }

    // 500 - 5M (Range 4.5B)
    if (remaining > 0) {
        taxable = Math.min(remaining, 4500000000);
        tax += taxable * 0.30;
        remaining -= taxable;
    }

    // > 5M
    if (remaining > 0) {
        tax += remaining * 0.35;
    }

    return tax;
  };

  const result = calculate();

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
                <h3 className="text-lg font-medium text-slate-900">Input Finansial</h3>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700">Total Laba Operasional (Sebelum Gaji Owner)</label>
                    <CurrencyInput value={corporateProfit} onChange={setCorporateProfit} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Gaji Owner (Setahun)</label>
                    <CurrencyInput value={ownerSalary} onChange={setOwnerSalary} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Rasio Pembagian Dividen ({dividendPayoutRatio}%)</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={dividendPayoutRatio}
                        onChange={(e) => setDividendPayoutRatio(Number(e.target.value))}
                        className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                    <p className="text-xs text-slate-500 mt-1">Persentase Laba Bersih yang dibagikan ke pemegang saham.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-orange-600" />
                    Total Tax Burden
                </h3>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Pajak Korporasi (PPh Badan)</span>
                        <span className="font-medium text-red-600">Rp {result.corporateTax.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Pajak Pribadi (PPh 21 Gaji)</span>
                        <span className="font-medium text-red-600">Rp {result.personalTax.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Pajak Dividen (10%)</span>
                        <span className="font-medium text-red-600">Rp {result.dividendTax.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="border-t border-slate-200 pt-3 mt-2">
                         <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-800">Total Pajak Dibayar</span>
                            <span className="font-bold text-red-700 text-lg">Rp {result.totalTax.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Effective Tax Rate</span>
                            <span className="font-bold text-slate-700">{result.effectiveTaxRate.toFixed(2)}%</span>
                        </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg mt-4 border border-green-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-800">Total Net Income Owner</span>
                            <span className="font-bold text-green-700 text-lg">Rp {result.totalOwnerIncome.toLocaleString('id-ID')}</span>
                        </div>
                         <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-green-600">Laba Ditahan Perusahaan</span>
                            <span className="text-xs font-medium text-green-600">Rp {result.retainedEarnings.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
