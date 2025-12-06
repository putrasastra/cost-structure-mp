import { useState } from 'react';

export function PpnCalculator() {
  const [mode, setMode] = useState<'transaction' | 'credit'>('transaction');

  // Transaction Mode State
  const [price, setPrice] = useState<number>(0);
  const [includeTax, setIncludeTax] = useState<boolean>(false);
  const [isExport, setIsExport] = useState<boolean>(false);

  // Credit Mode State
  const [outputTax, setOutputTax] = useState<number>(0);
  const [inputTax, setInputTax] = useState<number>(0);

  // Transaction Calculation
  const calculateTransaction = () => {
    if (isExport) {
        return { dpp: price, ppn: 0, total: price };
    }
    
    let dpp = 0;
    let ppn = 0;
    
    if (includeTax) {
        dpp = Math.round(price * 100 / 111);
        ppn = price - dpp;
    } else {
        dpp = price;
        ppn = Math.round(price * 0.11);
    }
    
    return { dpp, ppn, total: dpp + ppn };
  };

  const transactionResult = calculateTransaction();
  const creditResult = outputTax - inputTax;

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => setMode('transaction')}
          className={`pb-2 text-sm font-medium transition-colors ${
            mode === 'transaction' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Hitung PPN Transaksi
        </button>
        <button
          onClick={() => setMode('credit')}
          className={`pb-2 text-sm font-medium transition-colors ${
            mode === 'credit' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Kredit Pajak Masukan
        </button>
      </div>

      {mode === 'transaction' ? (
        <div className="space-y-6">
           <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm text-slate-700">
                    <input 
                        type="checkbox" 
                        checked={isExport} 
                        onChange={(e) => setIsExport(e.target.checked)}
                        className="rounded border-slate-300"
                    />
                    <span>Transaksi Ekspor (0%)</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-slate-700">
                    <input 
                        type="checkbox" 
                        checked={includeTax} 
                        onChange={(e) => setIncludeTax(e.target.checked)}
                        className="rounded border-slate-300"
                        disabled={isExport}
                    />
                    <span>Harga Termasuk PPN</span>
                </label>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nilai Transaksi</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md"
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-slate-600">DPP (Dasar Pengenaan Pajak)</span>
                <span className="font-mono font-medium">{transactionResult.dpp.toLocaleString('id-ID')}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-600">PPN ({isExport ? '0%' : '11%'})</span>
                <span className="font-mono font-bold text-blue-600">{transactionResult.ppn.toLocaleString('id-ID')}</span>
             </div>
             <div className="flex justify-between text-sm border-t border-slate-200 pt-2 font-semibold">
                <span className="text-slate-800">Total Tagihan</span>
                <span className="font-mono text-slate-800">{transactionResult.total.toLocaleString('id-ID')}</span>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">PPN Keluaran (Dipungut)</label>
              <input
                type="number"
                value={outputTax}
                onChange={(e) => setOutputTax(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">PPN Masukan (Dapat Dikreditkan)</label>
              <input
                type="number"
                value={inputTax}
                onChange={(e) => setInputTax(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md"
                placeholder="0"
              />
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${creditResult > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
             <div className="text-center">
                <p className="text-sm font-medium text-slate-600 mb-1">Status Akhir Masa</p>
                <h3 className={`text-2xl font-bold ${creditResult > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                    {creditResult > 0 ? 'KURANG BAYAR' : creditResult < 0 ? 'LEBIH BAYAR' : 'NIHIL'}
                </h3>
                <p className="font-mono text-xl mt-2 font-semibold text-slate-800">
                    Rp {Math.abs(creditResult).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                    {creditResult > 0 
                        ? 'Harus disetorkan ke kas negara sebelum lapor SPT Masa PPN.' 
                        : creditResult < 0 
                            ? 'Dapat dikompensasikan ke masa pajak berikutnya atau direstitusi.' 
                            : 'Tidak ada setoran PPN.'}
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
