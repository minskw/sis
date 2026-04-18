'use client'
import Link from 'next/link'
import { BookOpen, Users, BarChart2, Calendar, Bell, MapPin, Phone, Mail, Award, ChevronRight, GraduationCap, School, ClipboardList } from 'lucide-react'

const stats = [
  { label: 'Siswa Aktif', value: '312', icon: Users, color: '#166534' },
  { label: 'Guru & Staff', value: '24', icon: GraduationCap, color: '#1d4ed8' },
  { label: 'Rombel', value: '12', icon: School, color: '#7c3aed' },
  { label: 'Mata Pelajaran', value: '15', icon: BookOpen, color: '#b45309' },
]

const announcements = [
  { date: '15 Apr 2025', title: 'Jadwal Ujian Akhir Semester Genap 2024/2025', tag: 'Akademik', tagColor: 'badge-green' },
  { date: '10 Apr 2025', title: 'Pendaftaran PPDB Tahun Ajaran 2025/2026 Dibuka', tag: 'PPDB', tagColor: 'badge-blue' },
  { date: '05 Apr 2025', title: 'Libur Hari Raya Idul Fitri 1446 H', tag: 'Umum', tagColor: 'badge-yellow' },
  { date: '01 Apr 2025', title: 'Pelatihan Guru Kurikulum Merdeka Belajar', tag: 'Kepegawaian', tagColor: 'badge-orange' },
]

const features = [
  { icon: ClipboardList, title: 'Absensi Digital', desc: 'Rekap kehadiran siswa real-time oleh guru kelas setiap hari' },
  { icon: BarChart2, title: 'Penilaian Online', desc: 'Input dan monitoring nilai UTS, UAS, dan tugas harian' },
  { icon: Bell, title: 'Notifikasi Izin', desc: 'Orang tua/wali dapat mengajukan izin siswa secara digital' },
  { icon: Users, title: 'PPDB Online', desc: 'Penerimaan peserta didik baru terintegrasi dan paperless' },
]

export default function PublicPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Topbar */}
      <header style={{ background: '#166534', color: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School size={22} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>MIN Singkawang</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Madrasah Ibtidaiyah Negeri</div>
            </div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/ppdb" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>PPDB Online</Link>
            <Link href="/pengumuman-publik" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>Pengumuman</Link>
            <Link href="/profil-sekolah" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>Profil</Link>
            <Link href="/login" style={{ background: 'white', color: '#166534', fontWeight: 700, fontSize: '0.875rem', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', marginLeft: 8 }}>
              Masuk Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)', color: 'white', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 99, fontSize: '0.8rem', marginBottom: 20 }}>
              <Award size={14} /> Terakreditasi A — Unggul
            </div>
            <h1 style={{ fontSize: '2.75rem', fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}>
              Sistem Informasi<br />
              <span style={{ color: '#86efac' }}>MIN Singkawang</span>
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.85, lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              Platform digital terpadu untuk administrasi sekolah, monitoring siswa, dan komunikasi antara guru dan orang tua/wali.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/ppdb" style={{ background: 'white', color: '#166534', fontWeight: 700, padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={18} /> Daftar PPDB
              </Link>
              <Link href="/login" style={{ border: '2px solid rgba(255,255,255,0.4)', color: 'white', fontWeight: 600, padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                Portal Login <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <s.icon size={28} color="rgba(255,255,255,0.7)" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827' }}>Fitur Unggulan</h2>
          <p style={{ color: '#6b7280', marginTop: 8 }}>Semua kebutuhan manajemen sekolah dalam satu platform</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {features.map(f => (
            <div key={f.title} className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, background: '#f0fdf4', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <f.icon size={26} color="#166534" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, color: '#111827' }}>{f.title}</h3>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* News + Kalender */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 64px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} color="#166534" /> Pengumuman Terbaru
            </h3>
            <Link href="/pengumuman-publik" style={{ color: '#166534', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              Lihat Semua <ChevronRight size={14} />
            </Link>
          </div>
          {announcements.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 16, marginBottom: 16, borderBottom: i < announcements.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ minWidth: 52, textAlign: 'center', background: '#f0fdf4', borderRadius: 10, padding: '8px 6px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', lineHeight: 1 }}>{a.date.split(' ')[0]}</div>
                <div style={{ fontSize: '0.65rem', color: '#15803d' }}>{a.date.split(' ')[1]}</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', marginBottom: 6 }}>{a.title}</div>
                <span className={`badge ${a.tagColor}`}>{a.tag}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Calendar size={18} color="#166534" /> Kalender Akademik
            </h3>
            {[
              { label: 'UTS Semester Genap', val: '17–28 Mar', done: true },
              { label: 'UAS Semester Genap', val: '19–30 Mei', done: false },
              { label: 'Pembagian Rapor', val: '14 Jun 2025', done: false },
              { label: 'Libur Kenaikan Kelas', val: '16–20 Jun', done: false },
              { label: 'Awal Tahun Ajaran Baru', val: '14 Jul 2025', done: false },
            ].map((ev, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ fontSize: '0.8rem', color: ev.done ? '#9ca3af' : '#374151', textDecoration: ev.done ? 'line-through' : 'none' }}>{ev.label}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: ev.done ? '#9ca3af' : '#166534' }}>{ev.val}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 24, background: '#166534', border: 'none', color: 'white' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>Akses Portal</h4>
            {[
              { label: 'Admin Sekolah', href: '/login', color: '#86efac' },
              { label: 'Guru / Staff', href: '/login', color: '#93c5fd' },
              { label: 'Orang Tua / Wali', href: '/login', color: '#fcd34d' },
            ].map(item => (
              <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>{item.label}</span>
                <ChevronRight size={14} color="rgba(255,255,255,0.6)" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111827', color: 'rgba(255,255,255,0.6)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <School size={24} color="#4ade80" />
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>MIN Singkawang</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>Madrasah Ibtidaiyah Negeri Singkawang — Membentuk generasi berakhlak mulia, cerdas, dan berprestasi.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>Kontak</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: MapPin, text: 'Jl. Contoh No. 1, Singkawang' },
                { icon: Phone, text: '(0562) 123-456' },
                { icon: Mail, text: 'min.singkawang@kemenag.go.id' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                  <item.icon size={14} color="#4ade80" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>Tautan</h4>
            {['PPDB Online', 'Profil Sekolah', 'Pengumuman', 'Portal Login'].map(l => (
              <div key={l} style={{ marginBottom: 6 }}>
                <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textDecoration: 'none' }}>{l}</Link>
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '24px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '0.8rem' }}>
          © 2025 MIN Singkawang — Sistem Informasi Sekolah Terpadu
        </div>
      </footer>
    </div>
  )
}
