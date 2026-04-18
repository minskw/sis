'use client'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/profil-sekolah', label: 'Profil Sekolah' },
  { href: '/pengumuman', label: 'Pengumuman' },
  { href: '/siswa', label: 'Data Siswa' },
  { href: '/guru', label: 'Data Guru' },
  { href: '/kelas', label: 'Kelas' },
  { href: '/nilai', label: 'Nilai' },
  { href: '/absensi', label: 'Absensi' },
  { href: '/jadwal', label: 'Jadwal' },
  { href: '/daftar', label: 'PPDB' },
  { href: '/admin', label: 'Admin' },
]

export default function NavbarClient() {
  const { user, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-emerald-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-extrabold text-lg">
            <img
              src="https://dki.kemenag.go.id/storage/files/logo-kemenag-png-1png.png"
              alt="Logo Kemenag"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
            />
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-extrabold">MIN SINGKAWANG</p>
              <p className="text-xs text-emerald-200 font-normal">Sistem Informasi Sekolah</p>
            </div>
          </Link>

          {/* Desktop Menu - scrollable */}
          <div className="hidden md:flex items-center gap-1 text-xs font-medium overflow-x-auto">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  pathname === link.href
                    ? 'bg-emerald-600 text-white'
                    : 'hover:bg-emerald-700 text-emerald-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 ml-2 shrink-0">
            {user ? (
              <>
                <span className="text-emerald-200 text-xs max-w-[120px] truncate">
                  {profile?.full_name || user.email}
                </span>
                <button
                  onClick={signOut}
                  className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-xs transition"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-white text-emerald-800 font-bold px-4 py-1.5 rounded-lg hover:bg-emerald-50 transition text-xs"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-xl" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-emerald-700 flex flex-col gap-2 text-sm pb-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg ${pathname === link.href ? 'bg-emerald-600' : 'hover:bg-emerald-700'}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-emerald-700 pt-2 mt-1">
              {user ? (
                <button onClick={() => { signOut(); setMenuOpen(false) }} className="text-emerald-200 text-left px-3 py-2 w-full hover:bg-emerald-700 rounded-lg">
                  Keluar ({profile?.full_name || user.email})
                </button>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 bg-white text-emerald-800 font-bold rounded-lg text-center">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
