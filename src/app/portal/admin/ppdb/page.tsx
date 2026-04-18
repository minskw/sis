'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, CheckCircle, XCircle, Search, Eye, X } from 'lucide-react'

export default function AdminPPDB() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [viewItem, setViewItem] = useState<any>(null)

  useEffect(() => { fetchData() }, [])
  const fetchData = async () => {
    setLoading(true)
    const { data: ppdb } = await supabase.from('ppdb_pendaftaran').select('*').order('created_at', { ascending: false })
    setData(ppdb||[]); setLoading(false)
  }
  const handleAccept = async (item:any) => {
    if (!confirm(`Terima pendaftaran ${item.nama_siswa}?`)) return
    await supabase.from('ppdb_pendaftaran').update({ status:'diterima' }).eq('id', item.id)
    // Insert as siswa
    await supabase.from('siswa').insert([{ nisn: item.nisn||'', nama: item.nama_siswa, jenis_kelamin: item.jenis_kelamin, tempat_lahir: item.tempat_lahir, tanggal_lahir: item.tanggal_lahir, alamat: item.alamat, status: 'aktif' }])
    fetchData()
  }
  const handleReject = async (item:any, catatan:string) => {
    await supabase.from('ppdb_pendaftaran').update({ status:'ditolak', catatan }).eq('id', item.id)
    fetchData()
  }
  const statusBadge:Record<string,string> = { pending:'badge-yellow', diterima:'badge-green', ditolak:'badge-red' }
  const filtered = data.filter(d => (d.nama_siswa.toLowerCase().includes(search.toLowerCase()) || (d.no_hp||'').includes(search)) && (filterStatus ? d.status === filterStatus : true))

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><FileText size={22} color="#166534"/> Manajemen PPDB</h1>
        <p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>Data pendaftaran peserta didik baru</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[{l:'Total Pendaftar',v:data.length,c:'#166534'},{l:'Menunggu',v:data.filter(d=>d.status==='pending').length,c:'#b45309'},{l:'Diterima',v:data.filter(d=>d.status==='diterima').length,c:'#15803d'},{l:'Ditolak',v:data.filter(d=>d.status==='ditolak').length,c:'#dc2626'}].map(s=>(
          <div key={s.l} className="stat-card" style={{ borderTop:`3px solid ${s.c}` }}><div className="stat-value" style={{ color:s.c }}>{s.v}</div><div className="stat-label">{s.l}</div></div>
        ))}
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <div style={{ position:'relative', flex:1, maxWidth:320 }}><Search size={15} color="#9ca3af" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/><input className="form-input" style={{ paddingLeft:36 }} placeholder="Cari nama atau no. HP..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <select className="form-select" style={{ width:180 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">Semua Status</option><option value="pending">Pending</option><option value="diterima">Diterima</option><option value="ditolak">Ditolak</option></select>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>No</th><th>Nama Siswa</th><th>Orang Tua/Wali</th><th>No. HP</th><th>Tgl. Daftar</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Belum ada pendaftar</td></tr>
              : filtered.map((d,i) => (
              <tr key={d.id}>
                <td style={{ color:'#9ca3af' }}>{i+1}</td>
                <td><div style={{ fontWeight:600 }}>{d.nama_siswa}</div><div style={{ fontSize:'0.75rem', color:'#9ca3af' }}>{d.jenis_kelamin==='L'?'Laki-laki':'Perempuan'}</div></td>
                <td style={{ fontSize:'0.85rem' }}>{d.nama_wali||d.nama_ayah||d.nama_ibu||'—'}</td>
                <td style={{ fontSize:'0.85rem' }}>{d.no_hp}</td>
                <td style={{ fontSize:'0.8rem', color:'#6b7280' }}>{new Date(d.created_at).toLocaleDateString('id-ID')}</td>
                <td><span className={`badge ${statusBadge[d.status]}`}>{d.status}</span></td>
                <td><div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>setViewItem(d)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #d1d5db', background:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:'0.75rem' }}><Eye size={12}/> Detail</button>
                  {d.status === 'pending' && <>
                    <button onClick={()=>handleAccept(d)} style={{ padding:'4px 8px', borderRadius:6, border:'none', background:'#dcfce7', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:'0.75rem', color:'#166534', fontWeight:600 }}><CheckCircle size={12}/> Terima</button>
                    <button onClick={()=>{ const c=prompt('Alasan penolakan:'); if(c!==null) handleReject(d,c) }} style={{ padding:'4px 8px', borderRadius:6, border:'none', background:'#fee2e2', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:'0.75rem', color:'#dc2626', fontWeight:600 }}><XCircle size={12}/> Tolak</button>
                  </>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewItem && (
        <div className="modal-overlay" onClick={()=>setViewItem(null)}>
          <div className="modal-box" style={{ maxWidth:520 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <h2 style={{ fontWeight:700, fontSize:'1.05rem' }}>Detail Pendaftaran</h2>
              <button onClick={()=>setViewItem(null)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#9ca3af"/></button>
            </div>
            <div style={{ padding:24 }}>
              {[['Nama Siswa',viewItem.nama_siswa],['Jenis Kelamin',viewItem.jenis_kelamin==='L'?'Laki-laki':'Perempuan'],['NISN',viewItem.nisn||'—'],['Tempat Lahir',viewItem.tempat_lahir||'—'],['Tanggal Lahir',viewItem.tanggal_lahir||'—'],['Alamat',viewItem.alamat||'—'],['Nama Ayah',viewItem.nama_ayah||'—'],['Nama Ibu',viewItem.nama_ibu||'—'],['Wali',viewItem.nama_wali||'—'],['No. HP',viewItem.no_hp],['Email',viewItem.email||'—'],['Catatan',viewItem.catatan||'—']].map(([l,v])=>(
                <div key={l} style={{ display:'flex', padding:'7px 0', borderBottom:'1px solid #f8fafc' }}>
                  <span style={{ width:140, fontSize:'0.8rem', color:'#6b7280', flexShrink:0 }}>{l}</span>
                  <span style={{ fontSize:'0.85rem', fontWeight:500, color:'#111827' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
