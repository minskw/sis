'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Plus, Search, Edit2, X, Save } from 'lucide-react'

export default function AdminAkun() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ email:'', full_name:'', role:'ortu', password:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchData() }, [])
  const fetchData = async () => {
    setLoading(true)
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending:false })
    setData(profiles||[]); setLoading(false)
  }
  const handleCreate = async () => {
    if (!form.email || !form.password || !form.full_name) { alert('Email, nama, dan password wajib'); return }
    setSaving(true)
    // Using supabase auth admin via service role would be needed for production
    // For now create user + profile
    const { data: authData, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.full_name, role: form.role } } })
    if (authErr) { setSaving(false); setMsg('Error: '+authErr.message); return }
    if (authData.user) {
      await supabase.from('profiles').upsert([{ id: authData.user.id, email: form.email, full_name: form.full_name, role: form.role }])
    }
    setSaving(false); setShowModal(false); setMsg('✓ Akun berhasil dibuat!'); fetchData()
    setTimeout(()=>setMsg(''),5000)
  }
  const handleRoleChange = async (id:string, role:string) => {
    await supabase.from('profiles').update({ role }).eq('id', id); fetchData()
  }
  const roleColor:Record<string,string> = { admin:'badge-red', guru:'badge-blue', ortu:'badge-green' }
  const filtered = data.filter(d => d.email.toLowerCase().includes(search.toLowerCase()) || (d.full_name||'').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div><h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><Settings size={22} color="#166534"/> Manajemen Akun</h1><p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>Kelola akses dan role pengguna</p></div>
        <button onClick={()=>setShowModal(true)} className="btn-primary"><Plus size={16}/> Buat Akun</button>
      </div>
      {msg && <div style={{ background:msg.startsWith('✓')?'#f0fdf4':'#fef2f2', border:`1px solid ${msg.startsWith('✓')?'#86efac':'#fecaca'}`, borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:'0.875rem', color:msg.startsWith('✓')?'#166534':'#dc2626' }}>{msg}</div>}
      <div style={{ marginBottom:16 }}>
        <div style={{ position:'relative', maxWidth:320 }}><Search size={15} color="#9ca3af" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/><input className="form-input" style={{ paddingLeft:36 }} placeholder="Cari email atau nama..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>No</th><th>Nama</th><th>Email</th><th>Role</th><th>Tgl Daftar</th><th>Ubah Role</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat...</td></tr>
              : filtered.map((p,i) => (
              <tr key={p.id}>
                <td style={{ color:'#9ca3af' }}>{i+1}</td>
                <td style={{ fontWeight:600 }}>{p.full_name||'—'}</td>
                <td style={{ fontSize:'0.85rem', color:'#6b7280' }}>{p.email}</td>
                <td><span className={`badge ${roleColor[p.role]||'badge-gray'}`}>{p.role}</span></td>
                <td style={{ fontSize:'0.8rem', color:'#9ca3af' }}>{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                <td><select value={p.role} onChange={e=>handleRoleChange(p.id,e.target.value)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #d1d5db', fontSize:'0.8rem', background:'white', cursor:'pointer' }}><option value="admin">Admin</option><option value="guru">Guru</option><option value="ortu">Ortu</option></select></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth:440 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <h2 style={{ fontWeight:700, fontSize:'1.05rem' }}>Buat Akun Baru</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#9ca3af"/></button>
            </div>
            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
              <div><label className="form-label">Nama Lengkap *</label><input className="form-input" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></div>
              <div><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div><label className="form-label">Password *</label><input type="password" className="form-input" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
              <div><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="admin">Admin</option><option value="guru">Guru</option><option value="ortu">Orang Tua/Wali</option></select></div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button onClick={()=>setShowModal(false)} className="btn-secondary">Batal</button>
              <button onClick={handleCreate} className="btn-primary" disabled={saving}><Save size={15}/>{saving?'Membuat...':'Buat Akun'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
