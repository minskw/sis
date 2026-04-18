'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { GraduationCap, Plus, Search, Upload, Download, Edit2, Trash2, X, Save, AlertCircle } from 'lucide-react'

const emptyForm = { nip:'', nama:'', jenis_kelamin:'L', jabatan:'', mapel:'', status_kepegawaian:'GTT', no_hp:'', email:'', tempat_lahir:'', tanggal_lahir:'' }

export default function AdminGuru() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchData() }, [])
  const fetchData = async () => {
    setLoading(true)
    const { data: guru } = await supabase.from('guru').select('*').order('nama')
    setData(guru||[]); setLoading(false)
  }
  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (g:any) => { setEditItem(g); setForm({ nip:g.nip||'', nama:g.nama, jenis_kelamin:g.jenis_kelamin, jabatan:g.jabatan||'', mapel:g.mapel||'', status_kepegawaian:g.status_kepegawaian, no_hp:g.no_hp||'', email:g.email||'', tempat_lahir:g.tempat_lahir||'', tanggal_lahir:g.tanggal_lahir||'' }); setShowModal(true) }
  const handleSave = async () => {
    if (!form.nama) { alert('Nama wajib diisi'); return }
    setSaving(true)
    const payload = { ...form, nip: form.nip||null, tanggal_lahir: form.tanggal_lahir||null }
    if (editItem) await supabase.from('guru').update(payload).eq('id', editItem.id)
    else await supabase.from('guru').insert([payload])
    setSaving(false); setShowModal(false); fetchData()
  }
  const handleDelete = async (id:string, nama:string) => {
    if (!confirm(`Hapus data guru "${nama}"?`)) return
    await supabase.from('guru').delete().eq('id', id); fetchData()
  }
  const handleImport = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setImportMsg('Memproses...')
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows:any[] = XLSX.utils.sheet_to_json(ws, { defval:'' })
      const mapped = rows.map((r:any) => ({
        nip: String(r['NIP']||r['nip']||'')||null,
        nama: String(r['Nama']||r['nama']||''),
        jenis_kelamin: String(r['JK']||'L').toUpperCase().startsWith('P')?'P':'L',
        jabatan: String(r['Jabatan']||r['jabatan']||'')||null,
        mapel: String(r['Mapel']||r['mapel']||'')||null,
        status_kepegawaian: String(r['Status']||r['status_kepegawaian']||'GTT'),
        no_hp: String(r['No HP']||r['no_hp']||'')||null,
        email: String(r['Email']||r['email']||'')||null,
      })).filter((r:any) => r.nama)
      if (!mapped.length) { setImportMsg('Tidak ada data valid.'); return }
      const { error } = await supabase.from('guru').insert(mapped)
      if (error) setImportMsg('Error: '+error.message)
      else { setImportMsg('✓ '+mapped.length+' guru diimpor!'); fetchData() }
    } catch(err:any) { setImportMsg('Error: '+err.message) }
    if (fileRef.current) fileRef.current.value = ''
    setTimeout(()=>setImportMsg(''),5000)
  }
  const downloadTemplate = async () => {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.aoa_to_sheet([['NIP','Nama','JK','Jabatan','Mapel','Status','No HP','Email'],['198501012010011001','Ahmad Fauzan, S.Pd','L','Wali Kelas','Matematika','PNS','08123456789','guru@min.sch.id']])
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Guru')
    XLSX.writeFile(wb, 'template_import_guru.xlsx')
  }
  const filtered = data.filter(g => (g.nama.toLowerCase().includes(search.toLowerCase()) || (g.nip||'').includes(search)) && (filterStatus ? g.status_kepegawaian === filterStatus : true))
  const statusColor:Record<string,string> = { PNS:'badge-blue', GTT:'badge-orange', PTT:'badge-gray', P3K:'badge-green' }

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div><h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><GraduationCap size={22} color="#166534"/> Data Guru & Staff</h1><p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>Total {data.length} tenaga pendidik</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={downloadTemplate} className="btn-secondary" style={{ fontSize:'0.8rem' }}><Download size={15}/> Template</button>
          <label className="btn-secondary" style={{ fontSize:'0.8rem', cursor:'pointer' }}><Upload size={15}/> Import Excel<input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display:'none' }}/></label>
          <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Tambah Guru</button>
        </div>
      </div>
      {importMsg && <div style={{ background:importMsg.startsWith('✓')?'#f0fdf4':'#fef2f2', border:`1px solid ${importMsg.startsWith('✓')?'#86efac':'#fecaca'}`, borderRadius:8, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8, fontSize:'0.875rem' }}><AlertCircle size={15} color={importMsg.startsWith('✓')?'#166534':'#dc2626'}/>{importMsg}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[{l:'Total',v:data.length,c:'#166534'},{l:'PNS',v:data.filter(g=>g.status_kepegawaian==='PNS').length,c:'#1d4ed8'},{l:'GTT/Honorer',v:data.filter(g=>g.status_kepegawaian==='GTT').length,c:'#b45309'},{l:'P3K/PTT',v:data.filter(g=>['P3K','PTT'].includes(g.status_kepegawaian)).length,c:'#7c3aed'}].map(s => (
          <div key={s.l} className="stat-card" style={{ borderTop:`3px solid ${s.c}` }}><div className="stat-value" style={{ color:s.c }}>{s.v}</div><div className="stat-label">{s.l}</div></div>
        ))}
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <div style={{ position:'relative', flex:1, maxWidth:320 }}><Search size={15} color="#9ca3af" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/><input className="form-input" style={{ paddingLeft:36 }} placeholder="Cari nama atau NIP..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <select className="form-select" style={{ width:180 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">Semua Status</option><option>PNS</option><option>GTT</option><option>PTT</option><option>P3K</option></select>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>No</th><th>NIP</th><th>Nama</th><th>Jabatan</th><th>Mata Pelajaran</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Belum ada data guru</td></tr>
              : filtered.map((g,i) => (
              <tr key={g.id}>
                <td style={{ color:'#9ca3af' }}>{i+1}</td>
                <td style={{ fontFamily:'monospace', fontSize:'0.78rem', color:'#6b7280' }}>{g.nip||'—'}</td>
                <td><div style={{ fontWeight:600 }}>{g.nama}</div><div style={{ fontSize:'0.75rem', color:'#9ca3af' }}>{g.no_hp||''}</div></td>
                <td style={{ fontSize:'0.85rem' }}>{g.jabatan||'—'}</td>
                <td style={{ fontSize:'0.85rem' }}>{g.mapel||'—'}</td>
                <td><span className={`badge ${statusColor[g.status_kepegawaian]||'badge-gray'}`}>{g.status_kepegawaian}</span></td>
                <td><div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>openEdit(g)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid #d1d5db', background:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:'0.75rem', color:'#374151' }}><Edit2 size={12}/> Edit</button>
                  <button onClick={()=>handleDelete(g.id,g.nama)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #fecaca', background:'#fef2f2', cursor:'pointer', display:'flex', alignItems:'center', fontSize:'0.75rem', color:'#dc2626' }}><Trash2 size={12}/></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth:560 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <h2 style={{ fontWeight:700, fontSize:'1.05rem' }}>{editItem?'Edit Data Guru':'Tambah Guru Baru'}</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#9ca3af"/></button>
            </div>
            <div style={{ padding:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[['NIP','nip'],['No. HP','no_hp'],['Email','email'],['Jabatan','jabatan'],['Mata Pelajaran','mapel']].map(([l,k]) => (
                <div key={k}><label className="form-label">{l}</label><input className="form-input" value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
              ))}
              <div style={{ gridColumn:'span 2' }}><label className="form-label">Nama Lengkap *</label><input className="form-input" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})}/></div>
              <div><label className="form-label">Jenis Kelamin</label><select className="form-select" value={form.jenis_kelamin} onChange={e=>setForm({...form,jenis_kelamin:e.target.value})}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
              <div><label className="form-label">Status Kepegawaian</label><select className="form-select" value={form.status_kepegawaian} onChange={e=>setForm({...form,status_kepegawaian:e.target.value})}><option>PNS</option><option>GTT</option><option>PTT</option><option>P3K</option></select></div>
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
