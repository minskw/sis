'use client'
import { useState } from 'react'

const PENGUMUMAN = [
  { id:1, judul:'Jadwal Ujian Akhir Semester Genap 2024/2025', tanggal:'15 Apr 2025', kategori:'Akademik', isi:'Ujian Akhir Semester (UAS) Genap akan dilaksanakan pada tanggal 19–30 Mei 2025. Siswa diharapkan mempersiapkan diri dengan belajar lebih giat. Jadwal lengkap per mata pelajaran akan dibagikan oleh wali kelas masing-masing.', penting:true },
  { id:2, judul:'Pendaftaran PPDB Tahun Ajaran 2025/2026 Resmi Dibuka', tanggal:'10 Apr 2025', kategori:'PPDB', isi:'MIN Singkawang membuka Penerimaan Peserta Didik Baru (PPDB) untuk Tahun Ajaran 2025/2026. Pendaftaran dilakukan secara online melalui website ini. Kuota terbatas untuk 2 rombongan belajar.', penting:true },
  { id:3, judul:'Libur Hari Raya Idul Fitri 1446 H', tanggal:'5 Apr 2025', kategori:'Umum', isi:'Sehubungan dengan peringatan Hari Raya Idul Fitri 1446 H, sekolah diliburkan mulai tanggal 28 Maret – 6 April 2025. Kegiatan belajar mengajar akan kembali dimulai pada tanggal 7 April 2025.', penting:false },
  { id:4, judul:'Kegiatan Pesantren Kilat Ramadan 1446 H', tanggal:'20 Mar 2025', kategori:'Keagamaan', isi:'Pesantren Kilat akan dilaksanakan selama bulan Ramadan. Seluruh siswa wajib hadir dan membawa perlengkapan ibadah. Kegiatan meliputi tadarus, kajian, dan praktek shalat berjamaah.', penting:false },
  { id:5, judul:'Pembagian Rapor Semester Ganjil', tanggal:'15 Jan 2025', kategori:'Akademik', isi:'Rapor semester ganjil akan dibagikan pada hari Sabtu, 18 Januari 2025. Orang tua/wali murid diharapkan hadir langsung untuk mengambil rapor dan berkonsultasi dengan wali kelas.', penting:false },
  { id:6, judul:'Pertemuan Komite Sekolah', tanggal:'5 Jan 2025', kategori:'Umum', isi:'Rapat koordinasi antara pihak sekolah dan Komite Sekolah akan diadakan pada Senin, 13 Januari 2025, pukul 09.00 WIB di Aula Sekolah. Agenda: program kerja semester genap dan evaluasi anggaran.', penting:false },
]

const KATEGORI_COLOR: Record<string,string> = {
  'Akademik':'bg-blue-100 text-blue-700',
  'PPDB':'bg-emerald-100 text-emerald-700',
  'Umum':'bg-gray-100 text-gray-700',
  'Keagamaan':'bg-yellow-100 text-yellow-800',
}

export default function PengumumanPage() {
  const [open, setOpen] = useState<number|null>(null)
  const [kategori, setKategori] = useState('')
  const data = PENGUMUMAN.filter(p => kategori ? p.kategori===kategori : true)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-emerald-900">📢 Pengumuman Sekolah</h1>
        <p className="text-sm text-gray-500">Informasi, berita, dan pengumuman terbaru MIN Singkawang</p>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {['','Akademik','PPDB','Keagamaan','Umum'].map(k=>(
          <button key={k} onClick={()=>setKategori(k)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${kategori===k?'bg-emerald-700 text-white':'bg-white border text-gray-600 hover:bg-emerald-50'}`}>
            {k||'Semua'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {data.map(p => (
          <div key={p.id} className={`bg-white border rounded-xl shadow-sm overflow-hidden ${p.penting?'border-emerald-300':''}`}>
            {p.penting && <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-1">⚡ PENGUMUMAN PENTING</div>}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-gray-800 text-base leading-snug">{p.judul}</h3>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${KATEGORI_COLOR[p.kategori]||'bg-gray-100 text-gray-600'}`}>{p.kategori}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">📅 {p.tanggal}</p>
              {open===p.id ? (
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{p.isi}</p>
                  <button onClick={()=>setOpen(null)} className="text-sm text-emerald-600 font-semibold hover:underline">Sembunyikan ▲</button>
                </div>
              ) : (
                <button onClick={()=>setOpen(p.id)} className="text-sm text-emerald-600 font-semibold hover:underline">Baca selengkapnya ▼</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
