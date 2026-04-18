'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { MessageSquare, Plus, X, Save, Send } from 'lucide-react'

const emptyForm = { siswa_id:'', jenis:'sakit', tanggal_mulai:new Date().toISOString().split('T')[0], tanggal_selesai:new Date().toISOString().split('T')[0], keterangan:'' }

export default function OrtuIzin() {
  const { user } = useAuth()
  const [anak, setAnak] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('wali_siswa').select('siswa_id, siswa(id, nama)').eq('user_id', user.id).then(({ data: wali }) => {
      const list = (wali||[]).map((w:any) => w.siswa).filter(Boolean)
      setAnak(list)
      if (list.length) {
        setForm(f => ({ ...f, siswa_id: list[0].id }))
        const ids = list.map((a:any) => a.id)
        supabase.from('izin').select('*, siswa(nama)').in('siswa_id', ids).order('created_at', { ascending:false }).then(({ data: izin }) => {
          setData(izin||[]); setLoading(false)
        })
      } else setLoading(false)
    })
  }, [user])

  const fetchData = async () => {
    if (anak.length === 0) return
    const ids = anak.map((a:any) => a.id)
    const { data: izin } = await supabase.from('izin').select('*, siswa(nama)').in('siswa_id', ids).order('created_at', { ascending:false })
    setData(izin||[])
  }

  const handleSubmit = async () => {
    if (!form.siswa_id || !form.keterangan) { alert('Pilih anak dan isi keterangan'); return }
    if (form.tanggal_selesai < form.tanggal_mulai) { alert('Tanggal selesai tidak boleh sebelum tanggal mulai'); return }
    setSaving(true)
    await supabase.from('izin').insert([{ ...form, ortu_id: user?.id, status:'pending' }])
    setSaving(false); setShowModal(false); fetchData()
  }

  const statusBadge:Record<string,string> = { pending:'badge-yellow', disetujui:'badge-green', ditolak:'badge-red' }
  const jenisLabel:Record<string,string> = { sakit:'Sakit', izin:'Izin', dispensasi:'Dispensasi' }

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><MessageSquare size={22} color="#166534"/> Pengajuan Izin</h1>
          <p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>Ajukan izin sakit, izin, atau dispensasi untuk anak</p>
        </div>
        <button onClick={()=>setShowModal(true)} className="btn-primary" disabled={anak.length===0}><Plus size={16}/> Ajukan Izin Baru</button>
      </div>

      {anak.length === 0 && !loading && (
        <div className="card" style={{ padding:32, textAlign:'center', marginBottom:20 }}>
          <MessageSquare size={40} color="#d1d5db" style={{ margin:'0 auto 12px' }}/>
          <p style={{ color:'#9ca3af' }}>Akun Anda belum dihubungkan dengan data siswa.</p>
          <p style={{ color:'#9ca3af', fontSize:'0.8rem', marginTop:6 }}>Hubungi admin sekolah untuk menghubungkan akun Anda.</p>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
        {[{l:'Total Pengajuan',v:data.length,c:'#166534'},{l:'Menunggu',v:data.filter(d=>d.status==='pending').length,c:'#b45309'},{l:'Disetujui',v:data.filter(d=>d.status==='disetujui').length,c:'#15803d'}].map(s=>(
          <div key={s.l} className="stat-card" style={{ borderTop:`3px solid ${s.c}` }}><div className="stat-value" style={{ color:s.c }}>{s.v}</div><div className="stat-label">{s.l}</div></div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>No</th><th>Anak</th><th>Jenis</th><th>Tanggal</th><th>Keterangan</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat...</td></tr>
              : data.length === 0 ? <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Belum ada pengajuan izin</td></tr>
              : data.map((d,i) => (
              <tr key={d.id}>
                <td style={{ color:'#9ca3af' }}>{i+1}</td>
                <td style={{ fontWeight:600 }}>{d.siswa?.nama||'—'}</td>
                <td><span className="badge badge-blue">{jenisLabel[d.jenis]||d.jenis}</span></td>
                <td style={{ fontSize:'0.8rem', color:'#6b7280' }}>{new Date(d.tanggal_mulai).toLocaleDateString('id-ID')} s/d {new Date(d.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                <td style={{ fontSize:'0.85rem', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.keterangan}</td>
                <td><span className={`badge ${statusBadge[d.status]}`}>{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth:480 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <h2 style={{ fontWeight:700, fontSize:'1.05rem' }}>Ajukan Izin Siswa</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#9ca3af"/></button>
            </div>
            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
              {anak.length > 1 && <div><label className="form-label">Pilih Anak</label><select className="form-select" value={form.siswa_id} onChange={e=>setForm({...form,siswa_id:e.target.value})}>{anak.map(a=><option key={a.id} value={a.id}>{a.nama}</option>)}</select></div>}
              <div><label className="form-label">Jenis Izin</label><select className="form-select" value={form.jenis} onChange={e=>setForm({...form,jenis:e.target.value})}><option value="sakit">Sakit</option><option value="izin">Izin (keperluan keluarga)</option><option value="dispensasi">Dispensasi</option></select></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label className="form-label">Mulai Tanggal</label><input type="date" className="form-input" value={form.tanggal_mulai} onChange={e=>setForm({...form,tanggal_mulai:e.target.value})}/></div>
                <div><label className="form-label">Sampai Tanggal</label><input type="date" className="form-input" value={form.tanggal_selesai} min={form.tanggal_mulai} onChange={e=>setForm({...form,tanggal_selesai:e.target.value})}/></div>
              </div>
              <div><label className="form-label">Keterangan / Alasan *</label><textarea className="form-input" rows={4} placeholder="Jelaskan alasan izin dengan detail..." value={form.keterangan} onChange={e=>setForm({...form,keterangan:e.target.value})} style={{ resize:'vertical' }}/></div>
              <div style={{ background:'#fef9c3', border:'1px solid #fde047', borderRadius:8, padding:'10px 14px', fontSize:'0.8rem', color:'#713f12' }}>
                ⚠️ Pengajuan izin akan diproses oleh wali kelas atau admin sekolah. Harap ajukan minimal 1 hari sebelumnya (kecuali sakit).
              </div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button onClick={()=>setShowModal(false)} className="btn-secondary">Batal</button>
              <button onClick={handleSubmit} className="btn-primary" disabled={saving}><Send size={15}/>{saving?'Mengirim...':'Kirim Pengajuan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
