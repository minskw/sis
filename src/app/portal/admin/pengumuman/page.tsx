'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Bell, Plus, Edit2, Trash2, X, Save } from 'lucide-react'

const emptyForm = { judul:'', isi:'', kategori:'Umum', target_role:'semua', tanggal:new Date().toISOString().split('T')[0] }

export default function AdminPengumuman() {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])
  const fetchData = async () => {
    setLoading(true)
    const { data: p } = await supabase.from('pengumuman').select('*').order('tanggal', { ascending: false })
    setData(p||[]); setLoading(false)
  }
  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (p:any) => { setEditItem(p); setForm({ judul:p.judul, isi:p.isi, kategori:p.kategori, target_role:p.target_role, tanggal:p.tanggal }); setShowModal(true) }
  const handleSave = async () => {
    if (!form.judul || !form.isi) { alert('Judul dan isi wajib diisi'); return }
    setSaving(true)
    if (editItem) await supabase.from('pengumuman').update(form).eq('id', editItem.id)
    else await supabase.from('pengumuman').insert([{ ...form, dibuat_oleh: user?.id }])
    setSaving(false); setShowModal(false); fetchData()
  }
  const handleDelete = async (id:string) => {
    if (!confirm('Hapus pengumuman ini?')) return
    await supabase.from('pengumuman').delete().eq('id', id); fetchData()
  }
  const targetLabel:Record<string,string> = { semua:'Semua', guru:'Guru', ortu:'Orang Tua' }

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div><h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><Bell size={22} color="#166534"/> Pengumuman</h1></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Buat Pengumuman</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {loading ? <div style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat...</div>
          : data.length === 0 ? <div style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Belum ada pengumuman</div>
          : data.map(p => (
          <div key={p.id} className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                  <span className="badge badge-green">{p.kategori}</span>
                  <span className="badge badge-blue">{targetLabel[p.target_role]||p.target_role}</span>
                  <span style={{ fontSize:'0.75rem', color:'#9ca3af', marginLeft:'auto' }}>{new Date(p.tanggal).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</span>
                </div>
                <h3 style={{ fontWeight:700, color:'#111827', marginBottom:6 }}>{p.judul}</h3>
                <p style={{ fontSize:'0.875rem', color:'#6b7280', lineHeight:1.6 }}>{p.isi}</p>
              </div>
              <div style={{ display:'flex', gap:6, marginLeft:16, flexShrink:0 }}>
                <button onClick={()=>openEdit(p)} style={{ padding:'6px', borderRadius:6, border:'1px solid #d1d5db', background:'white', cursor:'pointer', display:'flex', alignItems:'center' }}><Edit2 size={14} color="#374151"/></button>
                <button onClick={()=>handleDelete(p.id)} style={{ padding:'6px', borderRadius:6, border:'1px solid #fecaca', background:'#fef2f2', cursor:'pointer', display:'flex', alignItems:'center' }}><Trash2 size={14} color="#dc2626"/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth:560 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <h2 style={{ fontWeight:700, fontSize:'1.05rem' }}>{editItem?'Edit Pengumuman':'Buat Pengumuman Baru'}</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#9ca3af"/></button>
            </div>
            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
              <div><label className="form-label">Judul *</label><input className="form-input" value={form.judul} onChange={e=>setForm({...form,judul:e.target.value})}/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div><label className="form-label">Kategori</label><select className="form-select" value={form.kategori} onChange={e=>setForm({...form,kategori:e.target.value})}><option>Umum</option><option>Akademik</option><option>PPDB</option><option>Kegiatan</option><option>Kepegawaian</option></select></div>
                <div><label className="form-label">Target</label><select className="form-select" value={form.target_role} onChange={e=>setForm({...form,target_role:e.target.value})}><option value="semua">Semua</option><option value="guru">Guru</option><option value="ortu">Orang Tua</option></select></div>
                <div><label className="form-label">Tanggal</label><input type="date" className="form-input" value={form.tanggal} onChange={e=>setForm({...form,tanggal:e.target.value})}/></div>
              </div>
              <div><label className="form-label">Isi Pengumuman *</label><textarea className="form-input" rows={5} value={form.isi} onChange={e=>setForm({...form,isi:e.target.value})} style={{ resize:'vertical' }}/></div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button onClick={()=>setShowModal(false)} className="btn-secondary">Batal</button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}><Save size={15}/>{saving?'Menyimpan...':'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
