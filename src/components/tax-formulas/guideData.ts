export const LEGAL_BASIS = {
  pph21: [
    {
      title: 'UU HPP (Harmonisasi Peraturan Perpajakan)',
      ref: 'UU No. 7 Tahun 2021',
      desc: 'Mengatur perubahan lapisan tarif PPh Orang Pribadi dan batasan PTKP (secara implisit tetap).',
    },
    {
      title: 'Peraturan Pemerintah (PP) No. 58 Tahun 2023',
      ref: 'PP 58/2023',
      desc: 'Aturan pelaksanaan pemotongan PPh 21 menggunakan Tarif Efektif Rata-rata (TER) untuk masa pajak selain masa pajak terakhir.',
    },
    {
      title: 'Peraturan Menteri Keuangan (PMK) No. 168 Tahun 2023',
      ref: 'PMK 168/2023',
      desc: 'Petunjuk teknis pelaksanaan pemotongan pajak atas penghasilan sehubungan dengan pekerjaan, jasa, atau kegiatan Orang Pribadi.',
    }
  ],
  ppn: [
    {
      title: 'UU PPN (diubah dengan UU HPP)',
      ref: 'UU No. 42 Tahun 2009 stdtd UU No. 7 Tahun 2021',
      desc: 'Dasar hukum utama PPN. Mengatur kenaikan tarif menjadi 11% mulai 1 April 2022.',
    },
    {
      title: 'PMK No. 32/PMK.010/2019',
      ref: 'PMK 32/2019',
      desc: 'Batasan kegiatan dan jenis Jasa Kena Pajak yang atas ekspornya dikenai PPN 0%.',
    }
  ],
  pbb: [
    {
      title: 'UU HKPD (Hubungan Keuangan Pusat dan Daerah)',
      ref: 'UU No. 1 Tahun 2022',
      desc: 'Mengatur PBB-P2 sebagai pajak daerah dengan tarif maksimal 0.5% dan opsi tarif progresif.',
    },
    {
      title: 'Perda DKI Jakarta No. 1 Tahun 2024 (Contoh Daerah)',
      ref: 'Perda DKI 1/2024',
      desc: 'Contoh peraturan daerah yang mengatur tarif spesifik dan NJOPTKP di wilayah Jakarta.',
    }
  ],
  pph_badan: [
    {
      title: 'UU HPP (Harmonisasi Peraturan Perpajakan)',
      ref: 'UU No. 7 Tahun 2021',
      desc: 'Mengatur tarif umum PPh Badan 22% dan penggunaan NIK sebagai NPWP.',
    },
    {
      title: 'PP 55 Tahun 2022',
      ref: 'PP 55/2022',
      desc: 'Pengaturan lebih lanjut mengenai PPh, termasuk perlakuan Natura dan/atau Kenikmatan.',
    },
     {
      title: 'PMK 66 Tahun 2023',
      ref: 'PMK 66/2023',
      desc: 'Teknis pemotongan pajak atas Natura dan/atau Kenikmatan (Fasilitas Karyawan).',
    }
  ],
  pph_final: [
     {
      title: 'PP 55 Tahun 2022 (Pengganti PP 23/2018)',
      ref: 'PP 55/2022',
      desc: 'Aturan PPh Final UMKM 0.5% dengan batasan omzet tidak kena pajak Rp 500 juta per tahun untuk Orang Pribadi.',
    }
  ]
};

export const CASE_STUDIES = {
  pph21: [
    {
      title: 'Perhitungan Rapel Gaji (Bonus)',
      scenario: 'Budi (TK/0) menerima gaji Rp 10jt dan Bonus Rp 20jt pada bulan Juni.',
      steps: [
        'Hitung PPh 21 setahun atas Gaji saja.',
        'Hitung PPh 21 setahun atas (Gaji + Bonus).',
        'Selisihnya adalah PPh 21 atas Bonus.',
        'Jika menggunakan TER (2024): Terapkan TER kategori TK/0 pada total penghasilan bruto bulan Juni (30jt).'
      ]
    },
    {
      title: 'Resign Tengah Tahun',
      scenario: 'Ani bekerja Jan-Jun, lalu berhenti.',
      steps: [
        'Hitung penghasilan netto disetahunkan (jika ekspatriat) atau real (WNI).',
        'Untuk WNI: Hitung PPh terutang berdasarkan penghasilan sesungguhnya s.d. Juni.',
        'Bandingkan dengan pajak yang sudah dipotong Jan-Mei.',
        'Kelebihan potong harus dikembalikan perusahaan (bukti potong nihil/LB).'
      ]
    }
  ],
  ppn: [
    {
      title: 'Kredit Pajak Masukan Pembelian Aset',
      scenario: 'PT A membeli Mesin (BKP) senilai 1M (PPN 110jt) untuk produksi.',
      steps: [
        'PPN Masukan 110jt dapat dikreditkan sepenuhnya di masa pajak yang sama.',
        'Jika Penjualan (Output) bulan itu hanya 500jt (PPN 55jt).',
        'Terjadi Lebih Bayar (55jt - 110jt = -55jt).',
        'PT A bisa mengajukan restitusi atau kompensasi ke bulan berikutnya.'
      ]
    }
  ],
  pbb: [
    {
      title: 'PBB Rumah Tinggal vs Usaha',
      scenario: 'Ruko lantai 1 untuk usaha, lantai 2 untuk tempat tinggal.',
      steps: [
        'NJOP Bumi dihitung rata-rata.',
        'NJOP Bangunan mungkin dibedakan kelasnya jika penilaian individual, atau disamakan.',
        'Tarif PBB biasanya sama untuk satu SPPT, namun nilai NJOP ruko (komersial) biasanya lebih tinggi dari rumah biasa di zona yang sama.'
      ]
    }
  ]
};

