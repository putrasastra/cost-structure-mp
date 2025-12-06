import { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { companyService } from '../services/companyService';
import { transactionService } from '../services/transactionService';
import { Company, PpnTransaction, PphTransaction } from '../types';

export function Reports() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [reportType, setReportType] = useState<string>('ppn');
  const [period, setPeriod] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const data = await companyService.getCompanies();
    setCompanies(data);
    if (data.length > 0) setSelectedCompany(data[0].id);
  };

  const generateData = async () => {
    if (reportType === 'ppn') {
      return await transactionService.getPpnTransactions(selectedCompany);
    } else {
      // For PPh, we fetch all PPh transactions and filter by type in frontend or backend
      // Here we simplify by fetching all for the company
      return await transactionService.getPphTransactions(selectedCompany);
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const data = await generateData();
      const doc = new jsPDF();
      const company = companies.find(c => c.id === selectedCompany);

      doc.setFontSize(18);
      doc.text(`Laporan ${reportType.toUpperCase()}`, 14, 22);
      doc.setFontSize(11);
      doc.text(`Perusahaan: ${company?.name || '-'}`, 14, 30);
      doc.text(`Periode: ${period}`, 14, 36);

      if (reportType === 'ppn') {
        const ppnData = data as PpnTransaction[];
        const filteredData = ppnData.filter(t => t.tax_period === period);
        
        const tableData = filteredData.map(t => [
          format(new Date(t.transaction_date), 'dd/MM/yyyy'),
          t.transaction_type === 'input' ? 'Masukan' : 'Keluaran',
          t.invoice_number,
          t.counterparty_name,
          `Rp ${t.dpp_amount.toLocaleString('id-ID')}`,
          `Rp ${t.ppn_amount.toLocaleString('id-ID')}`,
        ]);

        autoTable(doc, {
          head: [['Tanggal', 'Jenis', 'No Faktur', 'Lawan Transaksi', 'DPP', 'PPN']],
          body: tableData,
          startY: 44,
        });
      } else {
        const pphData = data as PphTransaction[];
        const filteredData = pphData.filter(t => t.tax_period === period);
        
        const tableData = filteredData.map(t => [
          t.tax_period,
          `PPh ${t.pph_type}`,
          `Rp ${t.tax_base.toLocaleString('id-ID')}`,
          `${t.tax_rate}%`,
          `Rp ${t.tax_amount.toLocaleString('id-ID')}`,
          t.employee_name || '-'
        ]);

        autoTable(doc, {
          head: [['Masa', 'Jenis', 'DPP', 'Tarif', 'Pajak', 'Keterangan']],
          body: tableData,
          startY: 44,
        });
      }

      doc.save(`Laporan_${reportType}_${period}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const data = await generateData();
      
      let exportData = [];
      if (reportType === 'ppn') {
        const ppnData = data as PpnTransaction[];
        exportData = ppnData.filter(t => t.tax_period === period).map(t => ({
          Tanggal: format(new Date(t.transaction_date), 'dd/MM/yyyy'),
          Jenis: t.transaction_type,
          No_Faktur: t.invoice_number,
          Lawan_Transaksi: t.counterparty_name,
          DPP: t.dpp_amount,
          PPN: t.ppn_amount
        }));
      } else {
        const pphData = data as PphTransaction[];
        exportData = pphData.filter(t => t.tax_period === period).map(t => ({
          Masa: t.tax_period,
          Jenis: `PPh ${t.pph_type}`,
          DPP: t.tax_base,
          Tarif: t.tax_rate,
          Pajak: t.tax_amount,
          Keterangan: t.employee_name || t.document_number
        }));
      }

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan");
      XLSX.writeFile(wb, `Laporan_${reportType}_${period}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Gagal membuat Excel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Laporan Pajak</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Perusahaan</label>
            <select 
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Pilih Perusahaan</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Laporan</label>
            <select 
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="ppn">Laporan PPN Bulanan</option>
              <option value="pph">Laporan PPh Masa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Periode</label>
            <input 
              type="month" 
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleExportPDF}
            disabled={loading || !selectedCompany}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={loading || !selectedCompany}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800">Informasi</h3>
        <p className="text-sm text-blue-600 mt-1">
          Silakan pilih perusahaan, jenis laporan, dan periode untuk mengunduh laporan pajak. Laporan yang dihasilkan bersifat draf dan dapat digunakan sebagai referensi untuk pengisian SPT.
        </p>
      </div>
    </div>
  );
}
