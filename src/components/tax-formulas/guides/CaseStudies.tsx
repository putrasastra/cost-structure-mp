import { CASE_STUDIES } from '../guideData';

interface CaseStudiesProps {
  taxType: 'pph21' | 'ppn' | 'pbb';
}

export function CaseStudies({ taxType }: CaseStudiesProps) {
  const data = CASE_STUDIES[taxType] || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 flex items-center">
        <span className="bg-amber-100 text-amber-700 p-1 rounded mr-2">📚</span>
        Studi Kasus Praktis
      </h3>
      <div className="grid gap-6">
        {data.map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h4 className="font-semibold text-slate-700">{item.title}</h4>
            </div>
            <div className="p-4 space-y-4">
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100">
                    <strong>Skenario:</strong> {item.scenario}
                </div>
                <div>
                    <h5 className="text-sm font-semibold text-slate-700 mb-2">Langkah Perhitungan:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                        {item.steps.map((step, sIdx) => (
                            <li key={sIdx} className="pl-1">{step}</li>
                        ))}
                    </ol>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
