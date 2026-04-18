'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  BarChart2, Bell, FileText, Settings, LogOut, School, ChevronRight,
  Calendar, UserCheck, MessageSquare, Upload
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: any
  roles: string[]
}

const navItems: NavItem[] = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'guru', 'ortu'] },
  // Admin
  { href: '/portal/admin/siswa', label: 'Data Siswa', icon: Users, roles: ['admin'] },
  { href: '/portal/admin/guru', label: 'Data Guru', icon: GraduationCap, roles: ['admin'] },
  { href: '/portal/admin/kelas', label: 'Manajemen Kelas', icon: School, roles: ['admin'] },
  { href: '/portal/admin/ppdb', label: 'PPDB', icon: FileText, roles: ['admin'] },
  { href: '/portal/admin/pengumuman', label: 'Pengumuman', icon: Bell, roles: ['admin'] },
  { href: '/portal/admin/izin', label: 'Kelola Izin', icon: UserCheck, roles: ['admin'] },
  { href: '/portal/admin/akun', label: 'Manajemen Akun', icon: Settings, roles: ['admin'] },
  // Guru
  { href: '/portal/guru/absensi', label: 'Input Absensi', icon: ClipboardList, roles: ['guru'] },
  { href: '/portal/guru/nilai', label: 'Input Nilai', icon: BarChart2, roles: ['guru'] },
  { href: '/portal/guru/kelas', label: 'Kelas Saya', icon: School, roles: ['guru'] },
  { href: '/portal/guru/izin', label: 'Proses Izin', icon: UserCheck, roles: ['guru'] },
  // Ortu
  { href: '/portal/ortu/anak', label: 'Data Anak', icon: Users, roles: ['ortu'] },
  { href: '/portal/ortu/absensi', label: 'Absensi Anak', icon: ClipboardList, roles: ['ortu'] },
  { href: '/portal/ortu/nilai', label: 'Nilai Anak', icon: BarChart2, roles: ['ortu'] },
  { href: '/portal/ortu/izin', label: 'Ajukan Izin', icon: MessageSquare, roles: ['ortu'] },
  // Shared
  { href: '/portal/pengumuman', label: 'Pengumuman', icon: Bell, roles: ['guru', 'ortu'] },
]

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, role, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #166534', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Memuat...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
  if (!user) return null

  const filteredNav = navItems.filter(item => role && item.roles.includes(role))

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'guru' ? 'Guru' : 'Orang Tua/Wali'
  const roleBadgeColor = role === 'admin' ? '#166534' : role === 'guru' ? '#1d4ed8' : '#7c3aed'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: 'var(--sidebar-w)', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: '#166534', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', lineHeight: 1.2 }}>MIN Singkawang</div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Portal Sekolah</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: roleBadgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.full_name || user?.email}
              </div>
              <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 600, background: roleBadgeColor, color: 'white', padding: '1px 6px', borderRadius: 4, marginTop: 2 }}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {filteredNav.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                <item.icon size={17} className="icon" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #f1f5f9' }}>
          <Link href="/" className="sidebar-link" style={{ color: '#6b7280' }}>
            <School size={17} className="icon" /> Website Sekolah
          </Link>
          <button
            onClick={() => { signOut(); router.push('/login') }}
            className="sidebar-link"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
          >
            <LogOut size={17} className="icon" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, padding: '28px', minHeight: '100vh' }}>
        {children}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
