'use client'
import { useState } from 'react'

const KELAS_DATA = [
  { id:1, nama:'Kelas 1A', wali:'Siti Aisyah, S.Pd',    jumlah:28, l:14, p:14, ruang:'R-101' },
  { id:2, nama:'Kelas 1B', wali:'Nur Hidayah, S.Pd',     jumlah:26, l:13, p:13, ruang:'R-102' },
  { id:3, nama:'Kelas 2A', wali:'Budi Santoso, S.Pd.I',  jumlah:30, l:16, p:14, ruang:'R-201' },
  { id:4, nama:'Kelas 2B', wali:'Rahma Dewi, S.Pd',      jumlah:27, l:14, p:13, ruang:'R-202' },
  { id:5, nama:'Kelas 3A', wali:'M. Rizky, S.Pd',        jumlah:29, l:15, p:14, ruang:'R-301' },
  { id:6, nama:'Kelas 3B', wali:'Liana Sari, S.Pd',      jumlah:25, l:12, p:13, ruang:'R-302' },
  { id:7, nama:'Kelas 4A', wali:'Yusuf Al-Farisi, S.Pd.I',jumlah:31, l:17, p:14, ruang:'R-401' },
  { id:8, nama:'Kelas 4B', wali:'Marlina, A.Md',         jumlah:28, l:14, p:14, ruang:'R-402' },
  { id:9, nama:'Kelas 5A', wali:'Hendra Wijaya',         jumlah:27, l:13, p:14, ruang:'R-501' },
  { id:10,nama:'Kelas 5B', wali:'Siti Aisyah, S.Pd',     jumlah:26, l:12, p:14, ruang:'R-502' },
  { id:11,nama:'Kelas 6A', wali:'Budi Santoso, S.Pd.I',  jumlah:30, l:16, p:14, ruang:'R-601' },
  { id:12,nama:'Kelas 6B', wali:'Rahma Dewi, S.Pd',      jumlah:25, l:13, p:12, ruang:'R-602' },
]

export default function KelasPage() {
  const [search, setSearch] = useState('')
  const data = KELAS_DATA.filter(k => k.nama.toLowerCase().includes(search.toLowerCase()) || k.wali.toLowerCase().includes(search.toLowerCase()))
  const total = KELAS_DATA.reduce((a,k)=>a+k.jumlah,0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-emerald-900">🏫 Manajemen Kelas</h1>
        <p className="text-sm text-gray-500">Data rombongan belajar MIN Singkawang TA 2024/2025</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-700">{KELAS_DATA.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Rombel</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">{total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Siswa</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{KELAS_DATA.reduce((a,k)=>a+k.l,0)}</p>
          <p className="text-xs text-gray-500 mt-1">Laki-laki</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-pink-500">{KELAS_DATA.reduce((a,k)=>a+k.p,0)}</p>
          <p className="text-xs text-gray-500 mt-1">Perempuan</p>
        </div>
      </div>

      <input placeholder="🔍 Cari kelas / wali kelas..." value={search} onChange={e=>setSearch(e.target.value)}
        className="border rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-300 w-64"/>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map(k => (
          <div key={k.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-emerald-300 transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-emerald-800">{k.nama}</h3>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{k.ruang}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">👩‍🏫 Wali: <span className="font-medium text-gray-700">{k.wali}</span></p>
            <div className="flex gap-3 text-sm">
              <div className="flex-1 text-center bg-gray-50 rounded-lg py-2">
                <p className="font-bold text-gray-800">{k.jumlah}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <div className="flex-1 text-center bg-blue-50 rounded-lg py-2">
                <p className="font-bold text-blue-700">{k.l}</p>
                <p className="text-xs text-gray-400">L</p>
              </div>
              <div className="flex-1 text-center bg-pink-50 rounded-lg py-2">
                <p className="font-bold text-pink-600">{k.p}</p>
                <p className="text-xs text-gray-400">P</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
