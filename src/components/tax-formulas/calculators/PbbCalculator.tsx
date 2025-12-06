import { useState } from 'react';

export function PbbCalculator() {
  const [landArea, setLandArea] = useState<number>(0);
  const [buildingArea, setBuildingArea] = useState<number>(0);
  const [njopLand, setNjopLand] = useState<number>(0);
  const [njopBuilding, setNjopBuilding] = useState<number>(0);
  const [njoptkp, setNjoptkp] = useState<number>(12000000); // Default 12jt usually
  const [regionRateType, setRegionRateType] = useState<'flat' | 'progressive'>('progressive');
  
  // Results
  const totalNjopLand = landArea * njopLand;
  const totalNjopBuilding = buildingArea * njopBuilding;
  const totalNjop = totalNjopLand + totalNjopBuilding;
  const njopKenaPajak = Math.max(0, totalNjop - njoptkp);
  
  const calculateTax = () => {
      if (regionRateType === 'flat') {
          // Standard Old Model: 0.5% x NJKP (20% or 40%)
          // NJKP
          const njkpRate = totalNjop > 1000000000 ? 0.4 : 0.2;
          const njkp = njopKenaPajak * njkpRate;
          return { tax: njkp * 0.005, rateDesc: `0.5% x ${njkpRate * 100}% NJKP` };
      } else {
          // Progressive Model (Common in PBB-P2)
          // Example (Generic):
          // < 1M: 0.1%
          // > 1M: 0.2%
          // (This varies wildly by region, using a representative scale)
          let rate = 0.001;
          if (njopKenaPajak > 10000000000) rate = 0.003; // > 10M
          else if (njopKenaPajak > 1000000000) rate = 0.002; // > 1M
          
          return { tax: njopKenaPajak * rate, rateDesc: `Tarif Progresif ${(rate * 100).toFixed(1)}%` };
      }
  };
  
  const result = calculateTax();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Land Input */}
        <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
            <h4 className="font-semibold text-slate-700">Data Tanah (Bumi)</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Luas Tanah (m²)</label>
              <input
                type="number"
                value={landArea}
                onChange={(e) => setLandArea(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">NJOP Tanah per m²</label>
              <input
                type="number"
                value={njopLand}
                onChange={(e) => setNjopLand(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>
            <div className="pt-2 text-right text-sm font-mono text-slate-600">
                Total: Rp {totalNjopLand.toLocaleString('id-ID')}
            </div>
        </div>

        {/* Building Input */}
        <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
            <h4 className="font-semibold text-slate-700">Data Bangunan</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Luas Bangunan (m²)</label>
              <input
                type="number"
                value={buildingArea}
                onChange={(e) => setBuildingArea(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">NJOP Bangunan per m²</label>
              <input
                type="number"
                value={njopBuilding}
                onChange={(e) => setNjopBuilding(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>
            <div className="pt-2 text-right text-sm font-mono text-slate-600">
                Total: Rp {totalNjopBuilding.toLocaleString('id-ID')}
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700">NJOPTKP (Tidak Kena Pajak)</label>
             <input
                type="number"
                value={njoptkp}
                onChange={(e) => setNjoptkp(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md"
                placeholder="12000000"
              />
              <p className="text-xs text-slate-500">Standar nasional minimal Rp 10-12 Juta (bervariasi per daerah).</p>
        </div>
        <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700">Model Tarif</label>
             <select
                value={regionRateType}
                onChange={(e) => setRegionRateType(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-md"
             >
                <option value="progressive">PBB-P2 Progresif (Umum)</option>
                <option value="flat">PBB Lama (0.5% x NJKP)</option>
             </select>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
         <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total NJOP (Bumi + Bangunan)</span>
            <span className="font-mono font-medium">{totalNjop.toLocaleString('id-ID')}</span>
         </div>
         <div className="flex justify-between text-sm">
            <span className="text-slate-600">Dikurangi NJOPTKP</span>
            <span className="font-mono font-medium text-red-600">-{njoptkp.toLocaleString('id-ID')}</span>
         </div>
         <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
            <span className="text-slate-800 font-medium">NJOP Kena Pajak</span>
            <span className="font-mono text-slate-800">{njopKenaPajak.toLocaleString('id-ID')}</span>
         </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-slate-600">Tarif ({result.rateDesc})</span>
         </div>
         
         <div className="bg-blue-50 p-4 rounded border border-blue-100 mt-2 flex justify-between items-center">
             <span className="text-blue-800 font-bold">PBB Terutang</span>
             <span className="text-xl font-bold text-blue-700">Rp {result.tax.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
         </div>
      </div>
    </div>
  );
}
