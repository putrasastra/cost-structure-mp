import React, { useState, useEffect, useRef } from 'https://esm.sh/react@18.2.0';
import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';
import jsPDF from 'https://esm.sh/jspdf@2.5.1';
import 'https://esm.sh/jspdf-autotable@3.8.1';

const formatRp = (val) => "Rp" + (Number(val) || 0).toLocaleString("id-ID");

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.637 6.329 6.329 0 0 0 11.257-4.393V8.226c.72.67 1.705 1.074 2.781 1.074V5.715a4.848 4.848 0 0 1-.411-.029z"/></svg>
);
const ShopeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.119 4.881c-1.459-1.459-3.891-2.381-6.119-2.381-2.228 0-4.66.922-6.119 2.381-1.459 1.459-2.381 3.891-2.381 6.119 0 2.228.922 4.66 2.381 6.119 1.459 1.459 3.891 2.381 6.119 2.381 2.228 0 4.66-.922 6.119-2.381 1.459-1.459 2.381-3.891 2.381-6.119 0-2.228-.922-4.66-2.381-6.119zm-3.702 10.733c-1.237.518-2.836.185-3.436-.264-.122-.092-.139-.266-.037-.379l.69-.765c.098-.108.264-.116.373-.019.285.254 1.08.623 1.77.274.442-.224.271-.957-.369-1.168-.926-.306-2.139-.646-2.139-2.018 0-1.028.834-1.88 2.432-1.88 1.136 0 1.956.322 2.458.666.125.085.147.253.052.373l-.654.829c-.09.114-.254..133-.372.046-.32-.237-.869-.462-1.444-.462-.598 0-1.036.268-1.036.727 0 .568.742.771 1.688 1.088 1.178.395 1.964 1.023 1.964 2.218 0 1.077-.867 1.966-2.516 1.966z"/></svg>
);

function MarketplaceCalculator({ platform }) {
  const [activeScenario, setActiveScenario] = useState('A');
  return (
    <div className="container">
      <div className="header" style={{marginBottom:16}}>
        <div>
          <h2 style={{display:'flex', alignItems:'center', gap:8, margin:0}}>
            {platform === 'Shopee' ? <ShopeeIcon/> : <TikTokIcon/>}
            {platform} Calculator
          </h2>
          <p className="muted" style={{margin:'4px 0 0'}}>Kalkulasi margin dan perbandingan skenario.</p>
        </div>
        <div className="tabs">
          <button className={`tab ${activeScenario==='A'?'active':''}`} onClick={()=>setActiveScenario('A')}>Skenario A</button>
          <button className={`tab ${activeScenario==='B'?'active':''}`} onClick={()=>setActiveScenario('B')}>Skenario B</button>
        </div>
      </div>
      <div className="card" style={{padding:16}}>
        <CalculatorContent platform={platform} scenarioId={activeScenario} />
      </div>
    </div>
  );
}

