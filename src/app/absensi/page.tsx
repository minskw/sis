'use client'
import { useState } from 'react'

const SISWA_ABSEN = ['Ahmad Fauzan','Siti Rahmah','Muhammad Rizky','Nur Fatimah','Hendra S','Dewi Lestari','Yusuf Ali','Rina Marlina','Bagas P','Zahra N','Ilham D','Maya A','Reza F','Ayu K','Dani S']
const KELAS_LIST = ['Kelas 1A','Kelas 2A','Kelas 3A','Kelas 4A','Kelas 5A','Kelas 6A']
type Status = 'H'|'S'|'I'|'A'

export default function AbsensiPage() {
  const today = new Date().toISOString().split('T')[0]
  const [kelas, setKelas] = useState('Kelas 5A')
  const [tanggal, setTanggal] = useState(today)
  const [absen, setAbsen] = useState<Record<string,Status>>(
    Object.fromEntries(SISWA_ABSEN.map(s=>[s, Math.random()>0.1?'H':(['S','I','A'][Math.floor(Math.random()*3)] as Status)]))
  )
  const [saved, setSaved] = useState(false)

  const toggle = (nama:string, status:Status) => {
    setAbsen(prev=>({...prev,[nama]:status}))
    setSaved(false)
  }
  const save = () => { setSaved(true); alert('✅ Data absensi berhasil disimpan!') }

  const count = (s:Status) => Object.values(absen).filter(v=>v===s).length

  const badgeColor = (s:Status) => ({
    H:'bg-emerald-100 text-emerald-800 border-emerald-300',
    S:'bg-blue-100 text-blue-800 border-blue-300',
    I:'bg-yellow-100 text-yellow-800 border-yellow-300',
    A:'bg-red-100 text-red-800 border-red-300',
  }[s])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-emerald-900">✅ Absensi Siswa</h1>
        <p className="text-sm text-gray-500">Rekap kehadiran siswa harian</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <select value={kelas} onChange={e=>setKelas(e.target.value)} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          {KELAS_LIST.map(k=><option key={k}>{k}</option>)}
        </select>
        <input type="date" value={tanggal} onChange={e=>setTanggal(e.target.value)} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"/>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          {label:'Hadir',  val:count('H'), s:'H' as Status, color:'bg-emerald-50 border-emerald-200 text-emerald-700'},
          {label:'Sakit',  val:count('S'), s:'S' as Status, color:'bg-blue-50 border-blue-200 text-blue-700'},
          {label:'Izin',   val:count('I'), s:'I' as Status, color:'bg-yellow-50 border-yellow-200 text-yellow-700'},
          {label:'Alpha',  val:count('A'), s:'A' as Status, color:'bg-red-50 border-red-200 text-red-700'},
        ].map(item=>(
          <div key={item.label} className={`border rounded-xl p-3 text-center ${item.color}`}>
            <p className="text-2xl font-bold">{item.val}</p>
            <p className="text-xs font-medium mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="bg-emerald-50 border-b p-3 flex justify-between items-center">
          <p className="font-semibold text-emerald-800 text-sm">{kelas} — {new Date(tanggal).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
          <div className="flex gap-2 text-xs text-gray-500">
            <span className="px-2 py-0.5 border rounded bg-emerald-100 text-emerald-700">H=Hadir</span>
            <span className="px-2 py-0.5 border rounded bg-blue-100 text-blue-700">S=Sakit</span>
            <span className="px-2 py-0.5 border rounded bg-yellow-100 text-yellow-700">I=Izin</span>
            <span className="px-2 py-0.5 border rounded bg-red-100 text-red-700">A=Alpha</span>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 text-gray-600">No</th>
              <th className="text-left p-3 text-gray-600">Nama Siswa</th>
              <th className="p-3 text-gray-600">Status Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            {SISWA_ABSEN.map((nama, i) => (
              <tr key={nama} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 text-gray-400">{i+1}</td>
                <td className="p-3 font-medium text-gray-800">{nama}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-center">
                    {(['H','S','I','A'] as Status[]).map(s => (
                      <button key={s} onClick={()=>toggle(nama,s)}
                        className={`w-9 h-9 rounded-lg border-2 font-bold text-sm transition ${absen[nama]===s ? badgeColor(s)+' shadow-sm' : 'border-gray-200 text-gray-300 hover:border-gray-400'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={save} className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-2.5 rounded-xl font-bold transition">
          💾 Simpan Absensi
        </button>
      </div>
    </div>
  )
}
