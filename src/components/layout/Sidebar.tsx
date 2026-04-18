'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProfile } from '@/hooks/useProfile'
import { LayoutDashboard, Users, BarChart3, ClipboardList, Calendar, Megaphone, FileUp, LogOut, School, GraduationCap, MessageSquare, Grid3X3, ChevronRight } from 'lucide-react'

const adminNav=[
  {section:'Overview',items:[{href:'/admin',icon:LayoutDashboard,label:'Dashboard'},{href:'/admin/pengumuman',icon:Megaphone,label:'Pengumuman'}]},
  {section:'Akademik',items:[{href:'/admin/siswa',icon:GraduationCap,label:'Data Siswa'},{href:'/admin/guru',icon:Users,label:'Data Guru'},{href:'/admin/kelas',icon:Grid3X3,label:'Kelas & Rombel'},{href:'/admin/jadwal',icon:Calendar,label:'Jadwal Pelajaran'},{href:'/admin/nilai',icon:BarChart3,label:'Rekap Nilai'},{href:'/admin/absensi',icon:ClipboardList,label:'Rekap Absensi'}]},
  {section:'PPDB & Data',items:[{href:'/admin/ppdb',icon:School,label:'PPDB Online'},{href:'/admin/import',icon:FileUp,label:'Import Excel'}]},
]
const guruNav=[{section:'Menu Guru',items:[{href:'/guru',icon:LayoutDashboard,label:'Dashboard'},{href:'/guru/absensi',icon:ClipboardList,label:'Input Absensi'},{href:'/guru/nilai',icon:BarChart3,label:'Input Nilai'},{href:'/guru/jadwal',icon:Calendar,label:'Jadwal Saya'}]}]
const ortuNav=[{section:'Menu Orang Tua',items:[{href:'/ortu',icon:LayoutDashboard,label:'Dashboard'},{href:'/ortu/nilai',icon:BarChart3,label:'Nilai Anak'},{href:'/ortu/absensi',icon:ClipboardList,label:'Absensi Anak'},{href:'/ortu/izin',icon:MessageSquare,label:'Pengajuan Izin'}]}]

export default function Sidebar({isOpen,onClose}:{isOpen:boolean;onClose:()=>void}) {
  const {profile,signOut}=useProfile()
  const pathname=usePathname()
  const nav=profile?.role==='admin'?adminNav:profile?.role==='guru'?guruNav:ortuNav
  const roleLabel=profile?.role==='admin'?'Administrator':profile?.role==='guru'?'Guru':'Orang Tua/Wali'
  const roleColor=profile?.role==='admin'?'badge-green':profile?.role==='guru'?'badge-blue':'badge-orange'
  const isActive=(href:string)=>href==='/admin'||href==='/guru'||href==='/ortu'?pathname===href:pathname.startsWith(href)

  return (
    <>
      {isOpen&&<div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={onClose}/>}
      <aside className={`sidebar ${isOpen?'open':''} flex flex-col`}>
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <img src="https://dki.kemenag.go.id/storage/files/logo-kemenag-png-1png.png" alt="Logo" className="h-9 w-auto"/>
            <div>
              <p className="font-extrabold text-emerald-800 text-sm leading-tight">MIN Singkawang</p>
              <p className="text-[11px] text-gray-400">Sistem Informasi Sekolah</p>
            </div>
          </Link>
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {profile?.full_name?.charAt(0)||'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{profile?.full_name||'...'}</p>
              <span className={`badge ${roleColor} text-[10px]`}>{roleLabel}</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {nav.map(sec=>(
            <div key={sec.section} className="mb-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">{sec.section}</p>
              {sec.items.map(item=>{
                const active=isActive(item.href)
                return (
                  <Link key={item.href} href={item.href} onClick={onClose}
                    className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium ${active?'bg-emerald-700 text-white shadow-sm':'text-gray-600 hover:bg-gray-100'}`}>
                    <item.icon size={16} className={active?'':'opacity-60'}/>
                    <span className="flex-1">{item.label}</span>
                    {active&&<ChevronRight size={13} className="opacity-70"/>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={signOut} className="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut size={16}/><span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
