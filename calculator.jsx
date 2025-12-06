const { useState, useEffect, useRef } = React;

// --- Icons ---
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-slate-600 cursor-help"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);
const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.637 6.329 6.329 0 0 0 11.257-4.393V8.226c.72.67 1.705 1.074 2.781 1.074V5.715a4.848 4.848 0 0 1-.411-.029z"/></svg>
);
const ShopeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.119 4.881c-1.459-1.459-3.891-2.381-6.119-2.381-2.228 0-4.66.922-6.119 2.381-1.459 1.459-2.381 3.891-2.381 6.119 0 2.228.922 4.66 2.381 6.119 1.459 1.459 3.891 2.381 6.119 2.381 2.228 0 4.66-.922 6.119-2.381 1.459-1.459 2.381-3.891 2.381-6.119 0-2.228-.922-4.66-2.381-6.119zm-3.702 10.733c-1.237.518-2.836.185-3.436-.264-.122-.092-.139-.266-.037-.379l.69-.765c.098-.108.264-.116.373-.019.285.254 1.08.623 1.77.274.442-.224.271-.957-.369-1.168-.926-.306-2.139-.646-2.139-2.018 0-1.028.834-1.88 2.432-1.88 1.136 0 1.956.322 2.458.666.125.085.147.253.052.373l-.654.829c-.09.114-.254.133-.372.046-.32-.237-.869-.462-1.444-.462-.598 0-1.036.268-1.036.727 0 .568.742.771 1.688 1.088 1.178.395 1.964 1.023 1.964 2.218 0 1.077-.867 1.966-2.516 1.966z"/></svg>
);

// --- Helpers ---
const formatRp = (val) => "Rp" + val.toLocaleString("id-ID");
const formatNumber = (val) => val.toLocaleString("id-ID");

