import { TAX_TIPS } from '../guideData';

interface TaxTipsProps {
  taxType: string;
}

export function TaxTips({ taxType }: TaxTipsProps) {
  // Force type casting or default to empty array if key doesn't exist
  const data = (TAX_TIPS as any)[taxType] || [];

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p>🚧 Tips efisiensi belum tersedia untuk kategori ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
            <span className="text-2xl mr-3">💡</span>
            <div>
                <h3 className="text-lg font-bold text-green-800">Strategi Efisiensi Pajak (Tax Planning)</h3>
                <p className="text-sm text-green-700 mt-1">
                    Tips legal untuk mengoptimalkan beban pajak Anda sesuai peraturan yang berlaku (Tax Avoidance, bukan Tax Evasion).
                </p>
            </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {data.map((item: any, idx: number) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.type === 'Perusahaan' ? 'bg-blue-100 text-blue-700' :
                    item.type === 'Pribadi' ? 'bg-amber-100 text-amber-700' :
                    'bg-purple-100 text-purple-700'
                }`}>
                    {item.type}
                </span>
            </div>
            <div className="p-4 flex flex-col h-full">
                <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-grow">
                    {item.desc}
                </p>
                <div className="pt-3 border-t border-slate-100 mt-auto">
                    <p className="text-xs text-slate-400 font-mono flex items-center">
                        <span className="w-2 h-2 bg-slate-300 rounded-full mr-2"></span>
                        Dasar Hukum: {item.legal}
                    </p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
