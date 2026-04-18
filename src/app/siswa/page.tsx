'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'

export default function SiswaPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kelasFilter, setKelasFilter] = useState('')

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    setLoading(true)
    const { data } = await supabaseAdmin.from('students').select('*').order('name')
    setStudents(data || [])
    setLoading(false)
  }

  const filtered = students.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.nisn?.includes(search)
    const matchKelas = kelasFilter ? s.kelas === kelasFilter : true
    return matchSearch && matchKelas
  })

  const kelasList = [...new Set(students.map(s => s.kelas).filter(Boolean))].sort()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-900">🎒 Data Siswa</h1>
          <p className="text-sm text-gray-500">Daftar seluruh siswa aktif MIN Singkawang</p>
        </div>
        <button onClick={fetchStudents} className="text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg transition">🔄 Refresh</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-700">{students.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Siswa</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{students.filter(s=>s.gender==='L').length}</p>
          <p className="text-xs text-gray-500 mt-1">Laki-laki</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-pink-500">{students.filter(s=>s.gender==='P').length}</p>
          <p className="text-xs text-gray-500 mt-1">Perempuan</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{kelasList.length}</p>
          <p className="text-xs text-gray-500 mt-1">Rombel</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="🔍 Cari nama / NISN..." value={search} onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 w-64" />
        <select value={kelasFilter} onChange={e => setKelasFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          <option value="">Semua Kelas</option>
          {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {loading ? <div className="text-center py-16 text-gray-400">Memuat data...</div> : (
        <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50 border-b">
              <tr>
                <th className="text-left p-3 text-emerald-800 font-semibold">No</th>
                <th className="text-left p-3 text-emerald-800 font-semibold">Nama Siswa</th>
                <th className="text-left p-3 text-emerald-800 font-semibold">NISN</th>
                <th className="text-left p-3 text-emerald-800 font-semibold">Kelas</th>
                <th className="text-left p-3 text-emerald-800 font-semibold">L/P</th>
                <th className="text-left p-3 text-emerald-800 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">
                  {students.length === 0 ? 'Belum ada data siswa. Terima siswa melalui menu PPDB → Admin.' : 'Data tidak ditemukan'}
                </td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-emerald-50">
                  <td className="p-3 text-gray-400">{i+1}</td>
                  <td className="p-3 font-medium text-gray-800">{s.name}</td>
                  <td className="p-3 text-gray-500">{s.nisn || '-'}</td>
                  <td className="p-3 text-gray-500">{s.kelas || '-'}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.gender==='L'?'bg-blue-100 text-blue-700':'bg-pink-100 text-pink-700'}`}>{s.gender||'-'}</span></td>
                  <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-semibold">{s.status||'active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
