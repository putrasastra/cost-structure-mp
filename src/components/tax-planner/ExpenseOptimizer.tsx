import { useState } from 'react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface ExpenseItem {
    id: number;
    name: string;
    amount: number;
    category: 'operational' | 'marketing' | 'salary' | 'entertainment' | 'asset';
}

export function ExpenseOptimizer() {
    const [expenses, setExpenses] = useState<ExpenseItem[]>([
        { id: 1, name: 'Makan Siang Karyawan', amount: 50000000, category: 'operational' },
        { id: 2, name: 'Entertain Klien', amount: 20000000, category: 'entertainment' },
        { id: 3, name: 'Beli Laptop', amount: 30000000, category: 'asset' },
    ]);

    const addExpense = () => {
        setExpenses([...expenses, { id: Date.now(), name: '', amount: 0, category: 'operational' }]);
    };

    const updateExpense = (id: number, field: keyof ExpenseItem, value: any) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const removeExpense = (id: number) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const getRecommendation = (item: ExpenseItem) => {
        if (item.category === 'entertainment') {
            return {
                type: 'warning',
                text: 'Wajib membuat Daftar Nominatif agar bisa dibiayakan (Deductible).'
            };
        }
        if (item.category === 'asset') {
            return {
                type: 'info',
                text: 'Kapitalisasi sebagai aset. Depresiasi (Kelompok 1: 4 tahun) mengurangi PPh tahunan secara bertahap.'
            };
        }
        if (item.name.toLowerCase().includes('pribadi') || item.name.toLowerCase().includes('keluarga')) {
            return {
                type: 'error',
                text: 'Biaya untuk kepentingan pribadi pemilik (Non-Deductible). Akan dikoreksi fiskal.'
            };
        }
        if (item.name.toLowerCase().includes('sumbangan')) {
            return {
                type: 'warning',
                text: 'Sumbangan umumnya Non-Deductible kecuali sumbangan bencana nasional/zakat via badan resmi.'
            };
        }
        return { type: 'success', text: 'Biaya Operasional (Deductible).' };
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900">Klasifikasi Biaya</h3>
                <button onClick={addExpense} className="flex items-center text-sm text-blue-600 font-medium">
                    <Plus className="h-4 w-4 mr-1" /> Tambah Biaya
                </button>
            </div>

            <div className="space-y-4">
                {expenses.map((item) => {
                    const rec = getRecommendation(item);
                    return (
                        <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex gap-4 items-start mb-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Nama Biaya</label>
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateExpense(item.id, 'name', e.target.value)}
                                        className="block w-full rounded-md border-2 border-slate-400 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                        placeholder="Contoh: Makan Siang"
                                    />
                                </div>
                                <div className="w-1/4">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Kategori</label>
                                    <select
                                        value={item.category}
                                        onChange={(e) => updateExpense(item.id, 'category', e.target.value)}
                                        className="block w-full rounded-md border-2 border-slate-400 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    >
                                        <option value="operational">Operasional</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="salary">Gaji</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="asset">Aset / Modal</option>
                                    </select>
                                </div>
                                <div className="w-1/4">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Jumlah</label>
                                    <CurrencyInput
                                        value={item.amount}
                                        onChange={(val) => updateExpense(item.id, 'amount', val)}
                                    />
                                </div>
                                <button onClick={() => removeExpense(item.id)} className="mt-6 text-slate-400 hover:text-red-500">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className={`flex items-start p-2 rounded text-sm ${
                                rec.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                                rec.type === 'error' ? 'bg-red-50 text-red-800' :
                                rec.type === 'info' ? 'bg-blue-50 text-blue-800' :
                                'bg-green-50 text-green-800'
                            }`}>
                                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{rec.text}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
