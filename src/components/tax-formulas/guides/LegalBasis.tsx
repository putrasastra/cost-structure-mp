import { LEGAL_BASIS } from '../guideData';

interface LegalBasisProps {
  taxType: 'pph21' | 'ppn' | 'pbb';
}

export function LegalBasis({ taxType }: LegalBasisProps) {
  const data = LEGAL_BASIS[taxType] || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 flex items-center">
        <span className="bg-blue-100 text-blue-700 p-1 rounded mr-2">⚖️</span>
        Dasar Hukum & Regulasi
      </h3>
      <div className="grid gap-4">
        {data.map((item, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-slate-800">{item.title}</h4>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">
                    {item.ref}
                </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
