'use client'
import { useState } from 'react'

const MAPEL = ['Matematika','Bahasa Indonesia','IPA','IPS','PKn','Bahasa Arab','Qur\'an Hadits','Fiqih','Aqidah Akhlak','SKI','PJOK','SBdP','Bahasa Inggris']
const KELAS_LIST = ['Kelas 1A','Kelas 1B','Kelas 2A','Kelas 2B','Kelas 3A','Kelas 3B','Kelas 4A','Kelas 4B','Kelas 5A','Kelas 5B','Kelas 6A','Kelas 6B']

const DEMO_NILAI = Array.from({length:15}, (_,i) => ({
  id: i+1,
  nama: ['Ahmad Fauzan','Siti Rahmah','Muhammad Rizky','Nur Fatimah','Hendra S','Dewi Lestari','Yusuf Ali','Rina Marlina','Bagas P','Zahra N','Ilham D','Maya A','Reza F','Ayu K','Dani S'][i],
  uts: Math.floor(Math.random()*30)+65,
  uas: Math.floor(Math.random()*30)+65,
  tugas: Math.floor(Math.random()*20)+75,
})).map(s => ({...s, rata: Math.round((s.uts+s.uas+s.tugas)/3)}))

export default function NilaiPage() {
  const [kelas, setKelas] = useState('Kelas 5A')
  const [mapel, setMapel] = useState('Matematika')
  const [semester, setSemester] = useState('2')

  const avg = (arr: number[]) => Math.round(arr.reduce((a,b)=>a+b,0)/arr.length)
  const avgRata = avg(DEMO_NILAI.map(s=>s.rata))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-emerald-900">📊 Data Penilaian Siswa</h1>
        <p className="text-sm text-gray-500">Rekap nilai UTS, UAS, dan tugas per mata pelajaran</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={kelas} onChange={e=>setKelas(e.target.value)} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          {KELAS_LIST.map(k=><option key={k}>{k}</option>)}
        </select>
        <select value={mapel} onChange={e=>setMapel(e.target.value)} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          {MAPEL.map(m=><option key={m}>{m}</option>)}
        </select>
        <select value={semester} onChange={e=>setSemester(e.target.value)} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          <option value="1">Semester 1 (Ganjil)</option>
          <option value="2">Semester 2 (Genap)</option>
        </select>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 flex flex-wrap gap-6">
        <div><p className="text-xs text-emerald-600">Kelas</p><p className="font-bold text-emerald-900">{kelas}</p></div>
        <div><p className="text-xs text-emerald-600">Mata Pelajaran</p><p className="font-bold text-emerald-900">{mapel}</p></div>
        <div><p className="text-xs text-emerald-600">Rata-rata Kelas</p><p className={`font-bold text-xl ${avgRata>=75?'text-emerald-600':'text-red-500'}`}>{avgRata}</p></div>
        <div><p className="text-xs text-emerald-600">Nilai Tertinggi</p><p className="font-bold text-xl text-blue-600">{Math.max(...DEMO_NILAI.map(s=>s.rata))}</p></div>
        <div><p className="text-xs text-emerald-600">Nilai Terendah</p><p className="font-bold text-xl text-orange-500">{Math.min(...DEMO_NILAI.map(s=>s.rata))}</p></div>
        <div><p className="text-xs text-emerald-600">Di Bawah KKM</p><p className="font-bold text-xl text-red-500">{DEMO_NILAI.filter(s=>s.rata<75).length} siswa</p></div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 border-b">
            <tr>
              {['No','Nama Siswa','Nilai UTS','Nilai UAS','Nilai Tugas','Rata-rata','Predikat'].map(h=>(
                <th key={h} className="text-left p-3 text-emerald-800 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEMO_NILAI.map((s,i) => {
              const pred = s.rata>=90?'A':s.rata>=80?'B':s.rata>=70?'C':s.rata>=60?'D':'E'
              const predColor = s.rata>=80?'bg-emerald-100 text-emerald-700':s.rata>=70?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'
              return (
                <tr key={s.id} className="border-b last:border-0 hover:bg-emerald-50">
                  <td className="p-3 text-gray-400">{i+1}</td>
                  <td className="p-3 font-medium">{s.nama}</td>
                  <td className="p-3 text-center">{s.uts}</td>
                  <td className="p-3 text-center">{s.uas}</td>
                  <td className="p-3 text-center">{s.tugas}</td>
                  <td className="p-3 text-center font-bold text-gray-800">{s.rata}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${predColor}`}>{pred}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
