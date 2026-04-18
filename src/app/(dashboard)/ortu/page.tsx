'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'
import Link from 'next/link'
import { GraduationCap, BarChart3, ClipboardList, MessageSquare, AlertCircle } from 'lucide-react'

export default function OrtuDashboard() {
  const { profile } = useProfile()
  const [anak, setAnak] = useState<any[]>([])
  const [stats, setStats] = useState<Record<string,any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const fetch = async () => {
      const { data: links } = await supabase.from('ortu_siswa')
        .select('*, siswa(*, kelas(nama))').eq('user_id', profile.user_id)
      setAnak((links||[]).map((l:any)=>l.siswa))

      const st: Record<string,any> = {}
      for (const link of (links||[])) {
        const siswaId = link.siswa_id
        const [ab, nv, iz] = await Promise.all([
          supabase.from('absensi').select('status').eq('siswa_id', siswaId),
          supabase.from('nilai').select('nilai_akhir').eq('siswa_id', siswaId),
          supabase.from('izin').select('status').eq('siswa_id', siswaId).eq('status','pending'),
        ])
        const abArr = ab.data||[]
        st[siswaId] = {
          hadir: abArr.filter((a:any)=>a.status==='H').length,
          totalAbsen: abArr.length,
          avgNilai: nv.data?.length ? Math.round(nv.data.reduce((a:number,n:any)=>a+(n.nilai_akhir||0),0)/nv.data.length) : '-',
          izinPending: iz.count||0,
        }
      }
      setStats(st); setLoading(false)
    }
    fetch()
  }, [profile])

  if (loading) return <div className="text-center py-20 text-gray-400">Memuat...</div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Halo, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="page-subtitle">Portal Orang Tua / Wali Murid — MIN Singkawang</p>
      </div>

      {anak.length === 0 ? (
        <div className="card card-pad text-center py-12">
          <AlertCircle size={40} className="text-orange-400 mx-auto mb-3"/>
          <p className="font-semibold text-gray-700">Akun Anda belum terhubung ke data siswa.</p>
          <p className="text-sm text-gray-400 mt-1">Silakan hubungi Admin sekolah untuk menghubungkan akun Anda.</p>
        </div>
      ) : anak.map(s => {
        const st = stats[s.id] || {}
        return (
          <div key={s.id} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xl">{s.nama?.charAt(0)}</div>
              <div>
                <h2 className="font-extrabold text-gray-800 text-lg">{s.nama}</h2>
                <p className="text-sm text-gray-500">{s.kelas?.nama||'Belum ada kelas'} • Tahun Masuk {s.tahun_masuk||'-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="card card-pad text-center">
                <p className="text-2xl font-extrabold text-emerald-700">{st.hadir||0}</p>
                <p className="text-xs text-gray-500">Hari Hadir</p>
              </div>
              <div className="card card-pad text-center">
                <p className="text-2xl font-extrabold text-blue-600">{st.totalAbsen||0}</p>
                <p className="text-xs text-gray-500">Total Absensi</p>
              </div>
              <div className="card card-pad text-center">
                <p className="text-2xl font-extrabold text-purple-600">{st.avgNilai}</p>
                <p className="text-xs text-gray-500">Rata-rata Nilai</p>
              </div>
              <div className="card card-pad text-center">
                <p className="text-2xl font-extrabold text-orange-500">{st.izinPending||0}</p>
                <p className="text-xs text-gray-500">Izin Pending</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {href:'/ortu/nilai',icon:BarChart3,label:'Lihat Nilai',c:'bg-blue-50 border-blue-200'},
                {href:'/ortu/absensi',icon:ClipboardList,label:'Lihat Absensi',c:'bg-emerald-50 border-emerald-200'},
                {href:'/ortu/izin',icon:MessageSquare,label:'Ajukan Izin',c:'bg-orange-50 border-orange-200'},
              ].map(item=>(
                <Link key={item.href} href={item.href} className={`card card-pad border card-hover flex items-center gap-3 ${item.c}`}>
                  <item.icon size={20} className="text-gray-600"/>
                  <span className="font-semibold text-sm text-gray-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
