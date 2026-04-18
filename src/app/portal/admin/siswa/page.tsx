'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Plus, Search, Upload, Download, Edit2, Trash2, X, Save, AlertCircle } from 'lucide-react'

interface Siswa { id:string; nisn:string; nama:string; jenis_kelamin:string; tempat_lahir?:string; tanggal_lahir?:string; alamat?:string; kelas_id?:string; status:string; kelas?:{nama_kelas:string} }
const emptyForm = { nisn:'', nama:'', jenis_kelamin:'L', tempat_lahir:'', tanggal_lahir:'', alamat:'', kelas_id:'', status:'aktif' }

export default function AdminSiswa() {
  const [data, setData] = useState<Siswa[]>([])
  const [kelas, setKelas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Siswa|null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchData() }, [])
  const fetchData = async () => {
    setLoading(true)
    const [{ data: siswa }, { data: k }] = await Promise.all([
      supabase.from('siswa').select('*, kelas(nama_kelas)').order('nama'),
      supabase.from('kelas').select('*').order('nama_kelas'),
    ])
    setData(siswa||[]); setKelas(k||[]); setLoading(false)
  }
  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (s:Siswa) => { setEditItem(s); setForm({ nisn:s.nisn, nama:s.nama, jenis_kelamin:s.jenis_kelamin, tempat_lahir:s.tempat_lahir||'', tanggal_lahir:s.tanggal_lahir||'', alamat:s.alamat||'', kelas_id:s.kelas_id||'', status:s.status }); setShowModal(true) }
  const handleSave = async () => {
    if (!form.nama || !form.nisn) { alert('Nama dan NISN wajib diisi'); return }
    setSaving(true)
    const payload = { ...form, kelas_id: form.kelas_id || null, tanggal_lahir: form.tanggal_lahir || null }
    if (editItem) await supabase.from('siswa').update(payload).eq('id', editItem.id)
    else await supabase.from('siswa').insert([payload])
    setSaving(false); setShowModal(false); fetchData()
  }
  const handleDelete = async (id:string, nama:string) => {
    if (!confirm(`Hapus data siswa "${nama}"?`)) return
    await supabase.from('siswa').delete().eq('id', id); fetchData()
  }
  const handleImport = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setImportMsg('Memproses file...')
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows:any[] = XLSX.utils.sheet_to_json(ws, { defval:'' })
      const mapped = rows.map((r:any) => ({
        nisn: String(r['NISN']||r['nisn']||''),
        nama: String(r['Nama']||r['nama']||r['NAMA']||''),
        jenis_kelamin: String(r['JK']||r['jenis_kelamin']||'L').toUpperCase().startsWith('P')?'P':'L',
        tempat_lahir: String(r['Tempat Lahir']||r['tempat_lahir']||'')||null,
        tanggal_lahir: String(r['Tanggal Lahir']||r['tanggal_lahir']||'')||null,
        alamat: String(r['Alamat']||r['alamat']||'')||null,
        status: 'aktif',
      })).filter((r:any) => r.nama)
      if (mapped.length === 0) { setImportMsg('Tidak ada data valid.'); return }
      const { error } = await supabase.from('siswa').insert(mapped)
      if (error) setImportMsg('Error: '+error.message)
      else { setImportMsg('✓ '+mapped.length+' siswa berhasil diimpor!'); fetchData() }
    } catch(err:any) { setImportMsg('Error: '+err.message) }
    if (fileRef.current) fileRef.current.value = ''
    setTimeout(() => setImportMsg(''), 5000)
  }
  const downloadTemplate = async () => {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.aoa_to_sheet([['NISN','Nama','JK','Tempat Lahir','Tanggal Lahir','Alamat'],['0012345678','Ahmad Fauzan','L','Singkawang','2015-06-15','Jl. Contoh No.1']])
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Siswa')
    XLSX.writeFile(wb, 'template_import_siswa.xlsx')
  }
  const filtered = data.filter(s => (s.nama.toLowerCase().includes(search.toLowerCase()) || s.nisn.includes(search)) && (filterKelas ? s.kelas_id === filterKelas : true))

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><Users size={22} color="#166534"/> Data Siswa</h1>
          <p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>Total {data.length} siswa terdaftar</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={downloadTemplate} className="btn-secondary" style={{ fontSize:'0.8rem' }}><Download size={15}/> Template</button>
          <label className="btn-secondary" style={{ fontSize:'0.8rem', cursor:'pointer' }}><Upload size={15}/> Import Excel<input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display:'none' }}/></label>
          <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Tambah Siswa</button>
        </div>
      </div>
      {importMsg && <div style={{ background:importMsg.startsWith('✓')?'#f0fdf4':'#fef2f2', border:`1px solid ${importMsg.startsWith('✓')?'#86efac':'#fecaca'}`, borderRadius:8, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8, fontSize:'0.875rem' }}><AlertCircle size={15} color={importMsg.startsWith('✓')?'#166534':'#dc2626'}/>{importMsg}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[{label:'Total',val:data.length,c:'#166534'},{label:'Laki-laki',val:data.filter(s=>s.jenis_kelamin==='L').length,c:'#1d4ed8'},{label:'Perempuan',val:data.filter(s=>s.jenis_kelamin==='P').length,c:'#be185d'},{label:'Aktif',val:data.filter(s=>s.status==='aktif').length,c:'#15803d'}].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop:`3px solid ${s.c}` }}><div className="stat-value" style={{ color:s.c }}>{s.val}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <div style={{ position:'relative', flex:1, maxWidth:320 }}>
          <Search size={15} color="#9ca3af" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/>
          <input className="form-input" style={{ paddingLeft:36 }} placeholder="Cari nama atau NISN..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="form-select" style={{ width:180 }} value={filterKelas} onChange={e=>setFilterKelas(e.target.value)}>
          <option value="">Semua Kelas</option>
          {kelas.map(k=><option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>No</th><th>NISN</th><th>Nama Siswa</th><th>L/P</th><th>Kelas</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat data...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Belum ada data siswa</td></tr>
              : filtered.map((s,i) => (
              <tr key={s.id}>
                <td style={{ color:'#9ca3af' }}>{i+1}</td>
                <td style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{s.nisn}</td>
                <td style={{ fontWeight:600 }}>{s.nama}</td>
                <td><span className={`badge ${s.jenis_kelamin==='L'?'badge-blue':'badge-orange'}`}>{s.jenis_kelamin==='L'?'Laki-laki':'Perempuan'}</span></td>
                <td>{s.kelas?.nama_kelas||<span style={{ color:'#9ca3af' }}>—</span>}</td>
                <td><span className={`badge ${s.status==='aktif'?'badge-green':'badge-gray'}`}>{s.status}</span></td>
                <td><div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>openEdit(s)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid #d1d5db', background:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:'0.75rem', color:'#374151' }}><Edit2 size={12}/> Edit</button>
                  <button onClick={()=>handleDelete(s.id,s.nama)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #fecaca', background:'#fef2f2', cursor:'pointer', display:'flex', alignItems:'center', fontSize:'0.75rem', color:'#dc2626' }}><Trash2 size={12}/></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth:540 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <h2 style={{ fontWeight:700, fontSize:'1.05rem' }}>{editItem?'Edit Data Siswa':'Tambah Siswa Baru'}</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#9ca3af"/></button>
            </div>
            <div style={{ padding:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ gridColumn:'span 1' }}><label className="form-label">NISN *</label><input className="form-input" value={form.nisn} onChange={e=>setForm({...form,nisn:e.target.value})}/></div>
              <div style={{ gridColumn:'span 1' }}>
                <label className="form-label">Jenis Kelamin</label>
                <select className="form-select" value={form.jenis_kelamin} onChange={e=>setForm({...form,jenis_kelamin:e.target.value})}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select>
              </div>
              <div style={{ gridColumn:'span 2' }}><label className="form-label">Nama Lengkap *</label><input className="form-input" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})}/></div>
              <div><label className="form-label">Tempat Lahir</label><input className="form-input" value={form.tempat_lahir} onChange={e=>setForm({...form,tempat_lahir:e.target.value})}/></div>
              <div><label className="form-label">Tanggal Lahir</label><input type="date" className="form-input" value={form.tanggal_lahir} onChange={e=>setForm({...form,tanggal_lahir:e.target.value})}/></div>
              <div style={{ gridColumn:'span 2' }}><label className="form-label">Alamat</label><input className="form-input" value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})}/></div>
              <div><label className="form-label">Kelas</label><select className="form-select" value={form.kelas_id} onChange={e=>setForm({...form,kelas_id:e.target.value})}><option value="">— Pilih —</option>{kelas.map(k=><option key={k.id} value={k.id}>{k.nama_kelas}</option>)}</select></div>
              <div><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="aktif">Aktif</option><option value="nonaktif">Non-aktif</option><option value="lulus">Lulus</option><option value="pindah">Pindah</option></select></div>
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
