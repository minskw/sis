'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { School, Plus, Edit2, Trash2, X, Save } from 'lucide-react'

const emptyForm = { nama_kelas:'', tingkat:1, wali_kelas_id:'', tahun_ajaran:'2024/2025' }

export default function AdminKelas() {
  const [data, setData] = useState<any[]>([])
  const [guru, setGuru] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])
  const fetchData = async () => {
    setLoading(true)
    const [{ data: kelas }, { data: guruData }] = await Promise.all([
      supabase.from('kelas').select('*, guru:wali_kelas_id(nama)').order('tingkat').order('nama_kelas'),
      supabase.from('guru').select('id, nama').order('nama'),
    ])
    setData(kelas||[]); setGuru(guruData||[]); setLoading(false)
  }
  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (k:any) => { setEditItem(k); setForm({ nama_kelas:k.nama_kelas, tingkat:k.tingkat, wali_kelas_id:k.wali_kelas_id||'', tahun_ajaran:k.tahun_ajaran }); setShowModal(true) }
  const handleSave = async () => {
    if (!form.nama_kelas) { alert('Nama kelas wajib diisi'); return }
    setSaving(true)
    const payload = { ...form, wali_kelas_id: form.wali_kelas_id || null }
    if (editItem) await supabase.from('kelas').update(payload).eq('id', editItem.id)
    else await supabase.from('kelas').insert([payload])
    setSaving(false); setShowModal(false); fetchData()
  }
  const handleDelete = async (id:string, nama:string) => {
    if (!confirm(`Hapus kelas "${nama}"?`)) return
    await supabase.from('kelas').delete().eq('id', id); fetchData()
  }

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div><h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><School size={22} color="#166534"/> Manajemen Kelas</h1><p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>Pengaturan rombel dan wali kelas</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Tambah Kelas</button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>No</th><th>Nama Kelas</th><th>Tingkat</th><th>Wali Kelas</th><th>Tahun Ajaran</th><th>Aksi</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat...</td></tr>
              : data.length === 0 ? <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Belum ada kelas</td></tr>
              : data.map((k,i) => (
              <tr key={k.id}>
                <td style={{ color:'#9ca3af' }}>{i+1}</td>
                <td style={{ fontWeight:700, fontSize:'1rem' }}>{k.nama_kelas}</td>
                <td><span className="badge badge-blue">Kelas {k.tingkat}</span></td>
                <td>{k.guru?.nama||<span style={{ color:'#9ca3af' }}>Belum ditentukan</span>}</td>
                <td style={{ fontSize:'0.85rem', color:'#6b7280' }}>{k.tahun_ajaran}</td>
                <td><div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>openEdit(k)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid #d1d5db', background:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:'0.75rem', color:'#374151' }}><Edit2 size={12}/> Edit</button>
                  <button onClick={()=>handleDelete(k.id,k.nama_kelas)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #fecaca', background:'#fef2f2', cursor:'pointer', display:'flex', alignItems:'center', fontSize:'0.75rem', color:'#dc2626' }}><Trash2 size={12}/></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth:440 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <h2 style={{ fontWeight:700, fontSize:'1.05rem' }}>{editItem?'Edit Kelas':'Tambah Kelas Baru'}</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#9ca3af"/></button>
            </div>
            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
              <div><label className="form-label">Nama Kelas *</label><input className="form-input" placeholder="contoh: Kelas 5A" value={form.nama_kelas} onChange={e=>setForm({...form,nama_kelas:e.target.value})}/></div>
              <div><label className="form-label">Tingkat</label><select className="form-select" value={form.tingkat} onChange={e=>setForm({...form,tingkat:Number(e.target.value)})}>{[1,2,3,4,5,6].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="form-label">Wali Kelas</label><select className="form-select" value={form.wali_kelas_id} onChange={e=>setForm({...form,wali_kelas_id:e.target.value})}><option value="">— Pilih Guru —</option>{guru.map(g=><option key={g.id} value={g.id}>{g.nama}</option>)}</select></div>
              <div><label className="form-label">Tahun Ajaran</label><input className="form-input" placeholder="2024/2025" value={form.tahun_ajaran} onChange={e=>setForm({...form,tahun_ajaran:e.target.value})}/></div>
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
