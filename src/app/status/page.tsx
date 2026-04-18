'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { School, Search, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function StatusPage() {
  const [regId, setRegId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const handleCek = async () => {
    if (!regId.trim()) return
    setLoading(true); setNotFound(false); setResult(null)
    const { data } = await supabase.from('ppdb_pendaftaran').select('*').eq('id', regId.trim()).single()
    if (data) setResult(data); else setNotFound(true)
    setLoading(false)
  }

  const statusConfig: Record<string, { icon: any; label: string; color: string; bg: string; desc: string }> = {
    pending: { icon: Clock, label: 'Menunggu Verifikasi', color: '#b45309', bg: '#fef9c3', desc: 'Pendaftaran Anda sedang diproses oleh tim administrasi sekolah.' },
    diterima: { icon: CheckCircle, label: 'Diterima', color: '#166534', bg: '#dcfce7', desc: 'Selamat! Calon siswa dinyatakan DITERIMA. Silakan hubungi sekolah untuk proses pendaftaran ulang.' },
    ditolak: { icon: XCircle, label: 'Tidak Diterima', color: '#dc2626', bg: '#fee2e2', desc: 'Mohon maaf, pendaftaran tidak dapat dilanjutkan. Silakan hubungi sekolah untuk informasi lebih lanjut.' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#166534', color: 'white', padding: '0 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <School size={20} color="white" />
            <span style={{ fontWeight: 700 }}>Cek Status Pendaftaran</span>
          </div>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> Beranda
          </Link>
        </div>
      </header>
      <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 24px' }}>
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111827', marginBottom: 8 }}>Cek Status PPDB</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: 24 }}>Masukkan nomor pendaftaran yang Anda terima saat mendaftar.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="form-input" style={{ flex: 1 }} placeholder="Masukkan nomor pendaftaran..." value={regId} onChange={e => setRegId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCek()} />
            <button onClick={handleCek} className="btn-primary" disabled={loading}>
              <Search size={16} /> {loading ? 'Mencari...' : 'Cek'}
            </button>
          </div>
          {notFound && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16, marginTop: 20, fontSize: '0.875rem', color: '#b91c1c' }}>
              Nomor pendaftaran tidak ditemukan. Pastikan nomor yang Anda masukkan benar.
            </div>
          )}
          {result && (() => {
            const cfg = statusConfig[result.status] || statusConfig.pending
            const Icon = cfg.icon
            return (
              <div style={{ marginTop: 24 }}>
                <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <Icon size={28} color={cfg.color} style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: cfg.color, fontSize: '1rem' }}>{cfg.label}</div>
                    <div style={{ fontSize: '0.85rem', color: '#374151', marginTop: 4, lineHeight: 1.6 }}>{cfg.desc}</div>
                    {result.catatan && <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 8, fontStyle: 'italic' }}>Catatan: {result.catatan}</div>}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
                  {[['Nama Siswa', result.nama_siswa], ['Jenis Kelamin', result.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'], ['Tgl. Pendaftaran', new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })], ['No. HP', result.no_hp]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
                      <span style={{ width: 150, color: '#6b7280', flexShrink: 0 }}>{l}</span>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
