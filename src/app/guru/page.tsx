'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'

const DEMO_GURU = [
  { id:1, nip:'198501012010011001', name:'Drs. Ahmad Fauzi, M.Pd', jabatan:'Kepala Sekolah', mapel:'', status:'PNS' },
  { id:2, nip:'199002022015012002', name:'Siti Aisyah, S.Pd', jabatan:'Wali Kelas 1A', mapel:'Matematika', status:'PNS' },
  { id:3, nip:'198803032017011003', name:'Budi Santoso, S.Pd.I', jabatan:'Wali Kelas 2A', mapel:'Qur\'an Hadits', status:'PNS' },
  { id:4, nip:'', name:'Nur Hidayah, S.Pd', jabatan:'Guru Kelas', mapel:'Bahasa Indonesia', status:'GTT' },
  { id:5, nip:'', name:'M. Rizky, S.Pd', jabatan:'Guru Kelas', mapel:'IPA', status:'GTT' },
  { id:6, nip:'199504052020012006', name:'Rahma Dewi, S.Pd', jabatan:'Guru Kelas', mapel:'IPS', status:'PNS' },
  { id:7, nip:'', name:'Yusuf Al-Farisi, S.Pd.I', jabatan:'Guru PAI', mapel:'Fiqih, Aqidah', status:'GTT' },
  { id:8, nip:'', name:'Liana Sari, S.Pd', jabatan:'Guru PJOK', mapel:'PJOK', status:'GTT' },
  { id:9, nip:'', name:'Hendra Wijaya', jabatan:'Staf TU', mapel:'-', status:'PTT' },
  { id:10, nip:'', name:'Marlina, A.Md', jabatan:'Pustakawan', mapel:'-', status:'PTT' },
]

export default function GuruPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const data = DEMO_GURU.filter(g => {
    const m = g.name.toLowerCase().includes(search.toLowerCase()) || g.jabatan.toLowerCase().includes(search.toLowerCase())
    const s = statusFilter ? g.status === statusFilter : true
    return m && s
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-emerald-900">👨‍🏫 Data Guru & Staff</h1>
        <p className="text-sm text-gray-500">Daftar tenaga pendidik dan kependidikan MIN Singkawang</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total Guru/Staff', val: DEMO_GURU.length, color:'text-emerald-700' },
          { label:'PNS', val: DEMO_GURU.filter(g=>g.status==='PNS').length, color:'text-blue-600' },
          { label:'GTT/Honorer', val: DEMO_GURU.filter(g=>g.status==='GTT').length, color:'text-orange-500' },
          { label:'PTT', val: DEMO_GURU.filter(g=>g.status==='PTT').length, color:'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-xl p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input placeholder="🔍 Cari nama / jabatan..." value={search} onChange={e=>setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 w-64"/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          <option value="">Semua Status</option>
          <option value="PNS">PNS</option>
          <option value="GTT">GTT/Honorer</option>
          <option value="PTT">PTT</option>
        </select>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 border-b">
            <tr>
              {['No','Nama','NIP','Jabatan','Mata Pelajaran','Status'].map(h => (
                <th key={h} className="text-left p-3 text-emerald-800 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((g, i) => (
              <tr key={g.id} className="border-b last:border-0 hover:bg-emerald-50">
                <td className="p-3 text-gray-400">{i+1}</td>
                <td className="p-3 font-medium text-gray-800">{g.name}</td>
                <td className="p-3 text-gray-500 text-xs">{g.nip||'-'}</td>
                <td className="p-3 text-gray-600">{g.jabatan}</td>
                <td className="p-3 text-gray-500">{g.mapel||'-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    g.status==='PNS'?'bg-blue-100 text-blue-700':
                    g.status==='GTT'?'bg-orange-100 text-orange-700':
                    'bg-gray-100 text-gray-600'}`}>{g.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
