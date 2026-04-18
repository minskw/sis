'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Users, Calendar, MapPin } from 'lucide-react'

export default function OrtuAnak() {
  const { user } = useAuth()
  const [anak, setAnak] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('wali_siswa').select('*, siswa(*, kelas(nama_kelas))').eq('user_id', user.id).then(({ data }) => {
      setAnak((data||[]).map((w:any) => w.siswa))
      setLoading(false)
    })
  }, [user])

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'#9ca3af' }}>Memuat...</div>

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><Users size={22} color="#166534"/> Data Anak</h1>
        <p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>Informasi siswa yang terdaftar sebagai anak Anda</p>
      </div>
      {anak.length === 0 ? (
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <Users size={40} color="#d1d5db" style={{ margin:'0 auto 12px' }}/>
          <p style={{ color:'#9ca3af' }}>Tidak ada data anak yang dihubungkan ke akun ini.</p>
          <p style={{ color:'#9ca3af', fontSize:'0.8rem', marginTop:6 }}>Hubungi admin sekolah untuk menghubungkan akun Anda dengan data siswa.</p>
        </div>
      ) : anak.map(a => a && (
        <div key={a.id} className="card" style={{ padding:24, marginBottom:16 }}>
          <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
            <div style={{ width:64, height:64, background: a.jenis_kelamin==='L'?'#dbeafe':'#fce7f3', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Users size={28} color={a.jenis_kelamin==='L'?'#1d4ed8':'#be185d'}/>
            </div>
            <div style={{ flex:1 }}>
              <h2 style={{ fontWeight:800, fontSize:'1.2rem', color:'#111827', marginBottom:4 }}>{a.nama}</h2>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <span className={`badge ${a.jenis_kelamin==='L'?'badge-blue':'badge-orange'}`}>{a.jenis_kelamin==='L'?'Laki-laki':'Perempuan'}</span>
                <span className="badge badge-green">{a.status}</span>
                {a.kelas && <span className="badge badge-blue">{a.kelas.nama_kelas}</span>}
              </div>
              <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['NISN',a.nisn||'—'],['Tanggal Lahir',a.tanggal_lahir?new Date(a.tanggal_lahir).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}):'—'],['Tempat Lahir',a.tempat_lahir||'—'],['Alamat',a.alamat||'—']].map(([l,v])=>(
                  <div key={l}>
                    <div style={{ fontSize:'0.75rem', color:'#9ca3af', marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#374151' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
