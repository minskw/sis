// src/app/admin/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'

export default function AdminDashboard() {
  const [registrants, setRegistrants] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'ppdb' | 'siswa'>('ppdb')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: ppdb } = await supabaseAdmin
      .from('ppdb_registrations')
      .select('*')
      .order('created_at', { ascending: false })
    if (ppdb) setRegistrants(ppdb)

    const { data: sis } = await supabaseAdmin
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
    if (sis) setStudents(sis)
    setLoading(false)
  }

  const handleAccept = async (applicant: any) => {
    if (!confirm(`Terima ${applicant.student_name} sebagai siswa?`)) return

    const { error: insertError } = await supabaseAdmin.from('students').insert([{
      ppdb_id: applicant.id,
      nisn: applicant.nisn,
      nik: applicant.nik,
      name: applicant.student_name,
      status: 'active'
    }])
    if (insertError) return alert('Gagal: ' + insertError.message)

    await supabaseAdmin.from('ppdb_registrations').update({ status: 'accepted' }).eq('id', applicant.id)
    alert('✅ Siswa berhasil diterima!')
    fetchData()
  }

  const handleReject = async (applicant: any) => {
    if (!confirm(`Tolak pendaftaran ${applicant.student_name}?`)) return
    await supabaseAdmin.from('ppdb_registrations').update({ status: 'rejected' }).eq('id', applicant.id)
    alert('Pendaftaran ditolak.')
    fetchData()
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-blue-100 text-blue-800',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  const filteredRegistrants = registrants.filter(r =>
    r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.parent_name?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.nisn?.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">⚙️ Dashboard Admin</h1>
        <button onClick={fetchData} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-700">{registrants.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Pendaftar</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-yellow-500">{registrants.filter(r => r.status === 'pending').length}</p>
          <p className="text-xs text-gray-500 mt-1">Menunggu</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-green-600">{registrants.filter(r => r.status === 'accepted').length}</p>
          <p className="text-xs text-gray-500 mt-1">Diterima</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-purple-600">{students.length}</p>
          <p className="text-xs text-gray-500 mt-1">Siswa Aktif</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('ppdb')}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'ppdb' ? 'bg-emerald-700 text-white' : 'bg-white border text-gray-600 hover:bg-emerald-50'}`}
        >
          📋 PPDB Masuk ({registrants.length})
        </button>
        <button
          onClick={() => setActiveTab('siswa')}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'siswa' ? 'bg-emerald-700 text-white' : 'bg-white border text-gray-600 hover:bg-emerald-50'}`}
        >
          🎒 Data Siswa Aktif ({students.length})
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Cari nama..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full md:w-72 border rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-300"
      />

      {loading ? (
        <div className="text-center py-16 text-gray-400">Memuat data...</div>
      ) : activeTab === 'ppdb' ? (
        <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-600">Nama Siswa</th>
                <th className="text-left p-3 font-semibold text-gray-600">Orang Tua</th>
                <th className="text-left p-3 font-semibold text-gray-600">No. HP</th>
                <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                <th className="text-left p-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrants.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Belum ada pendaftar</td></tr>
              ) : filteredRegistrants.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-emerald-50">
                  <td className="p-3 font-medium">{r.student_name}</td>
                  <td className="p-3 text-gray-600">{r.parent_name}</td>
                  <td className="p-3 text-gray-600">{r.parent_phone}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(r)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition">
                          ✓ Terima
                        </button>
                        <button onClick={() => handleReject(r)} className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded text-xs transition">
                          ✗ Tolak
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-600">Nama Siswa</th>
                <th className="text-left p-3 font-semibold text-gray-600">NISN</th>
                <th className="text-left p-3 font-semibold text-gray-600">NIK</th>
                <th className="text-left p-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Belum ada data siswa</td></tr>
              ) : filteredStudents.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-emerald-50">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-gray-600">{s.nisn || '-'}</td>
                  <td className="p-3 text-gray-600">{s.nik || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
