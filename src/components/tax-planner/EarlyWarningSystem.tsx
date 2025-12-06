import { useState } from 'react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function EarlyWarningSystem() {
  const [revenue, setRevenue] = useState<number>(5000000000);
  const [inputTax, setInputTax] = useState<number>(600000000); // PPN Masukan
  const [outputTax, setOutputTax] = useState<number>(550000000); // PPN Keluaran
  const [entertainmentExpense, setEntertainmentExpense] = useState<number>(100000000);
  const [hasNominativeList, setHasNominativeList] = useState<boolean>(false);

  const analyzeRisks = () => {
    const risks = [];

    // 1. Restitution Risk (More Input Tax than Output Tax)
    if (inputTax > outputTax) {
        risks.push({
            level: 'high',
            title: 'Risiko Pemeriksaan Restitusi',
            desc: `PPN Masukan (Rp ${inputTax.toLocaleString()}) lebih besar dari PPN Keluaran (Rp ${outputTax.toLocaleString()}). Mengajukan restitusi seringkali memicu pemeriksaan pajak menyeluruh (All Taxes).`
        });
    }

    // 2. Entertainment Expense Risk
    const entRatio = (entertainmentExpense / revenue) * 100;
    if (entRatio > 5 && !hasNominativeList) {
        risks.push({
            level: 'high',
            title: 'Biaya Entertainment Tidak Wajar',
            desc: `Rasio biaya entertainment (${entRatio.toFixed(1)}%) cukup tinggi dan Anda belum membuat Daftar Nominatif. Biaya ini berisiko dikoreksi fiskal positif 100%.`
        });
    } else if (!hasNominativeList && entertainmentExpense > 0) {
        risks.push({
            level: 'medium',
            title: 'Daftar Nominatif Belum Ada',
            desc: 'Biaya entertainment memerlukan Daftar Nominatif (Nama, NPWP, Jumlah) agar bisa dibiayakan secara fiskal.'
        });
    }

    // 3. Gross Margin Check (Simplified)
    // If profit margin is too low compared to industry avg (we assume 5% threshold here)
    // This is hard to calculate without COGS input, omitting for now or keeping simple placeholder logic if we had profit input.

    return risks;
  };

  const risks = analyzeRisks();

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
                <h3 className="text-lg font-medium text-slate-900">Indikator Risiko</h3>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700">Omzet Usaha</label>
                    <CurrencyInput value={revenue} onChange={setRevenue} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Total PPN Masukan (Beli)</label>
                    <CurrencyInput value={inputTax} onChange={setInputTax} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Total PPN Keluaran (Jual)</label>
                    <CurrencyInput value={outputTax} onChange={setOutputTax} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Biaya Entertainment / Jamuan</label>
                    <CurrencyInput value={entertainmentExpense} onChange={setEntertainmentExpense} />
                </div>

                <div className="flex items-center">
                    <input
                      id="nominative-list"
                      type="checkbox"
                      checked={hasNominativeList}
                      onChange={(e) => setHasNominativeList(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-2 border-slate-400 rounded"
                    />
                    <label htmlFor="nominative-list" className="ml-2 block text-sm text-slate-900">
                      Sudah membuat Daftar Nominatif untuk biaya entertainment
                    </label>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Hasil Deteksi Risiko</h3>
                
                <div className="space-y-4">
                    {risks.length === 0 ? (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-green-900">Risiko Rendah</h4>
                                <p className="text-sm text-green-700 mt-1">Berdasarkan parameter yang dimasukkan, tidak ditemukan indikator risiko pajak yang signifikan.</p>
                            </div>
                        </div>
                    ) : (
                        risks.map((risk, idx) => (
                            <div key={idx} className={`p-4 rounded-lg border flex items-start ${
                                risk.level === 'high' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
                            }`}>
                                <AlertTriangle className={`h-6 w-6 mr-3 flex-shrink-0 ${
                                    risk.level === 'high' ? 'text-red-600' : 'text-yellow-600'
                                }`} />
                                <div>
                                    <h4 className={`font-medium ${
                                        risk.level === 'high' ? 'text-red-900' : 'text-yellow-900'
                                    }`}>
                                        {risk.title}
                                    </h4>
                                    <p className={`text-sm mt-1 ${
                                        risk.level === 'high' ? 'text-red-700' : 'text-yellow-700'
                                    }`}>
                                        {risk.desc}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}

                    <div className="mt-4 bg-blue-50 p-4 rounded-lg flex items-start text-sm text-blue-800">
                        <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                        <p>
                            Sistem ini hanya mendeteksi risiko awal (Red Flag) berdasarkan rasio umum. Konsultasikan dengan konsultan pajak untuk analisis mendalam.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
