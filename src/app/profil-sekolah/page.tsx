'use client'
import Link from 'next/link'
import { School, MapPin, Phone, Mail, Award, Users, BookOpen, ArrowLeft } from 'lucide-react'

export default function ProfilSekolah() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#166534', color: 'white', padding: '0 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><School size={20} color="white" /><span style={{ fontWeight: 700 }}>Profil Sekolah</span></div>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={14} /> Beranda</Link>
        </div>
      </header>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #14532d, #15803d)', borderRadius: 16, padding: 32, color: 'white', marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <School size={40} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>Kementerian Agama RI</div>
            <h1 style={{ fontWeight: 900, fontSize: '1.75rem', marginBottom: 4 }}>Madrasah Ibtidaiyah Negeri Singkawang</h1>
            <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>MIN Singkawang — Melahirkan Generasi Qurani yang Berilmu dan Berakhlak Mulia</p>
          </div>
          <div style={{ textAlign: 'center', marginLeft: 'auto', flexShrink: 0 }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: 4 }}>Akreditasi</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fde047', lineHeight: 1 }}>A</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Unggul</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div>
            {/* Identitas */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#111827', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><School size={16} color="#166534" /> Identitas Sekolah</h3>
              {[['Nama Sekolah', 'Madrasah Ibtidaiyah Negeri Singkawang'], ['NSM', '111161720001'], ['NPSN', '60729801'], ['Jenjang', 'MI (Madrasah Ibtidaiyah)'], ['Status', 'Negeri (MAN)'], ['Tahun Berdiri', '1956'], ['Kepala Sekolah', 'Drs. Ahmad Fauzi, M.Pd']].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                  <span style={{ width: 180, color: '#6b7280', flexShrink: 0 }}>{l}</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                </div>
              ))}
            </div>
            {/* Visi */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#111827', fontSize: '1rem' }}>Visi</h3>
              <p style={{ color: '#374151', lineHeight: 1.7, fontSize: '0.875rem', fontStyle: 'italic' }}>
                "Terwujudnya madrasah yang unggul dalam prestasi, berkarakter islami, dan berwawasan lingkungan untuk mencetak generasi penerus bangsa yang beriman, bertaqwa, berilmu, dan berakhlak mulia."
              </p>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#111827', fontSize: '1rem' }}>Misi</h3>
              <ul style={{ color: '#374151', lineHeight: 1.9, fontSize: '0.875rem', paddingLeft: 20 }}>
                {['Menyelenggarakan pembelajaran berbasis kurikulum yang inovatif dan bermutu', 'Membentuk karakter siswa yang berakhlakul karimah berdasarkan Al-Qur\'an dan As-Sunnah', 'Mengembangkan potensi akademik dan non-akademik siswa secara optimal', 'Membangun lingkungan madrasah yang kondusif, bersih, dan asri', 'Menjalin kemitraan aktif dengan orang tua dan masyarakat'].map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          </div>
          <div>
            {/* Kontak */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, color: '#111827', fontSize: '0.95rem' }}>Kontak & Lokasi</h3>
              {[{ icon: MapPin, text: 'Jl. Contoh No. 1, Singkawang, Kalimantan Barat 79113' }, { icon: Phone, text: '(0562) 123-456' }, { icon: Mail, text: 'min.singkawang@kemenag.go.id' }].map(item => (
                <div key={item.text} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: '0.85rem', color: '#374151' }}>
                  <item.icon size={16} color="#166534" style={{ flexShrink: 0, marginTop: 2 }} />
                  {item.text}
                </div>
              ))}
            </div>
            {/* Stats */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, color: '#111827', fontSize: '0.95rem' }}>Data Sekolah</h3>
              {[{ icon: Users, label: 'Siswa Aktif', value: '312' }, { icon: Users, label: 'Guru & Staff', value: '24' }, { icon: School, label: 'Rombel', value: '12' }, { icon: BookOpen, label: 'Mata Pelajaran', value: '15' }].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                  <item.icon size={16} color="#166534" />
                  <span style={{ flex: 1, color: '#374151' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: '#166534' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#166534', borderRadius: 12, padding: 20, color: 'white' }}>
              <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Daftar Sekarang</h4>
              <p style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: 14, lineHeight: 1.6 }}>PPDB Tahun Ajaran 2025/2026 sudah dibuka!</p>
              <Link href="/ppdb" style={{ display: 'block', background: 'white', color: '#166534', fontWeight: 700, padding: '10px', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontSize: '0.85rem' }}>Daftar PPDB Online</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
