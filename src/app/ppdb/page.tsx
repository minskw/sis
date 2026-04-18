'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { School, Send, CheckCircle, User, Users, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react'

const emptyForm = {
  nama_siswa: '', nisn: '', nik: '', jenis_kelamin: 'L',
  tempat_lahir: '', tanggal_lahir: '',
  alamat: '', nama_ayah: '', nama_ibu: '', nama_wali: '',
  no_hp: '', email: '',
}

export default function PPDBPage() {
  const [form, setForm] = useState(emptyForm)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [regId, setRegId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate1 = () => {
    const e: Record<string, string> = {}
    if (!form.nama_siswa.trim()) e.nama_siswa = 'Wajib diisi'
    if (!form.jenis_kelamin) e.jenis_kelamin = 'Wajib dipilih'
    if (!form.tanggal_lahir) e.tanggal_lahir = 'Wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const validate2 = () => {
    const e: Record<string, string> = {}
    if (!form.no_hp.trim()) e.no_hp = 'Wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate2()) return
    setSubmitting(true)
    const { data, error } = await supabase.from('ppdb_pendaftaran').insert([{ ...form, status: 'pending' }]).select().single()
    if (error) { alert('Gagal mendaftar: ' + error.message); setSubmitting(false); return }
    setRegId(data.id)
    setSubmitted(true)
    setSubmitting(false)
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }))
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{ maxWidth: 480, width: '100%', padding: 40, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} color="#166534" />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#111827', marginBottom: 8 }}>Pendaftaran Berhasil!</h2>
        <p style={{ color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
          Pendaftaran atas nama <strong>{form.nama_siswa}</strong> telah diterima. Tim kami akan menghubungi Anda untuk proses selanjutnya.
        </p>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14, marginBottom: 24 }}>
          <div style={{ fontSize: '0.75rem', color: '#166534', marginBottom: 4 }}>Nomor Pendaftaran</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#166534', fontSize: '0.95rem', wordBreak: 'break-all' }}>{regId}</div>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: 20 }}>Simpan nomor pendaftaran untuk memantau status di halaman Cek Status.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/status" style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>Cek Status</Link>
          <Link href="/" style={{ padding: '10px 20px', borderRadius: 8, background: '#166534', color: 'white', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{ background: '#166534', color: 'white', padding: '0 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <School size={22} color="white" />
            <span style={{ fontWeight: 700 }}>MIN Singkawang — PPDB Online</span>
          </div>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> Beranda
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          {[{ n: 1, label: 'Data Siswa' }, { n: 2, label: 'Data Orang Tua' }, { n: 3, label: 'Konfirmasi' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: step >= s.n ? '#166534' : '#e5e7eb', color: step >= s.n ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s' }}>{step > s.n ? '✓' : s.n}</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: step >= s.n ? '#166534' : '#9ca3af', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.n ? '#166534' : '#e5e7eb', margin: '0 8px', marginBottom: 20, transition: 'background 0.2s' }} />}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 32 }}>
          {step === 1 && (
            <>
              <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} color="#166534" /> Data Calon Siswa</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nama Lengkap Calon Siswa *</label>
                  <input className="form-input" value={form.nama_siswa} onChange={f('nama_siswa')} placeholder="Sesuai akta kelahiran" />
                  {errors.nama_siswa && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.nama_siswa}</div>}
                </div>
                <div>
                  <label className="form-label">Jenis Kelamin *</label>
                  <select className="form-select" value={form.jenis_kelamin} onChange={f('jenis_kelamin')}>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">NISN</label>
                  <input className="form-input" value={form.nisn} onChange={f('nisn')} placeholder="Nomor Induk Siswa Nasional" />
                </div>
                <div>
                  <label className="form-label">NIK</label>
                  <input className="form-input" value={form.nik} onChange={f('nik')} placeholder="Nomor Induk Kependudukan" />
                </div>
                <div>
                  <label className="form-label">Tempat Lahir</label>
                  <input className="form-input" value={form.tempat_lahir} onChange={f('tempat_lahir')} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Tanggal Lahir *</label>
                  <input type="date" className="form-input" value={form.tanggal_lahir} onChange={f('tanggal_lahir')} />
                  {errors.tanggal_lahir && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.tanggal_lahir}</div>}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Alamat Lengkap</label>
                  <textarea className="form-input" rows={2} value={form.alamat} onChange={f('alamat')} style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button onClick={() => { if (validate1()) setStep(2) }} className="btn-primary" style={{ padding: '10px 28px' }}>
                  Lanjut →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={18} color="#166534" /> Data Orang Tua / Wali</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label className="form-label">Nama Ayah</label><input className="form-input" value={form.nama_ayah} onChange={f('nama_ayah')} /></div>
                <div><label className="form-label">Nama Ibu</label><input className="form-input" value={form.nama_ibu} onChange={f('nama_ibu')} /></div>
                <div style={{ gridColumn: 'span 2' }}><label className="form-label">Nama Wali (jika ada)</label><input className="form-input" value={form.nama_wali} onChange={f('nama_wali')} /></div>
                <div>
                  <label className="form-label">No. HP / WhatsApp *</label>
                  <input className="form-input" value={form.no_hp} onChange={f('no_hp')} placeholder="08xxxxxxxxxx" />
                  {errors.no_hp && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.no_hp}</div>}
                </div>
                <div><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={f('email')} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button onClick={() => setStep(1)} className="btn-secondary">← Kembali</button>
                <button onClick={() => { if (validate2()) setStep(3) }} className="btn-primary" style={{ padding: '10px 28px' }}>Lanjut →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>✓ Konfirmasi Data</h2>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                <h4 style={{ fontWeight: 700, color: '#374151', marginBottom: 12, fontSize: '0.875rem' }}>Data Calon Siswa</h4>
                {[['Nama Lengkap', form.nama_siswa], ['Jenis Kelamin', form.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'], ['NISN', form.nisn || '—'], ['Tempat/Tgl Lahir', `${form.tempat_lahir || '—'}, ${form.tanggal_lahir ? new Date(form.tanggal_lahir).toLocaleDateString('id-ID') : '—'}`], ['Alamat', form.alamat || '—']].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem' }}>
                    <span style={{ width: 160, color: '#6b7280', flexShrink: 0 }}>{l}</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                <h4 style={{ fontWeight: 700, color: '#374151', marginBottom: 12, fontSize: '0.875rem' }}>Data Orang Tua</h4>
                {[['Nama Ayah', form.nama_ayah || '—'], ['Nama Ibu', form.nama_ibu || '—'], ['No. HP', form.no_hp], ['Email', form.email || '—']].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem' }}>
                    <span style={{ width: 160, color: '#6b7280', flexShrink: 0 }}>{l}</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '0.8rem', color: '#713f12' }}>
                Dengan mendaftar, Anda menyetujui bahwa data yang diberikan adalah benar. Sekolah berhak memverifikasi keaslian data.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(2)} className="btn-secondary">← Kembali</button>
                <button onClick={handleSubmit} className="btn-primary" disabled={submitting} style={{ padding: '10px 28px' }}>
                  <Send size={16} /> {submitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
