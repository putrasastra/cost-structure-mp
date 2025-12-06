import { useState, Component, ErrorInfo, ReactNode } from 'react';
import { 
  Calculator, 
  Building2, 
  TrendingUp, 
  PieChart, 
  Briefcase, 
  UserCheck, 
  AlertTriangle, 
  Zap, 
  Calendar 
} from 'lucide-react';
import { DividendSalaryOptimizer } from '../components/tax-planner/DividendSalaryOptimizer';
import { PKPAnalyzer } from '../components/tax-planner/PKPAnalyzer';
import { ExpenseOptimizer } from '../components/tax-planner/ExpenseOptimizer';
import { PPhBadanSimulator } from '../components/tax-planner/PPhBadanSimulator';
import { MultiCompanyConsolidation } from '../components/tax-planner/MultiCompanyConsolidation';
import { PersonalCorporateHarmonization } from '../components/tax-planner/PersonalCorporateHarmonization';
import { EarlyWarningSystem } from '../components/tax-planner/EarlyWarningSystem';
import { CorporateActionSimulator } from '../components/tax-planner/CorporateActionSimulator';
import { TaxCalendarTips } from '../components/tax-planner/TaxCalendarTips';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("TaxPlanner Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <h3 className="font-bold">Terjadi Kesalahan</h3>
          <p>Modul ini mengalami masalah saat dimuat.</p>
          <pre className="text-xs mt-2 overflow-auto">{this.state.error?.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export function TaxPlanner() {
  const [activeTab, setActiveTab] = useState('dividend-salary');

  const tabs = [
    { id: 'dividend-salary', label: 'Dividen vs Gaji', icon: UserCheck, color: 'text-purple-600' },
    { id: 'pkp-analyzer', label: 'Analisa PKP', icon: Building2, color: 'text-blue-600' },
    { id: 'expense-opt', label: 'Optimasi Biaya', icon: TrendingUp, color: 'text-green-600' },
    { id: 'pph-badan', label: 'Simulasi PPh Badan', icon: PieChart, color: 'text-indigo-600' },
    { id: 'multi-company', label: 'Konsolidasi Grup', icon: Briefcase, color: 'text-slate-600' },
    { id: 'personal-corp', label: 'Harmonisasi Pajak', icon: Calculator, color: 'text-orange-600' },
    { id: 'early-warning', label: 'Early Warning', icon: AlertTriangle, color: 'text-red-600' },
    { id: 'corp-action', label: 'Aksi Korporasi', icon: Zap, color: 'text-yellow-600' },
    { id: 'calendar', label: 'Kalender & Tips', icon: Calendar, color: 'text-teal-600' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dividend-salary':
        return <DividendSalaryOptimizer />;
      case 'pkp-analyzer':
        return <PKPAnalyzer />;
      case 'expense-opt':
        return <ExpenseOptimizer />;
      case 'pph-badan':
        return <PPhBadanSimulator />;
      case 'multi-company':
        return <MultiCompanyConsolidation />;
      case 'personal-corp':
        return <PersonalCorporateHarmonization />;
      case 'early-warning':
        return <EarlyWarningSystem />;
      case 'corp-action':
        return <CorporateActionSimulator />;
      case 'calendar':
        return <TaxCalendarTips />;
      default:
        return null;
    }
  };

  const getTabDescription = (id: string) => {
    switch (id) {
        case 'dividend-salary': return "Simulasi perbandingan beban pajak antara pengambilan Gaji vs Dividen bagi Pemilik Perusahaan.";
        case 'pkp-analyzer': return "Analisis kelayakan dan kewajiban perusahaan untuk menjadi Pengusaha Kena Pajak (PKP).";
        case 'expense-opt': return "Klasifikasi dan optimasi biaya fiskal vs non-fiskal untuk efisiensi PPh Badan.";
        case 'pph-badan': return "Simulasi dampak perubahan komponen keuangan (marketing, aset, koreksi) terhadap PPh Badan.";
        case 'multi-company': return "Analisis beban pajak gabungan untuk grup perusahaan dan rekomendasi efisiensi.";
        case 'personal-corp': return "Harmonisasi total pajak (Pribadi + Perusahaan) untuk pemilik bisnis.";
        case 'early-warning': return "Deteksi dini risiko pemeriksaan pajak berdasarkan indikator keuangan.";
        case 'corp-action': return "Simulasi dampak pajak dari keputusan besar seperti pembelian aset atau penjualan saham.";
        case 'calendar': return "Kalender kewajiban pajak bulanan dan tips strategis optimasi cashflow.";
        default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Tax Planner Pro</h2>
        <p className="text-slate-500">Tools perencanaan pajak strategis untuk efisiensi maksimal.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-primary' : tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    {(() => {
                        const tab = tabs.find(t => t.id === activeTab);
                        const Icon = tab?.icon;
                        return Icon ? <Icon className={`h-6 w-6 mr-2 ${tab?.color}`} /> : null;
                    })()}
                    {tabs.find(t => t.id === activeTab)?.label}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                    {getTabDescription(activeTab)}
                </p>
            </div>
            
            <ErrorBoundary key={activeTab}>
              {renderContent()}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
