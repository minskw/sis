'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import StatCard from '@/components/ui/StatCard'
import { GraduationCap, Users, Grid3X3, ClipboardList, School, Bell, TrendingUp, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ siswa:0, guru:0, kelas:0, ppdb:0, izinPending:0 })
  const [recentPPDB, setRecentPPDB] = useState<any[]>([])
  const [recentIzin, setRecentIzin] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [s,g,k,p,i,rp,ri] = await Promise.all([
        supabaseAdmin.from('siswa').select('id',{count:'exact',head:true}),
        supabaseAdmin.from('guru').select('id',{count:'exact',head:true}),
        supabaseAdmin.from('kelas').select('id',{count:'exact',head:true}),
        supabaseAdmin.from('ppdb').select('id',{count:'exact',head:true}).eq('status','pending'),
        supabaseAdmin.from('izin').select('id',{count:'exact',head:true}).eq('status','pending'),
        supabaseAdmin.from('ppdb').select('*').order('created_at',{ascending:false}).limit(5),
        supabaseAdmin.from('izin').select('*, siswa(nama)').order('created_at',{ascending:false}).limit(5),
      ])
      setStats({siswa:s.count||0,guru:g.count||0,kelas:k.count||0,ppdb:p.count||0,izinPending:i.count||0})
      setRecentPPDB(rp.data||[])
      setRecentIzin(ri.data||[])
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Admin</h1>
        <p className="page-subtitle">Selamat datang di panel administrasi MIN Singkawang</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Siswa" value={stats.siswa} icon={GraduationCap} color="bg-emerald-100 text-emerald-700"/>
        <StatCard label="Guru & Staff" value={stats.guru} icon={Users} color="bg-blue-100 text-blue-700"/>
        <StatCard label="Rombel Aktif" value={stats.kelas} icon={Grid3X3} color="bg-purple-100 text-purple-700"/>
        <StatCard label="PPDB Pending" value={stats.ppdb} icon={School} color="bg-orange-100 text-orange-700" sub="Butuh review"/>
        <StatCard label="Izin Pending" value={stats.izinPending} icon={Bell} color="bg-red-100 text-red-700" sub="Butuh review"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent PPDB */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-bold text-gray-800">Pendaftar PPDB Terbaru</h2>
            <Link href="/admin/ppdb" className="text-sm text-emerald-600 font-semibold hover:underline">Lihat Semua</Link>
          </div>
          <div className="p-3">
            {recentPPDB.length===0?(
              <div className="text-center py-8 text-gray-400 text-sm">Belum ada pendaftar</div>
            ):recentPPDB.map(p=>(
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-700 font-bold text-sm shrink-0">
                  {p.nama_siswa?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{p.nama_siswa}</p>
                  <p className="text-xs text-gray-400">{p.nama_ortu} • {new Date(p.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <span className={`badge ${p.status==='pending'?'badge-yellow':p.status==='diterima'?'badge-green':'badge-red'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Izin */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-bold text-gray-800">Pengajuan Izin Terbaru</h2>
            <Link href="/admin/absensi" className="text-sm text-emerald-600 font-semibold hover:underline">Lihat Semua</Link>
          </div>
          <div className="p-3">
            {recentIzin.length===0?(
              <div className="text-center py-8 text-gray-400 text-sm">Belum ada pengajuan izin</div>
            ):recentIzin.map(iz=>(
              <div key={iz.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                  {iz.siswa?.nama?.charAt(0)||'?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{iz.siswa?.nama||'Unknown'}</p>
                  <p className="text-xs text-gray-400">{iz.jenis} • {iz.tanggal_mulai}</p>
                </div>
                <span className={`badge ${iz.status==='pending'?'badge-yellow':iz.status==='disetujui'?'badge-green':'badge-red'}`}>{iz.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {href:'/admin/siswa',icon:GraduationCap,label:'Kelola Siswa',color:'bg-emerald-50 border-emerald-200 text-emerald-800'},
          {href:'/admin/guru',icon:Users,label:'Kelola Guru',color:'bg-blue-50 border-blue-200 text-blue-800'},
          {href:'/admin/ppdb',icon:School,label:'Review PPDB',color:'bg-orange-50 border-orange-200 text-orange-800'},
          {href:'/admin/import',icon:TrendingUp,label:'Import Data',color:'bg-purple-50 border-purple-200 text-purple-800'},
        ].map(q=>(
          <Link key={q.href} href={q.href} className={`card card-pad card-hover border flex items-center gap-3 ${q.color}`}>
            <q.icon size={20}/>
            <span className="font-semibold text-sm">{q.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
