'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { Menu, Bell, ShieldAlert } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'

export default function DashboardLayout({children}:{children:React.ReactNode}) {
  const [open, setOpen] = useState(false)
  const { profile, loading } = useProfile()
  const router = useRouter()
  const pathname = usePathname()
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    if (loading) return

    // Belum login → ke halaman login
    if (!profile) {
      router.replace('/login')
      return
    }

    const role = profile.role

    // Tentukan prefix yang diizinkan berdasarkan role
    const allowed =
      role === 'admin' ? '/admin' :
      role === 'guru'  ? '/guru'  : '/ortu'

    // Jika user mengakses path yang bukan miliknya → tampilkan halaman tidak diizinkan
    const wrongPath =
      (pathname.startsWith('/admin') && role !== 'admin') ||
      (pathname.startsWith('/guru')  && role !== 'guru')  ||
      (pathname.startsWith('/ortu')  && role !== 'ortu')

    if (wrongPath) {
      setUnauthorized(true)
      // Redirect otomatis ke panel yang benar setelah 2 detik
      const t = setTimeout(() => router.replace(allowed), 2000)
      return () => clearTimeout(t)
    }

    setUnauthorized(false)
  }, [profile, loading, pathname])

  // Saat masih loading profil
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    )
  }

  // Jika mengakses halaman yang bukan haknya
  if (unauthorized) {
    const roleLabel = profile?.role === 'admin' ? 'Administrator' : profile?.role === 'guru' ? 'Guru' : 'Orang Tua/Wali'
    const dest = profile?.role === 'admin' ? '/admin' : profile?.role === 'guru' ? '/guru' : '/ortu'
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-red-600"/>
          </div>
          <h2 className="font-extrabold text-gray-800 text-xl mb-2">Akses Ditolak</h2>
          <p className="text-gray-500 text-sm mb-1">
            Halaman ini tidak tersedia untuk role <strong>{roleLabel}</strong>.
          </p>
          <p className="text-gray-400 text-xs">Mengalihkan ke panel Anda...</p>
          <div className="mt-4">
            <button onClick={()=>router.replace(dest)} className="btn btn-primary">
              Ke Panel {roleLabel}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={open} onClose={()=>setOpen(false)}/>
      <div className="main-content">
        <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between sticky top-0 z-20">
          <button onClick={()=>setOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100"><Menu size={20}/></button>
          <div className="hidden md:block text-sm text-gray-400">Sistem Informasi MIN Singkawang</div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell size={18} className="text-gray-500"/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
              {profile?.full_name?.charAt(0)||'U'}
            </div>
          </div>
        </header>
        <main className="p-5 md:p-7">{children}</main>
      </div>
    </div>
  )
}