// --- Main Calculator Component ---
function MarketplaceCalculator({ platform }) {
  const [activeScenario, setActiveScenario] = useState('A'); // 'A' | 'B'

  return (
    <div className="w-full animate-fade-in">
      {/* Header & Scenario Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-xl font-bold ${platform === 'Shopee' ? 'text-orange-600' : 'text-slate-800'} flex items-center gap-2`}>
            {platform === 'Shopee' ? <ShopeeIcon /> : <TikTokIcon />}
            {platform} Calculator
          </h2>
          <p className="text-xs text-slate-600 mt-1">Kalkulasi margin dan perbandingan skenario.</p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start">
           <button
             onClick={() => setActiveScenario('A')}
             className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeScenario === 'A' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Skenario A
           </button>
           <button
             onClick={() => setActiveScenario('B')}
             className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeScenario === 'B' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Skenario B
           </button>
        </div>
      </div>

      <div className={activeScenario === 'A' ? 'block' : 'hidden'}>
        <CalculatorContent platform={platform} scenarioId="A" />
      </div>
      <div className={activeScenario === 'B' ? 'block' : 'hidden'}>
        <CalculatorContent platform={platform} scenarioId="B" />
      </div>
    </div>
  );
}

function CalculatorContent({ platform, scenarioId }) {
  // Common State
  const [hargaJual, setHargaJual] = useState(189000);
  const [potonganOutlet, setPotonganOutlet] = useState(0);
  
  // Fix Cost / Biaya Lainnya (Shopee)
  const [komisiPlatform, setKomisiPlatform] = useState(0);
  const [komisiDinamis, setKomisiDinamis] = useState(0);
  const [biayaProses, setBiayaProses] = useState(0);
  
  // Shopee Specific Fix Cost
  const [biayaLayananPromo, setBiayaLayananPromo] = useState(0);
  const [biayaGratisOngkir, setBiayaGratisOngkir] = useState(0);

  // Variable Cost
  const [biayaMall, setBiayaMall] = useState(0);
  const [affiliator, setAffiliator] = useState(0);
  const [campaignPayday, setCampaignPayday] = useState(0);
  const [liveExtra, setLiveExtra] = useState(0);
  const [ongkir, setOngkir] = useState(0);
  const [cashbackBonus, setCashbackBonus] = useState(0);
  const [biayaOperasional, setBiayaOperasional] = useState(0);
  const [voucherXtra, setVoucherXtra] = useState(0); // New field
  const [biayaTransaksi, setBiayaTransaksi] = useState(0); // Shopee specific

  // Ads & HPP
  const [budgetIklan, setBudgetIklan] = useState(0);
  const [ppnIklan, setPpnIklan] = useState(0);
  const [hpp, setHpp] = useState(0);

  // --- Calculations ---
  const gross = Number(hargaJual) || 0;
  const outletDisc = Number(potonganOutlet) || 0;
  const finalPrice = Math.max(gross - outletDisc, 0);

  const vKomisiPlatform = Number(komisiPlatform) || 0;
  const vKomisi = Number(komisiDinamis) || 0;
  const vProses = Number(biayaProses) || 0;
  
  // Shopee specific fix cost sums
  const vPromo = Number(biayaLayananPromo) || 0;
  const vGratisOngkir = Number(biayaGratisOngkir) || 0;

  const vMall = Number(biayaMall) || 0;
  const vAff = Number(affiliator) || 0;
  const vCampaign = Number(campaignPayday) || 0;
  const vLive = Number(liveExtra) || 0;
  const vOngkir = Number(ongkir) || 0;
  const vCashback = Number(cashbackBonus) || 0;
  const vOps = Number(biayaOperasional) || 0;
  const vVoucherXtra = Number(voucherXtra) || 0;
  const vTransaksi = Number(biayaTransaksi) || 0;
  
  const vBudgetIklan = Number(budgetIklan) || 0;
  const vPpnIklan = Number(ppnIklan) || 0;
  const vHpp = Number(hpp) || 0;

  let totalAdmin = 0;

  if (platform === 'Shopee') {
      // Shopee specific total
      totalAdmin = 
        vKomisiPlatform + vPromo + vProses + // Fix Cost Group
        vMall + vAff + vCampaign + vLive + vOngkir + vCashback + vOps + vVoucherXtra + vTransaksi + // Variable Group
        vBudgetIklan + vPpnIklan;
    } else {
    // TikTok / Default
    totalAdmin =
      vKomisiPlatform + vKomisi + vProses +
      vMall + vAff + vCampaign + vLive + vOngkir + vCashback + vOps + vVoucherXtra +
      vBudgetIklan + vPpnIklan;
  }

  const settlement = finalPrice - totalAdmin;
  const totalAllIn = totalAdmin + vHpp;
  const profit = settlement - vHpp;
  
  const pct = (val) => (finalPrice ? (val / finalPrice) * 100 : 0);
  const roas = vBudgetIklan ? finalPrice / vBudgetIklan : 0;
  const totalAdCost = vBudgetIklan + vPpnIklan;
  const roi = totalAdCost ? (profit / totalAdCost) * 100 : 0;

  // --- Export Logic ---
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getExportData = () => {
    const fmtPct = (val) => (finalPrice ? (val / finalPrice) * 100 : 0).toFixed(2) + "%";
    
    // Base details
    let details = [
        ["Harga Jual", formatRp(gross), "-"],
        ["Diskon Penjual", formatRp(outletDisc), fmtPct(outletDisc)],
        ["---", "---", "---"],
    ];

    if (platform === 'Shopee') {
      details.push(
        ["Biaya Administrasi", formatRp(vKomisiPlatform), fmtPct(vKomisiPlatform)],
        ["Biaya Layanan", formatRp(vPromo), fmtPct(vPromo)],
        ["Biaya Proses Pesanan", formatRp(vProses), fmtPct(vProses)]
      );
    } else {
      details.push(
        ["Biaya Komisi Platform", formatRp(vKomisiPlatform), fmtPct(vKomisiPlatform)],
        ["Komisi Dinamis", formatRp(vKomisi), fmtPct(vKomisi)],
        ["Biaya Pemrosesan", formatRp(vProses), fmtPct(vProses)]
      );
    }

    // Variable Costs
    details.push(
        ["Biaya Layanan Mall", formatRp(vMall), fmtPct(vMall)],
        ["Biaya Komisi AMS", formatRp(vAff), fmtPct(vAff)],
        ["Campaign Payday", formatRp(vCampaign), fmtPct(vCampaign)],
        ["Live Extra", formatRp(vLive), fmtPct(vLive)],
        ["Ongkir", formatRp(vOngkir), fmtPct(vOngkir)],
        ["Cashback Bonus", formatRp(vCashback), fmtPct(vCashback)],
        ["Biaya Operasional", formatRp(vOps), fmtPct(vOps)],
        ["Voucher Xtra", formatRp(vVoucherXtra), fmtPct(vVoucherXtra)]
    );

    if (platform === 'Shopee') {
      details.push(["Biaya Transaksi", formatRp(vTransaksi), fmtPct(vTransaksi)]);
    }

    // Ads & HPP
    details.push(
        ["---", "---", "---"],
        ["Budget Iklan", formatRp(vBudgetIklan), fmtPct(vBudgetIklan)],
        ["PPN Iklan", formatRp(vPpnIklan), fmtPct(vPpnIklan)],
        ["HPP", formatRp(vHpp), fmtPct(vHpp)]
    );

    return {
      summary: [
        ["Harga Final", formatRp(finalPrice), "-"],
        ["Total Biaya Admin", formatRp(totalAdmin), fmtPct(totalAdmin)],
        ["Total Biaya All-In", formatRp(totalAllIn), fmtPct(totalAllIn)],
        ["Settlement", formatRp(settlement), fmtPct(settlement)],
        ["Laba Bersih", formatRp(profit), fmtPct(profit)],
        ["Margin Bersih", (finalPrice ? ((profit / finalPrice) * 100).toFixed(2) : "0.00") + "%", "-"],
      ],
      details: details
    };
  };

  const downloadPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = getExportData();
    
    doc.setFontSize(18);
    doc.text(`Laporan Perhitungan - ${platform} (Skenario ${scenarioId})`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Dibuat pada: ${new Date().toLocaleString()}`, 14, 28);

    doc.autoTable({
      startY: 35,
      head: [['Keterangan', 'Nilai', '% (dr Harga Final)']],
      body: data.summary,
      theme: 'grid',
      headStyles: { fillColor: platform === 'Shopee' ? [238, 77, 45] : [0, 0, 0] }
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Rincian Biaya', 'Nilai', '% (dr Harga Final)']],
      body: data.details,
      theme: 'striped',
      headStyles: { fillColor: [100, 116, 139] }
    });

    doc.save(`laporan-${platform.toLowerCase()}-skenario-${scenarioId}-${Date.now()}.pdf`);
    setIsExportOpen(false);
  };

  const downloadExcel = () => {
    const data = getExportData();
    const wsData = [
      [`Laporan Perhitungan - ${platform} (Skenario ${scenarioId})`],
      [`Tanggal: ${new Date().toLocaleString()}`],
      [],
      ["Ringkasan", "", ""],
      ["Keterangan", "Nilai", "% (dr Harga Final)"],
      ...data.summary,
      [],
      ["Rincian", "", ""],
      ["Keterangan", "Nilai", "% (dr Harga Final)"],
      ...data.details
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `laporan-${platform.toLowerCase()}-skenario-${scenarioId}-${Date.now()}.xlsx`);
    setIsExportOpen(false);
  };

  const ringFocus = platform === 'Shopee' ? 'focus:ring-orange-400' : 'focus:ring-slate-400';
  const bgLight = platform === 'Shopee' ? 'bg-orange-50' : 'bg-slate-50';
  const borderLight = platform === 'Shopee' ? 'border-orange-100' : 'border-slate-100';

  return (
    <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-2 space-y-6">
        {/* Harga & Diskon */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-50">Harga & Diskon</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputGroup label="Harga Jual (Rp)" value={hargaJual} setValue={setHargaJual} ring={ringFocus} />
            <InputGroup label="Diskon Penjual (Rp)" value={potonganOutlet} setValue={setPotonganOutlet} sub={`-${pct(outletDisc).toFixed(2)}%`} ring={ringFocus} />
          </div>
          <div className="mt-3 p-3 bg-slate-50 rounded-lg flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">Harga Final (After Disc)</span>
            <span className="font-bold text-slate-900">{formatRp(finalPrice)}</span>
          </div>
        </div>

        {/* Fix Cost (Dynamic Title) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-50">
            {platform === 'Shopee' ? 'Biaya Lainnya (Fix Cost)' : 'Biaya Administrasi (Fix Cost)'}
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {platform === 'Shopee' ? (
              <>
                <InputGroup 
                  label="Biaya Administrasi" 
                  value={komisiPlatform} 
                  setValue={setKomisiPlatform} 
                  sub={`${pct(vKomisiPlatform).toFixed(2)}%`} 
                  ring={ringFocus}
                  tooltip="Shopee mengenakan biaya administrasi 6.20% dari harga produkmu."
                />
                <InputGroup 
                  label="Biaya Layanan" 
                  value={biayaLayananPromo} 
                  setValue={setBiayaLayananPromo} 
                  sub={`${pct(vPromo).toFixed(2)}%`} 
                  ring={ringFocus}
                  tooltip={`Biaya Pembayaran 1,8% dari Subtotal Pesanan\nBiaya Layanan Promo XTRA = 4,5% dari Subtotal Pesanan\nBiaya Layanan Gratis Ongkir XTRA = 4,5% dari Subtotal Pesanan`}
                />
                <InputGroup 
                  label="Biaya Proses Pesanan" 
                  value={biayaProses} 
                  setValue={setBiayaProses} 
                  sub={`${pct(vProses).toFixed(2)}%`} 
                  ring={ringFocus}
                  tooltip="Biaya Proses Pesanan adalah biaya yang dikenakan untuk setiap pesanan terselesaikan yang dibuat mulai 20 Juli 2025."
                />
              </>
            ) : (
              <>
                <InputGroup label="Biaya Komisi Platform" value={komisiPlatform} setValue={setKomisiPlatform} sub={`${pct(vKomisiPlatform).toFixed(2)}%`} ring={ringFocus} />
                <InputGroup label="Komisi Dinamis" value={komisiDinamis} setValue={setKomisiDinamis} sub={`${pct(vKomisi).toFixed(2)}%`} ring={ringFocus} />
                <InputGroup label="Biaya Pemrosesan" value={biayaProses} setValue={setBiayaProses} sub={`${pct(vProses).toFixed(2)}%`} ring={ringFocus} />
              </>
            )}
          </div>
        </div>

        {/* Variable Cost */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-50">Biaya Administrasi Lainnya (Variable)</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputGroup label="Biaya Layanan Mall" value={biayaMall} setValue={setBiayaMall} sub={`${pct(vMall).toFixed(2)}%`} ring={ringFocus} />
            <InputGroup label="Biaya Komisi AMS" value={affiliator} setValue={setAffiliator} sub={`${pct(vAff).toFixed(2)}%`} ring={ringFocus} />
            <InputGroup label="Campaign Payday" value={campaignPayday} setValue={setCampaignPayday} sub={`${pct(vCampaign).toFixed(2)}%`} ring={ringFocus} />
            <InputGroup label="Live Extra" value={liveExtra} setValue={setLiveExtra} sub={`${pct(vLive).toFixed(2)}%`} ring={ringFocus} />
            <InputGroup label="Ongkir" value={ongkir} setValue={setOngkir} sub={`${pct(vOngkir).toFixed(2)}%`} ring={ringFocus} />
            <InputGroup label="Cashback Bonus" value={cashbackBonus} setValue={setCashbackBonus} sub={`${pct(vCashback).toFixed(2)}%`} ring={ringFocus} />
            
            <InputGroup label="Biaya Operasional" value={biayaOperasional} setValue={setBiayaOperasional} sub={`${pct(vOps).toFixed(2)}%`} ring={ringFocus} />
            <InputGroup label="Voucher Xtra" value={voucherXtra} setValue={setVoucherXtra} sub={`${pct(vVoucherXtra).toFixed(2)}%`} ring={ringFocus} />
            
            {platform === 'Shopee' && (
               <InputGroup 
                 label="Biaya Transaksi" 
                 value={biayaTransaksi} 
                 setValue={setBiayaTransaksi} 
                 sub={`${pct(vTransaksi).toFixed(2)}%`} 
                 ring={ringFocus}
                 tooltip="Biaya program 'SPayLater Xtra 0%'"
               />
            )}
          </div>
        </div>

        {/* Ads & HPP */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-50">Iklan & HPP</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputGroup label="Budget Iklan / ACOS" value={budgetIklan} setValue={setBudgetIklan} sub={`${pct(vBudgetIklan).toFixed(2)}%`} ring={ringFocus} />
            <InputGroup label="PPN Iklan" value={ppnIklan} setValue={setPpnIklan} sub={`${pct(vPpnIklan).toFixed(2)}%`} ring={ringFocus} />
            <InputGroup label="HPP / Modal Produk" value={hpp} setValue={setHpp} sub={`${pct(vHpp).toFixed(2)}%`} ring={ringFocus} />
          </div>
        </div>
      </div>

      {/* Right Column: Summary (Sticky) */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-4">
          
          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium shadow-md hover:bg-slate-800 transition-all"
            >
              <DownloadIcon />
              <span>Download Report</span>
              <ChevronDownIcon />
            </button>
            
            {isExportOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 z-50 py-1 animate-in fade-in zoom-in duration-200">
                <button 
                  onClick={downloadExcel}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <span className="text-green-600 font-bold">X</span> Excel (.xlsx)
                </button>
                <button 
                  onClick={downloadPDF}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <span className="text-red-600 font-bold">P</span> PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          {/* Main Profit Card */}
          <div className={`bg-white rounded-2xl shadow-lg border ${borderLight} overflow-hidden`}>
            <div className={`${bgLight} p-4 border-b ${borderLight}`}>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">Laba Bersih</div>
              <div className={`text-3xl font-bold ${profit < 0 ? 'text-red-600' : (platform === 'Shopee' ? 'text-orange-600' : 'text-slate-900')}`}>
                {formatRp(profit)}
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Margin Bersih</div>
                <div className={`text-lg font-semibold ${profit < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                  {finalPrice ? ((profit / finalPrice) * 100).toFixed(2) : "0.00"}%
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Settlement</div>
                <div className={`text-lg font-semibold ${settlement < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatRp(settlement)}
                </div>
              </div>
            </div>
          </div>

          {/* Detail Cards */}
          <div className="grid gap-3">
            <SummaryCard title="Total Biaya Admin" value={totalAdmin} pct={pct(totalAdmin)} />
            <SummaryCard title="Total All-In" value={totalAllIn} pct={pct(totalAllIn)} />
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard title="ROAS" value={vBudgetIklan ? roas.toFixed(2) + 'x' : '-'} sub="Omzet/Iklan" simple />
              <SummaryCard title="ROI Iklan" value={totalAdCost ? roi.toFixed(2) + '%' : '-'} sub="Profit/Biaya Iklan" simple />
            </div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg text-[10px] text-slate-500 leading-relaxed font-medium">
            Catatan: semua persentase (kecuali margin kotor vs harga jual) dihitung terhadap Harga Final setelah potongan outlet.
          </div>
        </div>
      </div>
    </div>
  );
}

// --- UI Components ---
function InputGroup({ label, value, setValue, sub, ring, tooltip }) {
  // Internal formatting state
  const [displayValue, setDisplayValue] = useState(formatNumber(value));

  // Update display if value prop changes externally (e.g. initial load or reset)
  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    // Allow numbers and dots only
    const cleanVal = val.replace(/[^0-9]/g, '');
    
    if (cleanVal === '') {
      setDisplayValue('');
      setValue(0);
    } else {
      const num = Number(cleanVal);
      setDisplayValue(formatNumber(num));
      setValue(num);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <label className="block text-xs font-bold text-slate-600">{label}</label>
        {tooltip && (
          <div className="group relative">
            <InfoIcon />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center whitespace-pre-wrap">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">Rp</span>
        <input
          type="text"
          className={`w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 ${ring} transition-all`}
          value={displayValue}
          onChange={handleChange}
          onFocus={(e) => e.target.select()}
        />
      </div>
      {sub && <div className="mt-1 text-[10px] text-slate-500 font-medium">{sub}</div>}
    </div>
  );
}

function SummaryCard({ title, value, pct, sub, simple }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
      <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">{title}</div>
      <div className="text-sm font-bold text-slate-800">{typeof value === 'number' ? formatRp(value) : value}</div>
      {!simple && <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{pct.toFixed(2)}% dari harga final</div>}
      {simple && sub && <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{sub}</div>}
    </div>
  );
}

// --- App Shell (Sidebar & Tabs) ---
function App() {
  const [activeTab, setActiveTab] = useState('tiktok'); // 'tiktok' | 'shopee'

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Cost Structure MP
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Marketplace Calculator v2.1</p>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          <NavItem 
            active={activeTab === 'tiktok'} 
            onClick={() => setActiveTab('tiktok')}
            icon={<TikTokIcon />}
            label="TikTok Shop"
          />
          <NavItem 
            active={activeTab === 'shopee'} 
            onClick={() => setActiveTab('shopee')}
            icon={<ShopeeIcon />}
            label="Shopee"
            color="orange"
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 font-medium">
            &copy; 2025 Cost Structure MP
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-20 px-4 py-3 flex items-center justify-between shadow-sm">
        <span className="font-bold text-slate-800">Cost Structure MP</span>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('tiktok')} className={`p-2 rounded-lg ${activeTab === 'tiktok' ? 'bg-slate-100' : ''}`}><TikTokIcon /></button>
          <button onClick={() => setActiveTab('shopee')} className={`p-2 rounded-lg ${activeTab === 'shopee' ? 'bg-orange-50 text-orange-600' : ''}`}><ShopeeIcon /></button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'tiktok' && <MarketplaceCalculator key="tiktok" platform="TikTok Shop" />}
          {activeTab === 'shopee' && <MarketplaceCalculator key="shopee" platform="Shopee" />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label, color = 'slate' }) {
  const activeClass = color === 'orange' 
    ? 'bg-orange-50 text-orange-600 border-orange-200' 
    : 'bg-slate-100 text-slate-900 border-slate-200';
    
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl border transition-all duration-200 ${
        active 
          ? `${activeClass} shadow-sm` 
          : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

const rootEl = document.getElementById("root");
ReactDOM.createRoot(rootEl).render(<App />);
