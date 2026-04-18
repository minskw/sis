'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { School, Bell, Search, ArrowLeft } from 'lucide-react'

export default function PengumumanPublik() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('pengumuman').select('*').eq('target_role', 'semua').order('tanggal', { ascending: false }).then(({ data: p }) => { setData(p || []); setLoading(false) })
  }, [])

  const filtered = data.filter(p => p.judul.toLowerCase().includes(search.toLowerCase()))
  const katColor: Record<string, string> = { Umum: 'badge-gray', Akademik: 'badge-green', PPDB: 'badge-blue', Kegiatan: 'badge-orange' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#166534', color: 'white', padding: '0 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><School size={20} color="white" /><span style={{ fontWeight: 700 }}>Pengumuman Sekolah</span></div>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={14} /> Beranda</Link>
        </div>
      </header>
      <div style={{ maxWidth: 760, margin: '32px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Bell size={22} color="#166534" />
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#111827' }}>Pengumuman Terbaru</h1>
        </div>
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Cari pengumuman..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Memuat...</div>
          : filtered.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Belum ada pengumuman</div>
          : filtered.map(p => (
            <div key={p.id} className="card" style={{ padding: 24, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                <span className={`badge ${katColor[p.kategori] || 'badge-gray'}`}>{p.kategori}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto' }}>{new Date(p.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: 8 }}>{p.judul}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{p.isi}</p>
            </div>
          ))}
      </div>
    </div>
  )
}
