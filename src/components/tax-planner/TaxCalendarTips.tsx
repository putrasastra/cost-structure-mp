import { Calendar, CheckCircle, Clock } from 'lucide-react';

export function TaxCalendarTips() {
  const upcomingDates = [
    { date: '10 Jan', title: 'Penyetoran PPh 21/23/26/4(2)', type: 'payment' },
    { date: '15 Jan', title: 'Penyetoran PPh 25 (Angsuran)', type: 'payment' },
    { date: '20 Jan', title: 'Pelaporan SPT Masa PPh', type: 'report' },
    { date: '31 Jan', title: 'Penyetoran & Pelaporan PPN', type: 'both' },
  ];

  const tips = [
    {
        title: "Optimasi Arus Kas PPN",
        desc: "Tunda penerbitan Faktur Pajak Keluaran untuk penjualan di akhir bulan ke tanggal 1 bulan berikutnya (jika barang belum diserahkan), agar pembayaran PPN mundur 1 bulan."
    },
    {
        title: "Kredit Pajak Luar Negeri",
        desc: "Pastikan bukti potong PPh 26 dari transaksi luar negeri dikumpulkan untuk dikreditkan di SPT Tahunan PPh Badan."
    },
    {
        title: "Angsuran PPh 25",
        desc: "Jika omzet tahun berjalan diprediksi turun drastis dibanding tahun lalu, ajukan pengurangan angsuran PPh 25 ke KPP untuk menjaga cashflow."
    }
  ];

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Kalender Pajak (Januari 2025)
                </h3>
                <div className="space-y-4">
                    {upcomingDates.map((item, idx) => (
                        <div key={idx} className="flex items-start border-b border-slate-100 pb-3 last:border-0">
                            <div className="w-16 flex-shrink-0 text-center bg-blue-50 rounded p-1 mr-3">
                                <span className="block text-xs text-blue-600 font-bold uppercase">{item.date.split(' ')[1]}</span>
                                <span className="block text-lg font-bold text-blue-800">{item.date.split(' ')[0]}</span>
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{item.title}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                                    item.type === 'payment' ? 'bg-red-100 text-red-700' :
                                    item.type === 'report' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-purple-100 text-purple-700'
                                }`}>
                                    {item.type === 'payment' ? 'Penyetoran' : item.type === 'report' ? 'Pelaporan' : 'Setor & Lapor'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-xl shadow-lg text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-yellow-300" />
                    Tips Optimasi Bulan Ini
                </h3>
                <div className="space-y-4">
                    {tips.map((tip, idx) => (
                        <div key={idx} className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 mr-2 text-green-300 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm text-white">{tip.title}</h4>
                                    <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                                        {tip.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}
