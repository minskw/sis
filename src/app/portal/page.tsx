'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, GraduationCap, School, ClipboardList, BarChart2, Bell, UserCheck, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function PortalDashboard() {
  const { role, profile } = useAuth()
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (role === 'admin') {
        const [siswa, guru, kelas, izin] = await Promise.all([
          supabase.from('siswa').select('id', { count: 'exact', head: true }),
          supabase.from('guru').select('id', { count: 'exact', head: true }),
          supabase.from('kelas').select('id', { count: 'exact', head: true }),
          supabase.from('izin').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ])
        setStats({ siswa: siswa.count||0, guru: guru.count||0, kelas: kelas.count||0, izinPending: izin.count||0 })
      } else if (role === 'guru') {
        const { data: guruData } = await supabase.from('guru').select('id').eq('user_id', (await supabase.auth.getUser()).data.user?.id).single()
        if (guruData) {
          const [kelas, absensiHari] = await Promise.all([
            supabase.from('kelas').select('id', { count: 'exact', head: true }).eq('wali_kelas_id', guruData.id),
            supabase.from('absensi').select('id', { count: 'exact', head: true }).eq('tanggal', new Date().toISOString().split('T')[0]),
          ])
          setStats({ kelas: kelas.count||0, absensiHari: absensiHari.count||0 })
        }
      } else if (role === 'ortu') {
        const { data: wali } = await supabase.from('wali_siswa').select('siswa_id').eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        if (wali && wali.length > 0) {
          const siswaIds = wali.map((w:any) => w.siswa_id)
          const [izin, absensi] = await Promise.all([
            supabase.from('izin').select('id', { count: 'exact', head: true }).in('siswa_id', siswaIds),
            supabase.from('absensi').select('id,status').in('siswa_id', siswaIds).gte('tanggal', new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]),
          ])
          const alpha = (absensi.data||[]).filter((a:any) => a.status === 'A').length
          setStats({ totalIzin: izin.count||0, alpha, anak: wali.length })
        }
      }
      setLoading(false)
    }
    fetchStats()
  }, [role])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 11) return 'Selamat Pagi'
    if (h < 15) return 'Selamat Siang'
    if (h < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  const adminCards = [
    { label: 'Total Siswa', value: stats.siswa??0, icon: Users, color: '#166534', href: '/portal/admin/siswa' },
    { label: 'Guru & Staff', value: stats.guru??0, icon: GraduationCap, color: '#1d4ed8', href: '/portal/admin/guru' },
    { label: 'Rombel/Kelas', value: stats.kelas??0, icon: School, color: '#7c3aed', href: '/portal/admin/kelas' },
    { label: 'Izin Pending', value: stats.izinPending??0, icon: UserCheck, color: '#b45309', href: '/portal/admin/izin' },
  ]
  const guruLinks = [
    { label: 'Input Absensi Hari Ini', icon: ClipboardList, href: '/portal/guru/absensi', color: '#166534', desc: 'Tandai kehadiran siswa' },
    { label: 'Input Nilai Siswa', icon: BarChart2, href: '/portal/guru/nilai', color: '#1d4ed8', desc: 'UTS, UAS, tugas harian' },
    { label: 'Proses Izin Siswa', icon: UserCheck, href: '/portal/guru/izin', color: '#7c3aed', desc: 'Setujui / tolak pengajuan izin' },
  ]
  const ortuLinks = [
    { label: 'Lihat Absensi Anak', icon: ClipboardList, href: '/portal/ortu/absensi', color: '#166534', desc: 'Rekap kehadiran' },
    { label: 'Lihat Nilai Anak', icon: BarChart2, href: '/portal/ortu/nilai', color: '#1d4ed8', desc: 'Perkembangan akademik' },
    { label: 'Ajukan Izin', icon: UserCheck, href: '/portal/ortu/izin', color: '#7c3aed', desc: 'Izin sakit / dispensasi' },
  ]

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
          {greeting()}, {profile?.full_name?.split(' ')[0] || 'Pengguna'} 👋
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 4 }}>
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Memuat data...</div>
      ) : role === 'admin' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {adminCards.map(c => (
              <Link key={c.label} href={c.href} style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ borderLeft: `4px solid ${c.color}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
                      <div className="stat-label">{c.label}</div>
                    </div>
                    <div style={{ width: 40, height: 40, background: `${c.color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <c.icon size={20} color={c.color} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#111827', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={16} color="#166534" /> Aksi Cepat</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Tambah Siswa', href: '/portal/admin/siswa', icon: Users },
                  { label: 'Tambah Guru', href: '/portal/admin/guru', icon: GraduationCap },
                  { label: 'Kelola PPDB', href: '/portal/admin/ppdb', icon: ClipboardList },
                  { label: 'Buat Pengumuman', href: '/portal/admin/pengumuman', icon: Bell },
                ].map(a => (
                  <Link key={a.label} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, textDecoration: 'none', border: '1px solid #e5e7eb', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                    <a.icon size={16} color="#166534" /> {a.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#111827', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={16} color="#166534" /> Info Sistem</h3>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 2 }}>
                <div>Tahun Ajaran: <b style={{ color: '#111827' }}>2024/2025</b></div>
                <div>Semester: <b style={{ color: '#111827' }}>Genap</b></div>
                <div>KKM Standar: <b style={{ color: '#111827' }}>75</b></div>
              </div>
            </div>
          </div>
        </>
      ) : role === 'guru' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {guruLinks.map(l => (
            <Link key={l.label} href={l.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 24, cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, background: `${l.color}15`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <l.icon size={24} color={l.color} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', marginBottom: 6 }}>{l.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{l.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div className="stat-card" style={{ borderLeft: '4px solid #166534' }}>
              <div className="stat-value" style={{ color: '#166534' }}>{stats.anak??0}</div>
              <div className="stat-label">Anak Terdaftar</div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
              <div className="stat-value" style={{ color: '#dc2626' }}>{stats.alpha??0}</div>
              <div className="stat-label">Alpha (30 hari)</div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #7c3aed' }}>
              <div className="stat-value" style={{ color: '#7c3aed' }}>{stats.totalIzin??0}</div>
              <div className="stat-label">Total Pengajuan Izin</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {ortuLinks.map(l => (
              <Link key={l.label} href={l.href} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 24, cursor: 'pointer' }}>
                  <div style={{ width: 48, height: 48, background: `${l.color}15`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <l.icon size={24} color={l.color} />
                  </div>
                  <div style={{ fontWeight: 700, color: '#111827', marginBottom: 6 }}>{l.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{l.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
