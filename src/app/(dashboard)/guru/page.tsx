'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'
import StatCard from '@/components/ui/StatCard'
import { GraduationCap, ClipboardList, BarChart3, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function GuruDashboard() {
  const { profile } = useProfile()
  const [guruData, setGuruData] = useState<any>(null)
  const [stats, setStats] = useState({ siswa:0, absensiHari:0, nilaiInput:0, jadwal:0 })

  useEffect(() => {
    if (!profile) return
    const fetch = async () => {
      const { data: g } = await supabase.from('guru').select('*').eq('user_id', profile.user_id).single()
      setGuruData(g)
      if (g) {
        const today = new Date().toISOString().split('T')[0]
        const [a, n, j] = await Promise.all([
          supabase.from('absensi').select('id',{count:'exact',head:true}).eq('guru_id',g.id).eq('tanggal',today),
          supabase.from('nilai').select('id',{count:'exact',head:true}).eq('guru_id',g.id),
          supabase.from('jadwal_pelajaran').select('id',{count:'exact',head:true}).eq('guru_id',g.id),
        ])
        setStats({ siswa:0, absensiHari:a.count||0, nilaiInput:n.count||0, jadwal:j.count||0 })
      }
    }
    fetch()
  }, [profile])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Selamat Datang, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="page-subtitle">{guruData?.jabatan || 'Guru'} — MIN Singkawang</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Absensi Hari Ini" value={stats.absensiHari} icon={ClipboardList} color="bg-emerald-100 text-emerald-700"/>
        <StatCard label="Data Nilai Input" value={stats.nilaiInput} icon={BarChart3} color="bg-blue-100 text-blue-700"/>
        <StatCard label="Slot Jadwal" value={stats.jadwal} icon={Calendar} color="bg-purple-100 text-purple-700"/>
        <StatCard label="Rombel" value="-" icon={GraduationCap} color="bg-orange-100 text-orange-700"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {href:'/guru/absensi',icon:ClipboardList,title:'Input Absensi',desc:'Catat kehadiran siswa hari ini',color:'bg-emerald-50 border-emerald-200'},
          {href:'/guru/nilai',icon:BarChart3,title:'Input Nilai',desc:'Masukkan nilai UTS/UAS/tugas',color:'bg-blue-50 border-blue-200'},
          {href:'/guru/jadwal',icon:Calendar,title:'Jadwal Saya',desc:'Lihat jadwal mengajar',color:'bg-purple-50 border-purple-200'},
        ].map(item=>(
          <Link key={item.href} href={item.href} className={`card card-pad card-hover border ${item.color}`}>
            <item.icon size={24} className="mb-3 text-gray-600"/>
            <p className="font-bold text-gray-800">{item.title}</p>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
