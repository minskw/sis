'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { School, Users, ClipboardList } from 'lucide-react'

export default function GuruKelas() {
  const { user } = useAuth()
  const [kelas, setKelas] = useState<any[]>([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [siswa, setSiswa] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    // Get all classes (guru can see all, or filter by wali kelas)
    supabase.from('kelas').select('*').order('nama_kelas').then(({ data }) => {
      setKelas(data || [])
      if (data && data.length > 0) setSelectedKelas(data[0].id)
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    if (!selectedKelas) return
    supabase.from('siswa').select('id, nama, nisn, jenis_kelamin, status').eq('kelas_id', selectedKelas).eq('status', 'aktif').order('nama').then(({ data }) => setSiswa(data || []))
  }, [selectedKelas])

  const kelasInfo = kelas.find(k => k.id === selectedKelas)

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: 10 }}>
          <School size={22} color="#166534" /> Daftar Kelas
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 3 }}>Data siswa per kelas</p>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select className="form-select" style={{ width: 200 }} value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}>
          {kelas.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
        </select>
      </div>
      {kelasInfo && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 20px', marginBottom: 16, display: 'flex', gap: 24 }}>
          <div><div style={{ fontSize: '0.75rem', color: '#166534' }}>Kelas</div><div style={{ fontWeight: 700 }}>{kelasInfo.nama_kelas}</div></div>
          <div><div style={{ fontSize: '0.75rem', color: '#166534' }}>Jumlah Siswa</div><div style={{ fontWeight: 700 }}>{siswa.length}</div></div>
          <div><div style={{ fontSize: '0.75rem', color: '#166534' }}>Tahun Ajaran</div><div style={{ fontWeight: 700 }}>{kelasInfo.tahun_ajaran}</div></div>
        </div>
      )}
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Memuat...</div> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>No</th><th>NISN</th><th>Nama Siswa</th><th>L/P</th><th>Status</th></tr></thead>
            <tbody>
              {siswa.length === 0
                ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Tidak ada siswa di kelas ini</td></tr>
                : siswa.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.nisn || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{s.nama}</td>
                    <td><span className={`badge ${s.jenis_kelamin === 'L' ? 'badge-blue' : 'badge-orange'}`}>{s.jenis_kelamin === 'L' ? 'L' : 'P'}</span></td>
                    <td><span className="badge badge-green">{s.status}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
