# Dokumentasi Teknis: Implementasi Fasilitas Pajak Pasal 31E

## Ringkasan
Dokumen ini menjelaskan implementasi fasilitas pengurangan tarif pajak penghasilan badan berdasarkan **Pasal 31E UU PPh** dalam modul Tax Planner (khususnya pada fitur Multi-Company Consolidation, PPh Badan Simulator, dan Dividend vs Salary Optimizer).

## Aturan Bisnis (Business Rules)
Berdasarkan Pasal 31E UU No. 36 Tahun 2008 dan peraturan turunannya (PP 55 Tahun 2022), Wajib Pajak badan dalam negeri dengan peredaran bruto (Omzet) sampai dengan Rp 50.000.000.000,00 (lima puluh miliar rupiah) mendapat fasilitas berupa pengurangan tarif sebesar 50% dari tarif normal (22%) yang dikenakan atas Penghasilan Kena Pajak dari bagian peredaran bruto sampai dengan Rp 4.800.000.000,00 (empat miliar delapan ratus juta rupiah).

### Logika Perhitungan
1. **Omzet ≤ Rp 4,8 Miliar**:
   - Seluruh Penghasilan Kena Pajak (PKP) mendapatkan fasilitas pengurangan tarif 50%.
   - Tarif Efektif: 11% (50% x 22%).
   - Rumus: `Pajak = PKP x 11%`

2. **Rp 4,8 Miliar < Omzet ≤ Rp 50 Miliar**:
   - Perhitungan dilakukan secara proporsional.
   - **Bagian Fasilitas**: `(4.8 M / Total Omzet) x PKP` dikenakan tarif 11%.
   - **Bagian Non-Fasilitas**: `PKP - Bagian Fasilitas` dikenakan tarif 22%.
   - Rumus: `Pajak = (Bagian Fasilitas x 11%) + (Bagian Non-Fasilitas x 22%)`

3. **Omzet > Rp 50 Miliar**:
   - Tidak mendapatkan fasilitas. Seluruh PKP dikenakan tarif normal.
   - Tarif: 22%.
   - Rumus: `Pajak = PKP x 22%`

## Alur Proses Implementasi
Implementasi dilakukan pada level komponen React (`.tsx`) dengan helper function terdedikasi.

### Komponen yang Terdampak
1. **MultiCompanyConsolidation.tsx**: Menambahkan logika 31E pada fungsi `calculateTax` untuk setiap entitas yang memilih skema pajak 'Normal'.
2. **PPhBadanSimulator.tsx**: Menambahkan input Omzet dan menerapkan logika 31E pada simulasi beban pajak tahunan.
3. **DividendSalaryOptimizer.tsx**: Menambahkan input Omzet untuk menentukan tarif PPh Badan yang lebih akurat sebelum pembagian dividen.

### Struktur Kode (Snippet)
```typescript
const calculateTax31E = (taxableIncome: number, totalRevenue: number) => {
    if (taxableIncome <= 0) return 0;
    
    // Case 1: Omzet > 50M (No Facility)
    if (totalRevenue > 50000000000) {
        return taxableIncome * 0.22;
    }

    // Case 2: Omzet <= 4.8M (Full Facility)
    if (totalRevenue <= 4800000000) {
        return taxableIncome * 0.11;
    }

    // Case 3: 4.8M < Omzet <= 50M (Partial Facility)
    const facilityPortion = (4800000000 / totalRevenue) * taxableIncome;
    const nonFacilityPortion = taxableIncome - facilityPortion;
    
    return (facilityPortion * 0.11) + (nonFacilityPortion * 0.22);
};
```

## Panduan Penggunaan (End-User)
1. **Input Data**: Pastikan pengguna memasukkan **Omzet (Peredaran Bruto)** dan **Laba Bersih (Penghasilan Kena Pajak)** dengan benar.
2. **Pilih Skema**:
   - Pilih **"UMKM (0.5%)"** jika perusahaan memenuhi syarat PP 55/2022 (Omzet < 4.8M dan masa berlaku belum habis).
   - Pilih **"Normal"** untuk menggunakan tarif umum Pasal 17. Sistem akan **secara otomatis** mendeteksi apakah perusahaan berhak mendapatkan fasilitas Pasal 31E berdasarkan Omzet yang diinput.
3. **Verifikasi**: Perhatikan label "31E" atau "Tarif Efektif" pada hasil perhitungan untuk memastikan fasilitas telah diterapkan.

## Catatan Penting
- Fitur ini mengasumsikan "Laba Bersih" yang diinput user adalah **Penghasilan Kena Pajak (PKP)** setelah koreksi fiskal.
- Validasi input memastikan nilai negatif ditangani sebagai 0 pajak.