function CalculatorContent({ platform, scenarioId }) {
  const [hargaJual, setHargaJual] = useState(189000);
  const [potonganOutlet, setPotonganOutlet] = useState(0);
  const [komisiPlatform, setKomisiPlatform] = useState(0);
  const [komisiDinamis, setKomisiDinamis] = useState(0);
  const [biayaProses, setBiayaProses] = useState(0);
  const [biayaLayananPromo, setBiayaLayananPromo] = useState(0);
  const [biayaGratisOngkir, setBiayaGratisOngkir] = useState(0);
  const [biayaMall, setBiayaMall] = useState(0);
  const [affiliator, setAffiliator] = useState(0);
  const [campaignPayday, setCampaignPayday] = useState(0);
  const [liveExtra, setLiveExtra] = useState(0);
  const [ongkir, setOngkir] = useState(0);
  const [cashbackBonus, setCashbackBonus] = useState(0);
  const [biayaOperasional, setBiayaOperasional] = useState(0);
  const [voucherXtra, setVoucherXtra] = useState(0);
  const [biayaTransaksi, setBiayaTransaksi] = useState(0);
  const [budgetIklan, setBudgetIklan] = useState(0);
  const [ppnIklan, setPpnIklan] = useState(0);
  const [hpp, setHpp] = useState(0);

  const gross = Number(hargaJual) || 0;
  const outletDisc = Number(potonganOutlet) || 0;
  const finalPrice = Math.max(gross - outletDisc, 0);
  const vKomisiPlatform = Number(komisiPlatform) || 0;
  const vKomisi = Number(komisiDinamis) || 0;
  const vProses = Number(biayaProses) || 0;
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
    totalAdmin = vKomisiPlatform + vPromo + vProses + vMall + vAff + vCampaign + vLive + vOngkir + vCashback + vOps + vVoucherXtra + vTransaksi + vBudgetIklan + vPpnIklan;
  } else {
    totalAdmin = vKomisiPlatform + vKomisi + vProses + vMall + vAff + vCampaign + vLive + vOngkir + vCashback + vOps + vVoucherXtra + vBudgetIklan + vPpnIklan;
  }

  const settlement = finalPrice - totalAdmin;
  const totalAllIn = totalAdmin + vHpp;
  const profit = settlement - vHpp;
  const roas = vBudgetIklan ? finalPrice / vBudgetIklan : 0;
  const totalAdCost = vBudgetIklan + vPpnIklan;
  const roi = totalAdCost ? (profit / totalAdCost) * 100 : 0;

  const exportRef = useRef(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  useEffect(() => {
    const h = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setIsExportOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fmtPct = (val) => (finalPrice ? (val / finalPrice) * 100 : 0).toFixed(2) + "%";
  const getExportData = () => {
    const summary = [
      ["Harga Final", formatRp(finalPrice), "-"],
      ["Total Biaya Admin", formatRp(totalAdmin), fmtPct(totalAdmin)],
      ["Total Biaya All-In", formatRp(totalAllIn), fmtPct(totalAllIn)],
      ["Settlement", formatRp(settlement), fmtPct(settlement)],
      ["Laba Bersih", formatRp(profit), fmtPct(profit)],
      ["Margin Bersih", (finalPrice ? ((profit / finalPrice) * 100).toFixed(2) : "0.00") + "%", "-"],
    ];
    const details = [
      ["Harga Jual", formatRp(gross), "-"],
      ["Diskon Penjual", formatRp(outletDisc), fmtPct(outletDisc)],
      ["---","---","---"],
    ];
    if (platform === 'Shopee') {
      details.push(["Biaya Administrasi", formatRp(vKomisiPlatform), fmtPct(vKomisiPlatform)], ["Biaya Layanan", formatRp(vPromo), fmtPct(vPromo)], ["Biaya Proses Pesanan", formatRp(vProses), fmtPct(vProses)]);
    } else {
      details.push(["Biaya Komisi Platform", formatRp(vKomisiPlatform), fmtPct(vKomisiPlatform)], ["Komisi Dinamis", formatRp(vKomisi), fmtPct(vKomisi)], ["Biaya Pemrosesan", formatRp(vProses), fmtPct(vProses)]);
    }
    details.push(["Biaya Layanan Mall", formatRp(vMall), fmtPct(vMall)], ["Biaya Komisi AMS", formatRp(vAff), fmtPct(vAff)], ["Campaign Payday", formatRp(vCampaign), fmtPct(vCampaign)], ["Live Extra", formatRp(vLive), fmtPct(vLive)], ["Ongkir", formatRp(vOngkir), fmtPct(vOngkir)], ["Cashback Bonus", formatRp(vCashback), fmtPct(vCashback)], ["Biaya Operasional", formatRp(vOps), fmtPct(vOps)], ["Voucher Xtra", formatRp(vVoucherXtra), fmtPct(vVoucherXtra)]);
    if (platform === 'Shopee') details.push(["Biaya Transaksi", formatRp(vTransaksi), fmtPct(vTransaksi)]);
    details.push(["---","---","---"], ["Budget Iklan", formatRp(vBudgetIklan), fmtPct(vBudgetIklan)], ["PPN Iklan", formatRp(vPpnIklan), fmtPct(vPpnIklan)], ["HPP", formatRp(vHpp), fmtPct(vHpp)]);
    return { summary, details };
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const data = getExportData();
    doc.setFontSize(18);
    doc.text(`Laporan Perhitungan - ${platform} (Skenario ${scenarioId})`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Dibuat pada: ${new Date().toLocaleString()}`, 14, 28);
    doc.autoTable({ startY: 35, head: [['Keterangan','Nilai','% (dr Harga Final)']], body: data.summary, theme: 'grid', headStyles: { fillColor: platform==='Shopee' ? [238,77,45] : [0,0,0] } });
    doc.autoTable({ startY: doc.lastAutoTable.finalY + 10, head: [['Rincian Biaya','Nilai','% (dr Harga Final)']], body: data.details, theme: 'striped', headStyles: { fillColor: [100,116,139] } });
    doc.save(`laporan-${platform.toLowerCase()}-skenario-${scenarioId}-${Date.now()}.pdf`);
    setIsExportOpen(false);
  };

  return (
    <div className="col">
      <div className="row" style={{marginBottom:12}}>
        <div className="col">
          <label>Harga Jual</label>
          <input type="number" value={hargaJual} onChange={(e)=>setHargaJual(e.target.value)} />
        </div>
        <div className="col">
          <label>Diskon Penjual</label>
          <input type="number" value={potonganOutlet} onChange={(e)=>setPotonganOutlet(e.target.value)} />
        </div>
        <div className="col">
          <label>Komisi Platform</label>
          <input type="number" value={komisiPlatform} onChange={(e)=>setKomisiPlatform(e.target.value)} />
        </div>
        {platform!=='Shopee' && (
          <div className="col">
            <label>Komisi Dinamis</label>
            <input type="number" value={komisiDinamis} onChange={(e)=>setKomisiDinamis(e.target.value)} />
          </div>
        )}
      </div>

      <div className="row" style={{marginBottom:12}}>
        <div className="col"><label>Biaya Proses</label><input type="number" value={biayaProses} onChange={(e)=>setBiayaProses(e.target.value)} /></div>
        {platform==='Shopee' && (<>
          <div className="col"><label>Biaya Layanan Promo</label><input type="number" value={biayaLayananPromo} onChange={(e)=>setBiayaLayananPromo(e.target.value)} /></div>
          <div className="col"><label>Biaya Gratis Ongkir</label><input type="number" value={biayaGratisOngkir} onChange={(e)=>setBiayaGratisOngkir(e.target.value)} /></div>
        </>)}
        <div className="col"><label>Biaya Mall</label><input type="number" value={biayaMall} onChange={(e)=>setBiayaMall(e.target.value)} /></div>
        <div className="col"><label>Komisi AMS/Affiliator</label><input type="number" value={affiliator} onChange={(e)=>setAffiliator(e.target.value)} /></div>
      </div>

      <div className="row" style={{marginBottom:12}}>
        <div className="col"><label>Campaign Payday</label><input type="number" value={campaignPayday} onChange={(e)=>setCampaignPayday(e.target.value)} /></div>
        <div className="col"><label>Live Extra</label><input type="number" value={liveExtra} onChange={(e)=>setLiveExtra(e.target.value)} /></div>
        <div className="col"><label>Ongkir</label><input type="number" value={ongkir} onChange={(e)=>setOngkir(e.target.value)} /></div>
        <div className="col"><label>Cashback Bonus</label><input type="number" value={cashbackBonus} onChange={(e)=>setCashbackBonus(e.target.value)} /></div>
      </div>

      <div className="row" style={{marginBottom:12}}>
        <div className="col"><label>Biaya Operasional</label><input type="number" value={biayaOperasional} onChange={(e)=>setBiayaOperasional(e.target.value)} /></div>
        <div className="col"><label>Voucher Xtra</label><input type="number" value={voucherXtra} onChange={(e)=>setVoucherXtra(e.target.value)} /></div>
        {platform==='Shopee' && (<div className="col"><label>Biaya Transaksi</label><input type="number" value={biayaTransaksi} onChange={(e)=>setBiayaTransaksi(e.target.value)} /></div>)}
        <div className="col"><label>Budget Iklan</label><input type="number" value={budgetIklan} onChange={(e)=>setBudgetIklan(e.target.value)} /></div>
        <div className="col"><label>PPN Iklan</label><input type="number" value={ppnIklan} onChange={(e)=>setPpnIklan(e.target.value)} /></div>
        <div className="col"><label>HPP</label><input type="number" value={hpp} onChange={(e)=>setHpp(e.target.value)} /></div>
      </div>

      <div className="row" style={{marginBottom:12}}>
        <div className="col">
          <table>
            <thead><tr><th>Keterangan</th><th>Nilai</th><th>% dr Harga Final</th></tr></thead>
            <tbody>
              <tr><td>Harga Final</td><td>{formatRp(finalPrice)}</td><td>-</td></tr>
              <tr><td>Total Biaya Admin</td><td>{formatRp(totalAdmin)}</td><td>{fmtPct(totalAdmin)}</td></tr>
              <tr><td>Total Biaya All-In</td><td>{formatRp(totalAllIn)}</td><td>{fmtPct(totalAllIn)}</td></tr>
              <tr><td>Settlement</td><td>{formatRp(settlement)}</td><td>{fmtPct(settlement)}</td></tr>
              <tr><td>Laba Bersih</td><td>{formatRp(profit)}</td><td>{fmtPct(profit)}</td></tr>
              <tr><td>ROAS</td><td>{roas.toFixed(2)}</td><td>-</td></tr>
              <tr><td>ROI Iklan</td><td>{roi.toFixed(2)}%</td><td>-</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <p className="muted">Skenario {scenarioId} • {platform}</p>
        <div ref={exportRef}>
          <button className="btn" onClick={()=>setIsExportOpen((v)=>!v)}>Export</button>
          {isExportOpen && (
            <div style={{position:'absolute', background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:8, marginTop:8}}>
              <button className="btn primary" onClick={downloadPDF}>Download PDF</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [platform, setPlatform] = useState('Shopee');
  return (
    <div className="container" style={{paddingTop:24}}>
      <div className="card" style={{padding:16, marginBottom:16}}>
        <div className="header">
          <div>
            <h1 style={{margin:0}}>Marketplace Cost Structure</h1>
            <p className="muted" style={{margin:'4px 0 0'}}>Proyek mandiri, terpisah dari Tax Planner.</p>
          </div>
          <select value={platform} onChange={(e)=>setPlatform(e.target.value)}>
            <option value="Shopee">Shopee</option>
            <option value="TikTok">TikTok</option>
          </select>
        </div>
      </div>
      <MarketplaceCalculator platform={platform} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);

