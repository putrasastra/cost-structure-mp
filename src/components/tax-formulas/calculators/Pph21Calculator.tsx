import { useState, useEffect } from 'react';

const PTKP_RATES = {
  'TK/0': 54000000,
  'TK/1': 58500000,
  'TK/2': 63000000,
  'TK/3': 67500000,
  'K/0': 58500000,
  'K/1': 63000000,
  'K/2': 67500000,
  'K/3': 72000000,
};

export function Pph21Calculator() {
  const [salary, setSalary] = useState<number>(0);
  const [allowance, setAllowance] = useState<number>(0);
  const [status, setStatus] = useState<keyof typeof PTKP_RATES>('TK/0');
  const [method, setMethod] = useState<'nett' | 'gross-up'>('nett');
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');

  const [result, setResult] = useState<{
    bruto: number;
    biayaJabatan: number;
    netto: number;
    ptkp: number;
    pkp: number;
    pphYearly: number;
    pphMonthly: number;
    takeHomePay: number;
  } | null>(null);

  const calculateTax = (pkp: number) => {
    let tax = 0;
    let remainingPkp = pkp;

    // Layer 1: 0 - 60jt (5%)
    if (remainingPkp > 0) {
      const layer = Math.min(remainingPkp, 60000000);
      tax += layer * 0.05;
      remainingPkp -= layer;
    }
    // Layer 2: 60jt - 250jt (15%)
    if (remainingPkp > 0) {
      const layer = Math.min(remainingPkp, 190000000); // 250 - 60
      tax += layer * 0.15;
      remainingPkp -= layer;
    }
    // Layer 3: 250jt - 500jt (25%)
    if (remainingPkp > 0) {
      const layer = Math.min(remainingPkp, 250000000); // 500 - 250
      tax += layer * 0.25;
      remainingPkp -= layer;
    }
    // Layer 4: 500jt - 5M (30%)
    if (remainingPkp > 0) {
      const layer = Math.min(remainingPkp, 4500000000); // 5M - 500
      tax += layer * 0.30;
      remainingPkp -= layer;
    }
    // Layer 5: > 5M (35%)
    if (remainingPkp > 0) {
      tax += remainingPkp * 0.35;
    }

    return tax;
  };

  const calculateGrossUp = (targetNetto: number, ptkp: number) => {
    let guessBruto = targetNetto;
    let diff = 1;
    let iter = 0;
    
    while (Math.abs(diff) > 100 && iter < 50) {
        const biayaJabatan = Math.min(guessBruto * 0.05, 6000000); 
        const netto = guessBruto - biayaJabatan;
        const pkp = Math.max(0, netto - ptkp);
        const tax = calculateTax(pkp);
        
        const calculatedNet = guessBruto - tax - biayaJabatan; 
        
        diff = calculatedNet - targetNetto;
        guessBruto -= diff; 
        iter++;
    }
    return guessBruto;
  };

  useEffect(() => {
    let annualSalary = period === 'monthly' ? salary * 12 : salary;
    let annualAllowance = period === 'monthly' ? allowance * 12 : allowance;
    let totalIncome = annualSalary + annualAllowance;

    const ptkp = PTKP_RATES[status];
    
    let calculatedBruto = totalIncome;
    let pphYearly = 0;
    let biayaJabatan = 0;

    if (method === 'gross-up') {
        // We treat the input salary as the desired Netto (excluding Biaya Jabatan calculation which is internal)
        // Actually, usually Gross Up means: The employee receives X amount. The company pays Tax. 
        // So we want (Gross - Tax - BiayaJabatan) approx X? Or just (Gross - Tax) = X?
        // Standard interpretation: Take Home Pay = Salary Input.
        // THP = Bruto - Tax. (Biaya Jabatan is non-cash).
        // So we iterate to find Bruto such that Bruto - Tax = Input.
        // But wait, Tax is calculated on PKP = Bruto - BiayaJabatan - PTKP.
        
        // Let's refine calculateGrossUp to target (Bruto - Tax) = Input.
        // My previous logic targetted (Bruto - Tax - BiayaJabatan). 
        // Biaya Jabatan is NOT a deduction from cash received, it's a deduction for TAX BASE.
        // So THP = Bruto - Tax.
        
        // Let's stick to the simpler logic: Gross Up adds Tunjangan Pajak.
        // Tunjangan Pajak = Tax Amount.
        // Bruto = Original Salary + Tax Amount.
        // Tax is calculated on (Original + Tax).
        // This is the standard "Gross Up" formula.
        
        // We need to find Tunjangan Pajak (T) such that:
        // Tax(Original + T) = T.
        
        let tax = 0;
        let prevTax = -1;
        let iter = 0;
        let currentBruto = totalIncome;
        
        while (Math.abs(tax - prevTax) > 50 && iter < 20) {
            prevTax = tax;
            biayaJabatan = Math.min(currentBruto * 0.05, 6000000);
            const pkp = Math.max(0, currentBruto - biayaJabatan - ptkp);
            tax = calculateTax(pkp);
            currentBruto = totalIncome + tax;
            iter++;
        }
        
        calculatedBruto = currentBruto;
        pphYearly = tax;

    } else {
        // Nett / Gross (Standard)
        biayaJabatan = Math.min(calculatedBruto * 0.05, 6000000);
        const netto = calculatedBruto - biayaJabatan;
        const pkp = Math.max(0, netto - ptkp);
        pphYearly = calculateTax(pkp);
    }

    const pphMonthly = pphYearly / 12;
    
    setResult({
        bruto: calculatedBruto,
        biayaJabatan,
        netto: calculatedBruto - biayaJabatan,
        ptkp,
        pkp: Math.max(0, (calculatedBruto - biayaJabatan) - ptkp),
        pphYearly,
        pphMonthly,
        takeHomePay: 0 // Not used in display logic currently
    });

  }, [salary, allowance, status, method, period]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Gaji Pokok</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-md"
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Tunjangan Tetap</label>
          <input
            type="number"
            value={allowance}
            onChange={(e) => setAllowance(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-md"
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Status PTKP</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as keyof typeof PTKP_RATES)}
            className="w-full p-2 border border-slate-300 rounded-md"
          >
            {Object.keys(PTKP_RATES).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Metode Perhitungan</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as 'nett' | 'gross-up')}
            className="w-full p-2 border border-slate-300 rounded-md"
          >
            <option value="nett">Gross (Pajak Ditanggung Karyawan)</option>
            <option value="gross-up">Gross Up (Tunjangan Pajak)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Periode Input</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'monthly' | 'annual')}
            className="w-full p-2 border border-slate-300 rounded-md"
          >
            <option value="monthly">Bulanan</option>
            <option value="annual">Tahunan</option>
          </select>
        </div>
      </div>

      {result && (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
          <h3 className="font-semibold text-slate-800">Hasil Perhitungan Estimasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Penghasilan Bruto (Setahun)</span>
              <span className="font-mono font-medium">{result.bruto.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Biaya Jabatan (Pengurang)</span>
              <span className="font-mono font-medium text-red-600">-{result.biayaJabatan.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">PTKP ({status})</span>
              <span className="font-mono font-medium text-red-600">-{result.ptkp.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
              <span className="text-slate-800">PKP (Penghasilan Kena Pajak)</span>
              <span className="font-mono text-slate-800">{result.pkp.toLocaleString('id-ID')}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded border border-blue-100 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-800 font-medium">PPh 21 Terutang (Setahun)</span>
              <span className="text-xl font-bold text-blue-700">Rp {result.pphYearly.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-600 text-sm">Estimasi Potongan per Bulan</span>
              <span className="text-lg font-bold text-blue-600">Rp {result.pphMonthly.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
            </div>
             {method === 'gross-up' && (
                <div className="mt-2 text-xs text-blue-500 italic">
                    *Metode Gross-up: Perusahaan memberikan tunjangan pajak sebesar nilai PPh terutang.
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
