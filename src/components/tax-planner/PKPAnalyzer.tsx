import { useState } from 'react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Building2, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export function PKPAnalyzer() {
  const [revenue, setRevenue] = useState<number>(2000000000); // 2 Miliar
  const [b2bPercentage, setB2bPercentage] = useState<number>(30);
  const [inputTaxRatio, setInputTaxRatio] = useState<number>(60); // % of expenses that have VAT invoice
  const [expenseRatio, setExpenseRatio] = useState<number>(80); // % of revenue

  const analyze = () => {
    const isMandatory = revenue >= 4800000000;
    const potentialOutputTax = revenue * 0.11;
    
    const expenses = revenue * (expenseRatio / 100);
    const vatableExpenses = expenses * (inputTaxRatio / 100);
    const potentialInputTax = vatableExpenses * 0.11;
    
    const netVatPayable = Math.max(0, potentialOutputTax - potentialInputTax);
    const restitution = Math.max(0, potentialInputTax - potentialOutputTax);

    // Scoring Logic
    let score = 0; // Higher = PKP is better
    let reasons = [];

    if (isMandatory) {
        return {
            recommendation: "WAJIB PKP",
            color: "red",
            reasons: ["Omzet tahunan melebihi Rp 4.8 Miliar. Anda wajib mendaftar PKP."],
            details: { netVatPayable, restitution, potentialOutputTax, potentialInputTax }
        };
    }

    if (b2bPercentage > 70) {
        score += 5;
        reasons.push("Sebagian besar klien Anda adalah B2B (Perusahaan) yang membutuhkan Faktur Pajak.");
    } else if (b2bPercentage > 40) {
        score += 2;
        reasons.push("Anda memiliki porsi klien B2B yang signifikan.");
    }

    if (restitution > 0) {
        score += 5;
        reasons.push(`Anda berpotensi Lebih Bayar (Restitusi) sebesar Rp ${restitution.toLocaleString('id-ID')} karena Pajak Masukan lebih besar.`);
    } else {
        reasons.push(`Anda harus menyetor PPN (Kurang Bayar) sekitar Rp ${netVatPayable.toLocaleString('id-ID')} per tahun.`);
        if (netVatPayable > 50000000) score -= 2; // High cash outflow
    }

    return {
        recommendation: score > 3 ? "DIREKOMENDASIKAN PKP" : "TIDAK PERLU PKP",
        color: score > 3 ? "green" : "blue",
        reasons,
        details: { netVatPayable, restitution, potentialOutputTax, potentialInputTax }
    };
  };

  const result = analyze();

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Profil Bisnis</h3>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700">Omzet Tahunan</label>
                    <CurrencyInput value={revenue} onChange={setRevenue} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Persentase Klien B2B (Perusahaan)</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={b2bPercentage}
                            onChange={(e) => setB2bPercentage(Number(e.target.value))}
                            className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium w-12">{b2bPercentage}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Klien B2B biasanya meminta Faktur Pajak.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Rasio Biaya Ber-PPN</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={inputTaxRatio}
                            onChange={(e) => setInputTaxRatio(Number(e.target.value))}
                            className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium w-12">{inputTaxRatio}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Berapa persen biaya operasional Anda yang memiliki Faktur Pajak Masukan?</p>
                </div>
            </div>

            <div className={`p-6 rounded-xl border-2 ${
                result.color === 'red' ? 'border-red-200 bg-red-50' :
                result.color === 'green' ? 'border-green-200 bg-green-50' :
                'border-blue-200 bg-blue-50'
            }`}>
                <div className="flex items-center mb-4">
                    {result.color === 'red' ? <AlertTriangle className="h-8 w-8 text-red-600 mr-3" /> :
                     result.color === 'green' ? <CheckCircle className="h-8 w-8 text-green-600 mr-3" /> :
                     <Building2 className="h-8 w-8 text-blue-600 mr-3" />}
                    <h3 className={`text-xl font-bold ${
                        result.color === 'red' ? 'text-red-800' :
                        result.color === 'green' ? 'text-green-800' :
                        'text-blue-800'
                    }`}>
                        {result.recommendation}
                    </h3>
                </div>

                <ul className="space-y-2 mb-6">
                    {result.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start text-sm text-slate-700">
                            <span className="mr-2">•</span>
                            {reason}
                        </li>
                    ))}
                </ul>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-medium text-slate-900 mb-3">Rincian Perhitungan PPN</h4>
                    
                    <div className="space-y-2 mb-4 border-b border-slate-100 pb-3">
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-600">PPN Keluaran (11% x Omzet)</span>
                            <span className="font-medium text-slate-900">Rp {result.details.potentialOutputTax.toLocaleString('id-ID')}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-600">PPN Masukan (Kredit Pajak)</span>
                            <span className="font-medium text-slate-900">- Rp {result.details.potentialInputTax.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="flex justify-between text-sm mb-1">
                        <span>Potensi Kurang Bayar</span>
                        <span className="font-medium text-red-600">Rp {result.details.netVatPayable.toLocaleString('id-ID')} / tahun</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Potensi Restitusi</span>
                        <span className="font-medium text-green-600">Rp {result.details.restitution.toLocaleString('id-ID')} / tahun</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
