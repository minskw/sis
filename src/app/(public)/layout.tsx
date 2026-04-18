import Link from 'next/link'
export default function PublicLayout({children}:{children:React.ReactNode}) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-emerald-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/beranda" className="flex items-center gap-3">
            <img src="https://dki.kemenag.go.id/storage/files/logo-kemenag-png-1png.png" alt="Logo" className="h-9 w-auto"/>
            <div>
              <p className="font-extrabold text-sm leading-tight">MIN Singkawang</p>
              <p className="text-emerald-300 text-[10px]">Madrasah Ibtidaiyah Negeri</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm">
            {[['Beranda','/beranda'],['Profil','/beranda#profil'],['Pengumuman','/beranda#pengumuman'],['PPDB','/beranda#ppdb']].map(([label,href])=>(
              <Link key={href} href={href} className="px-3 py-1.5 rounded-lg hover:bg-emerald-700 text-emerald-100 transition">{label}</Link>
            ))}
            <Link href="/login" className="ml-2 btn btn-sm bg-white text-emerald-800 hover:bg-emerald-50">Masuk</Link>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="bg-emerald-900 text-emerald-300 text-center text-sm py-5">
        <p className="font-semibold text-white">MIN Singkawang</p>
        <p className="text-xs mt-1">Jl. Contoh No.1 Singkawang, Kalimantan Barat | (0562) 123-456</p>
        <p className="text-xs mt-1 text-emerald-500">© 2025 Kementerian Agama RI</p>
      </footer>
    </div>
  )
}
