'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Bell, Search } from 'lucide-react'

export default function PortalPengumuman() {
  const { role } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('pengumuman')
      .select('*')
      .or(`target_role.eq.semua,target_role.eq.${role}`)
      .order('tanggal', { ascending: false })
      .then(({ data: p }) => { setData(p||[]); setLoading(false) })
  }, [role])

  const filtered = data.filter(p => p.judul.toLowerCase().includes(search.toLowerCase()) || p.isi.toLowerCase().includes(search.toLowerCase()))
  const katColor: Record<string, string> = { Umum:'badge-gray', Akademik:'badge-green', PPDB:'badge-blue', Kegiatan:'badge-orange', Kepegawaian:'badge-yellow' }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={22} color="#166534" /> Pengumuman
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 3 }}>Informasi terbaru dari sekolah</p>
      </div>
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
        <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Cari pengumuman..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Memuat...</div>
        : filtered.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Belum ada pengumuman</div>
        : filtered.map(p => (
          <div key={p.id} className="card" style={{ padding: 22, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`badge ${katColor[p.kategori] || 'badge-gray'}`}>{p.kategori}</span>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto' }}>
                {new Date(p.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: 8, fontSize: '0.975rem' }}>{p.judul}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{p.isi}</p>
          </div>
        ))}
    </div>
  )
}
