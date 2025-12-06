import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Pph21Calculator } from '../components/tax-formulas/calculators/Pph21Calculator';
import { PpnCalculator } from '../components/tax-formulas/calculators/PpnCalculator';
import { PbbCalculator } from '../components/tax-formulas/calculators/PbbCalculator';
import { LegalBasis } from '../components/tax-formulas/guides/LegalBasis';
import { CaseStudies } from '../components/tax-formulas/guides/CaseStudies';
import { TaxTips } from '../components/tax-formulas/guides/TaxTips';

// Keep the old data for "Cheat Sheet" or fallback
const LEGACY_FORMULAS = [
  {
    id: 'ppn',
    title: 'PPN (Pajak Pertambahan Nilai)',
    items: [
      {
        name: 'PPN Keluaran',
        description: 'Pajak yang dipungut PKP saat menyerahkan BKP/JKP.',
        formula: '11% × DPP (Dasar Pengenaan Pajak)',
        example: 'Harga Jual = Rp 10.000.000\nPPN = 11% × 10.000.000 = Rp 1.100.000',
      },
      {
        name: 'PPN Masukan',
        description: 'Pajak yang dibayar PKP saat memperoleh BKP/JKP.',
        formula: '11% × Nilai Perolehan',
        example: 'Beli Bahan Baku = Rp 5.000.000\nPPN Masukan = 11% × 5.000.000 = Rp 550.000',
      },
    ],
  },
  {
    id: 'pph21',
    title: 'PPh 21 (Karyawan)',
    items: [
      {
        name: 'Biaya Jabatan',
        description: 'Pengurang penghasilan bruto untuk pegawai tetap.',
        formula: '5% × Penghasilan Bruto (Max Rp 500.000/bulan)',
        example: 'Gaji Rp 10.000.000\nBiaya Jabatan = 5% × 10.000.000 = Rp 500.000',
      },
      {
        name: 'PKP (Penghasilan Kena Pajak)',
        description: 'Dasar perhitungan PPh 21 setahun.',
        formula: '(Penghasilan Netto Setahun - PTKP)',
        example: 'Netto Rp 100jt, PTKP (TK/0) Rp 54jt\nPKP = 100jt - 54jt = Rp 46.000.000',
      },
    ],
  },
  {
    id: 'pph23',
    title: 'PPh 23 / 26',
    items: [
      {
        name: 'Tarif 2%',
        description: 'Dikenakan atas sewa dan jasa tertentu.',
        formula: '2% × Jumlah Bruto',
        example: 'Sewa Alat Rp 10.000.000\nPPh 23 = 2% × 10.000.000 = Rp 200.000',
      },
      {
        name: 'Tarif 15%',
        description: 'Dikenakan atas dividen, bunga, royalti, hadiah.',
        formula: '15% × Jumlah Bruto',
        example: 'Dividen Rp 100.000.000\nPPh 23 = 15% × 100.000.000 = Rp 15.000.000',
      },
    ],
  },
  {
    id: 'pph_final',
    title: 'PPh Final UMKM',
    items: [
      {
        name: 'PP 23 Tahun 2018 / PP 55 Tahun 2022',
        description: 'Untuk peredaran bruto tertentu (maks 4.8M setahun).',
        formula: '0.5% × Peredaran Bruto',
        example: 'Omzet Bulan Ini Rp 20.000.000\nPPh Final = 0.5% × 20.000.000 = Rp 100.000',
      },
    ],
  },
  {
    id: 'pph_badan',
    title: 'PPh Badan Tahunan',
    items: [
      {
        name: 'Tarif Umum',
        description: 'Tarif PPh Badan yang berlaku umum.',
        formula: '22% × PKP (Penghasilan Kena Pajak)',
        example: 'Laba Fiskal Rp 1.000.000.000\nPPh Badan = 22% × 1M = Rp 220.000.000',
      },
    ],
  },
   {
    id: 'pbb',
    title: 'PBB (Pajak Bumi & Bangunan)',
    items: [
      {
        name: 'Rumus Umum',
        description: 'Pajak atas kepemilikan tanah dan bangunan.',
        formula: 'Tarif x (NJOP - NJOPTKP)',
        example: 'NJOP 2M, NJOPTKP 12jt. PBB = 0.2% x (2M - 12jt)',
      },
    ],
  },
];

const MODULES = [
  { id: 'pph21', title: 'PPh 21 (Karyawan)', hasCalc: true, hasGuide: true, hasTips: true },
  { id: 'ppn', title: 'PPN (Pertambahan Nilai)', hasCalc: true, hasGuide: true, hasTips: true },
  { id: 'pbb', title: 'PBB (Bumi & Bangunan)', hasCalc: true, hasGuide: true, hasTips: true },
  { id: 'pph23', title: 'PPh 23 / 26', hasCalc: false, hasGuide: false, hasTips: false },
  { id: 'pph_final', title: 'PPh Final UMKM', hasCalc: false, hasGuide: true, hasTips: true },
  { id: 'pph_badan', title: 'PPh Badan', hasCalc: false, hasGuide: true, hasTips: true },
];

