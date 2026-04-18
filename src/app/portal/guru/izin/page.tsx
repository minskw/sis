'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { UserCheck, CheckCircle, XCircle, Eye, X } from 'lucide-react'

export default function GuruIzin() {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewItem, setViewItem] = useState<any>(null)

  useEffect(() => { fetchData() }, [])
  const fetchData = async () => {
    setLoading(true)
    const { data: izin } = await supabase.from('izin').select('*, siswa(nama, kelas(nama_kelas))').order('created_at', { ascending:false })
    setData(izin||[]); setLoading(false)
  }
  const handleProcess = async (id:string, status:'disetujui'|'ditolak') => {
    await supabase.from('izin').update({ status, diproses_oleh:user?.id }).eq('id', id)
    fetchData(); setViewItem(null)
  }
  const statusBadge:Record<string,string> = { pending:'badge-yellow', disetujui:'badge-green', ditolak:'badge-red' }
  const jenisLabel:Record<string,string> = { sakit:'Sakit', izin:'Izin', dispensasi:'Dispensasi' }
  const pending = data.filter(d => d.status === 'pending')

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><UserCheck size={22} color="#166534"/> Proses Izin Siswa</h1>
        <p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>{pending.length} pengajuan menunggu persetujuan</p>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>No</th><th>Siswa</th><th>Kelas</th><th>Jenis</th><th>Tanggal</th><th>Keterangan</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat...</td></tr>
              : data.length === 0 ? <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Belum ada pengajuan izin</td></tr>
              : data.map((d,i) => (
              <tr key={d.id}>
                <td style={{ color:'#9ca3af' }}>{i+1}</td>
                <td style={{ fontWeight:600 }}>{d.siswa?.nama||'—'}</td>
                <td style={{ fontSize:'0.85rem' }}>{d.siswa?.kelas?.nama_kelas||'—'}</td>
                <td><span className="badge badge-blue">{jenisLabel[d.jenis]||d.jenis}</span></td>
                <td style={{ fontSize:'0.8rem', color:'#6b7280' }}>{new Date(d.tanggal_mulai).toLocaleDateString('id-ID')} s/d {new Date(d.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                <td style={{ fontSize:'0.8rem', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.keterangan}</td>
                <td><span className={`badge ${statusBadge[d.status]}`}>{d.status}</span></td>
                <td><div style={{ display:'flex', gap:5 }}>
                  <button onClick={()=>setViewItem(d)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #d1d5db', background:'white', cursor:'pointer', display:'flex', alignItems:'center' }}><Eye size={12}/></button>
                  {d.status==='pending' && <>
                    <button onClick={()=>handleProcess(d.id,'disetujui')} style={{ padding:'4px 8px', borderRadius:6, border:'none', background:'#dcfce7', cursor:'pointer', display:'flex', alignItems:'center', gap:3, fontSize:'0.75rem', color:'#166534', fontWeight:600 }}><CheckCircle size={12}/> OK</button>
                    <button onClick={()=>handleProcess(d.id,'ditolak')} style={{ padding:'4px 8px', borderRadius:6, border:'none', background:'#fee2e2', cursor:'pointer', display:'flex', alignItems:'center', gap:3, fontSize:'0.75rem', color:'#dc2626', fontWeight:600 }}><XCircle size={12}/> Tolak</button>
                  </>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewItem && (
        <div className="modal-overlay" onClick={()=>setViewItem(null)}>
          <div className="modal-box" style={{ maxWidth:440 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <h2 style={{ fontWeight:700, fontSize:'1.05rem' }}>Detail Izin</h2>
              <button onClick={()=>setViewItem(null)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#9ca3af"/></button>
            </div>
            <div style={{ padding:24 }}>
              {[['Nama Siswa',viewItem.siswa?.nama],['Kelas',viewItem.siswa?.kelas?.nama_kelas],['Jenis',jenisLabel[viewItem.jenis]],['Mulai',new Date(viewItem.tanggal_mulai).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})],['Selesai',new Date(viewItem.tanggal_selesai).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})],['Status',viewItem.status],['Keterangan',viewItem.keterangan]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', padding:'8px 0', borderBottom:'1px solid #f8fafc' }}>
                  <span style={{ width:120, fontSize:'0.8rem', color:'#6b7280', flexShrink:0 }}>{l}</span>
                  <span style={{ fontSize:'0.85rem', fontWeight:500 }}>{v||'—'}</span>
                </div>
              ))}
            </div>
            {viewItem.status==='pending' && (
              <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button onClick={()=>handleProcess(viewItem.id,'ditolak')} className="btn-danger"><XCircle size={15}/> Tolak</button>
                <button onClick={()=>handleProcess(viewItem.id,'disetujui')} className="btn-primary"><CheckCircle size={15}/> Setujui</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