export const TAX_TIPS = {
  pph21: [
    {
      title: 'Optimalisasi PTKP',
      type: 'Pribadi',
      desc: 'Pastikan status PTKP (K/0, K/1, dst) diupdate setiap awal tahun. Penambahan tanggungan (anak lahir/orang tua pensiun ikut anak) dapat mengurangi pajak secara signifikan.',
      legal: 'UU PPh Pasal 7'
    },
    {
      title: 'Zakat Pengurang Penghasilan',
      type: 'Pribadi',
      desc: 'Zakat atau sumbangan keagamaan wajib yang dibayarkan melalui badan/lembaga resmi (BAZNAS/LAZ) dapat dikurangkan dari penghasilan bruto sebelum hitung pajak.',
      legal: 'UU PPh Pasal 9 ayat (1) huruf g'
    },
    {
      title: 'Manajemen Natura (Fasilitas Kantor)',
      type: 'Perusahaan',
      desc: 'Pemberian fasilitas (laptop, mobil dinas tertentu) kadang lebih efisien dibanding tunjangan tunai. Perhatikan batasan PMK 66/2023 agar tidak menjadi objek pajak bagi karyawan namun tetap deductible bagi perusahaan.',
      legal: 'PMK 66/2023'
    }
  ],
  pph_badan: [
    {
      title: 'Biaya 3M (Deductible Expense)',
      type: 'Perusahaan',
      desc: 'Pastikan seluruh biaya operasional memiliki bukti pendukung valid (Kwitansi, Faktur) dan berkaitan dengan 3M (Mendapatkan, Menagih, Memelihara) penghasilan agar dapat dibiayakan.',
      legal: 'UU PPh Pasal 6'
    },
    {
      title: 'Pemilihan Metode Penyusutan',
      type: 'Perusahaan',
      desc: 'Pertimbangkan metode Saldo Menurun (Declining Balance) untuk aset baru guna membebankan biaya lebih besar di tahun-tahun awal, mengurangi laba fiskal dan pajak terutang saat cashflow masih ketat.',
      legal: 'UU PPh Pasal 11'
    },
    {
      title: 'Kesejahteraan Karyawan',
      type: 'Perusahaan',
      desc: 'Biaya makan minum seluruh karyawan di tempat kerja adalah 100% deductible (dapat dibiayakan) dan bukan objek pajak bagi karyawan (Non-Taxable).',
      legal: 'PMK 66/2023'
    }
  ],
  pph_final: [
    {
      title: 'Manfaat Tarif 0.5% UMKM',
      type: 'UMKM',
      desc: 'Manfaatkan tarif 0.5% dari omzet (maksimal 7 tahun untuk OP, 3-4 tahun untuk Badan). Sangat efisien jika margin laba bersih Anda di atas 2.5% (Break-even point vs Tarif Normal 22%).',
      legal: 'PP 55 Tahun 2022'
    },
    {
      title: 'Omzet Tidak Kena Pajak (OP)',
      type: 'UMKM Pribadi',
      desc: 'Untuk UMKM Orang Pribadi, omzet s.d. Rp 500 juta pertama dalam setahun TIDAK KENA PAJAK. Pajak hanya dibayar atas kelebihan omzet di atas 500 juta.',
      legal: 'PP 55 Tahun 2022'
    },
    {
      title: 'Opsi Pembukuan',
      type: 'UMKM',
      desc: 'Jika usaha sedang rugi, pertimbangkan beralih menggunakan Tarif Normal (Pembukuan). Dengan tarif normal, jika rugi tidak perlu bayar PPh (Nihil), sedangkan PPh Final tetap bayar 0.5% dari omzet walau rugi.',
      legal: 'UU KUP'
    }
  ],
  ppn: [
    {
      title: 'Manajemen Faktur Pajak Masukan',
      type: 'Perusahaan',
      desc: 'Kumpulkan Faktur Pajak Masukan dengan disiplin. Faktur Masukan berlaku 3 bulan. Jika lewat, hangus dan tidak bisa mengurangi PPN Keluaran.',
      legal: 'UU PPN Pasal 9'
    },
    {
      title: 'Restitusi Pendahuluan',
      type: 'Perusahaan',
      desc: 'Wajib Pajak Patuh atau nominal kecil dapat mengajukan pengembalian pendahuluan kelebihan bayar PPN tanpa pemeriksaan penuh (hanya penelitian).',
      legal: 'PMK 39/2018'
    }
  ],
  pbb: [
    {
      title: 'Pengajuan Pengurangan PBB',
      type: 'Pribadi/Badan',
      desc: 'Wajib pajak yang mengalami kesulitan likuiditas atau objek pajak terkena bencana dapat mengajukan permohonan pengurangan PBB terutang ke Bapenda setempat.',
      legal: 'Peraturan Daerah setempat'
    }
  ]
};