export function TaxFormulas() {
  const [activeId, setActiveId] = useState(MODULES[0].id);
  const [activeTab, setActiveTab] = useState<'calculator' | 'guide' | 'tips' | 'cheatsheet'>('calculator');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tax_formula_bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  const toggleBookmark = (id: string) => {
    const newBookmarks = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    setBookmarks(newBookmarks);
    localStorage.setItem('tax_formula_bookmarks', JSON.stringify(newBookmarks));
  };

  const activeModule = MODULES.find((m) => m.id === activeId);
  const legacyData = LEGACY_FORMULAS.find((f) => f.id === activeId);

  const filteredModules = MODULES.filter((m) => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (activeTab === 'calculator') {
      if (!activeModule?.hasCalc) {
        return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="mb-2">🚧 Kalkulator belum tersedia untuk jenis pajak ini.</p>
            <button 
                onClick={() => setActiveTab('cheatsheet')}
                className="text-primary hover:underline"
            >
                Lihat Rumus Manual
            </button>
          </div>
        );
      }
      switch (activeId) {
        case 'pph21': return <Pph21Calculator />;
        case 'ppn': return <PpnCalculator />;
        case 'pbb': return <PbbCalculator />;
        default: return null;
      }
    }

    if (activeTab === 'guide') {
       if (!activeModule?.hasGuide) {
        return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p>🚧 Panduan lengkap belum tersedia.</p>
          </div>
        );
      }
      return (
        <div className="space-y-8">
          <LegalBasis taxType={activeId as any} />
          <CaseStudies taxType={activeId as any} />
        </div>
      );
    }

    if (activeTab === 'tips') {
      return <TaxTips taxType={activeId} />;
    }

    // Cheat Sheet (Legacy View)
    return (
      <div className="grid grid-cols-1 gap-6">
        {legacyData?.items.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{item.name}</h3>
                <p className="text-slate-600 mb-4">{item.description}</p>
                
                <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Rumus</p>
                  <p className="font-mono text-lg text-primary">{item.formula}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold mb-1">Contoh Perhitungan</p>
                  <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap">{item.example}</pre>
                </div>
              </div>
            </div>
        )) || <p className="text-slate-500">Tidak ada data rumus.</p>}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="w-full md:w-72 flex-shrink-0 bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
             <h3 className="font-semibold text-slate-700">Kamus Pajak</h3>
             <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">v2.1</span>
          </div>
          <input
            type="text"
            placeholder="Cari rumus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Bookmarks Section if any */}
          {bookmarks.length > 0 && !searchQuery && (
             <div className="mb-4">
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Favorit</p>
                {MODULES.filter(m => bookmarks.includes(m.id)).map(m => (
                    <button
                      key={`bm-${m.id}`}
                      onClick={() => setActiveId(m.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between group',
                         activeId === m.id ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span>{m.title}</span>
                      <span className="text-amber-400 text-xs">★</span>
                    </button>
                ))}
                <div className="my-2 border-t border-slate-100"></div>
             </div>
          )}

          {filteredModules.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center group',
                activeId === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <span>{item.title}</span>
              {activeId === item.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-lg border border-slate-200 overflow-hidden">
         {/* Header */}
         <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50/50">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">{activeModule?.title}</h2>
                <p className="text-slate-500 text-sm">
                    {activeModule?.hasCalc ? 'Tersedia kalkulator interaktif & panduan lengkap.' : 'Informasi rumus dasar.'}
                </p>
            </div>
            <button 
                onClick={() => toggleBookmark(activeId)}
                className={cn(
                    "p-2 rounded-full transition-colors",
                    bookmarks.includes(activeId) ? "bg-amber-50 text-amber-500" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                )}
                title="Bookmark"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={bookmarks.includes(activeId) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </button>
         </div>

         {/* Tabs */}
         <div className="flex border-b border-slate-200 px-6 bg-white sticky top-0 z-10 overflow-x-auto">
            <button
                onClick={() => setActiveTab('calculator')}
                className={cn(
                    "py-4 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === 'calculator' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
            >
                🧮 Kalkulator
            </button>
            <button
                onClick={() => setActiveTab('guide')}
                className={cn(
                    "py-4 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === 'guide' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
            >
                📚 Panduan & Dasar Hukum
            </button>
            <button
                onClick={() => setActiveTab('tips')}
                className={cn(
                    "py-4 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === 'tips' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
            >
                💡 Tips & Efisiensi
            </button>
            <button
                onClick={() => setActiveTab('cheatsheet')}
                className={cn(
                    "py-4 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === 'cheatsheet' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
            >
                📝 Rumus Cepat
            </button>
         </div>

         {/* Scrollable Content */}
         <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
            <div className="max-w-4xl mx-auto">
                {renderContent()}
            </div>
         </div>
      </div>
    </div>
  );
}
