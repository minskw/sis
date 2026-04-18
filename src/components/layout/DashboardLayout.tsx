'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import { Menu, Bell } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
export default function DashboardLayout({children}:{children:React.ReactNode}) {
  const [open,setOpen]=useState(false)
  const {profile}=useProfile()
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
