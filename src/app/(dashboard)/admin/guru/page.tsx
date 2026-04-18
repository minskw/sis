'use client'
import { useEffect, useState, useRef } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import Modal from '@/components/ui/Modal'
import SearchBar from '@/components/ui/SearchBar'
import EmptyState from '@/components/ui/EmptyState'
import { Users, Plus, Pencil, Trash2, FileUp, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Guru } from '@/types'

const EMPTY: Partial<Guru> = { nama:'', status_kepegawaian:'GTT', jenis_kelamin:'L' }
type Tab = 'daftar' | 'import'

// ── Import helpers ──────────────────────────────────
interface ImportResult { success: number; errors: string[] }

function ImportGuru() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File|null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [result, setResult] = useState<ImportResult|null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const parseExcel = async (f: File) => {
    const XLSX = await import('xlsx')
    const buf = await f.arrayBuffer()
    const wb = XLSX.read(buf)
    const ws = wb.Sheets[wb.SheetNames[0]]
    return XLSX.utils.sheet_to_json(ws, { defval: '' })
  }

  const handleFile = async (f: File) => {
    setFile(f); setResult(null)
    try { const rows = await parseExcel(f); setPreview((rows as any[]).slice(0,5)) }
    catch { setPreview([]) }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const downloadTemplate = () => {
    const headers = ['nama','nip','jenis_kelamin','jabatan','status_kepegawaian','email','phone','tempat_lahir','tanggal_lahir']
    const csv = [headers.join(','), headers.map(()=>'').join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'template_guru.csv'; a.click()
  }

  const doImport = async () => {
    if (!file) return
    setLoading(true); setResult(null)
    const rows: any[] = await parseExcel(file)
    const errors: string[] = []
    let success = 0
    const chunks: any[][] = []
    for (let i = 0; i < rows.length; i += 50) chunks.push(rows.slice(i, i + 50))
    for (const chunk of chunks) {
      const clean = chunk.map((r: any, idx: number) => {
        if (!r.nama) { errors.push(`Baris ${idx+1}: nama kosong`); return null }
        return { ...r, status_kepegawaian: r.status_kepegawaian||'GTT', jenis_kelamin: (r.jenis_kelamin||'L').toString().toUpperCase().charAt(0) }
      }).filter(Boolean)
      const { error } = await supabaseAdmin.from('guru').insert(clean)
      if (error) errors.push(error.message)
      else success += clean.length
    }
    setResult({ success, errors }); setLoading(false)
  }

  return (
    <div>
      {/* Instructions */}
      <div className="card card-pad mb-5" style={{background:'var(--primary-faint)',borderColor:'var(--primary-border)'}}>
        <h3 className="font-bold mb-2 text-sm" style={{color:'var(--primary-text)'}}>📋 Petunjuk Import Data Guru & Staff</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside" style={{color:'var(--primary)'}}>
          <li>Download template Excel di bawah</li>
          <li>Isi data sesuai format kolom yang tersedia</li>
          <li>Kolom <strong>nama</strong> wajib diisi</li>
          <li>Untuk jenis_kelamin: gunakan <strong>L</strong> atau <strong>P</strong></li>
          <li>status_kepegawaian: PNS / GTT / PTT</li>
          <li>Upload file dan klik Mulai Import</li>
        </ol>
        <button onClick={downloadTemplate} className="btn btn-secondary mt-3">
          <Download size={15}/>Download Template Guru
        </button>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition mb-5"
        style={dragging?{borderColor:'var(--primary-light)',background:'var(--primary-faint)'}:{}}
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        onDrop={handleDrop}
        onClick={()=>inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
          onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
        {file ? (
          <div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{background:'var(--primary-faint)'}}>
              <FileUp size={24} style={{color:'var(--primary)'}}/>
            </div>
            <p className="font-bold text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-400 mt-1">{(file.size/1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileUp size={24} className="text-gray-400"/>
            </div>
            <p className="font-semibold text-gray-600">Drag & drop file Excel/CSV di sini</p>
            <p className="text-sm text-gray-400 mt-1">atau klik untuk memilih file</p>
            <p className="text-xs text-gray-300 mt-2">Mendukung: .xlsx, .xls, .csv</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="card overflow-hidden mb-5">
          <div className="p-4 border-b bg-gray-50">
            <p className="font-semibold text-gray-700 text-sm">Preview Data (5 baris pertama)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table text-xs">
              <thead><tr>{Object.keys(preview[0]).map(k=><th key={k}>{k}</th>)}</tr></thead>
              <tbody>{preview.map((row,i)=>(
                <tr key={i}>{Object.values(row).map((v:any,j)=><td key={j}>{String(v)}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action */}
      {file && (
        <button onClick={doImport} disabled={loading} className="btn btn-primary px-8 py-2.5">
          {loading?<><Loader2 size={16} className="animate-spin"/>Mengimport...</>:<><FileUp size={16}/>Mulai Import</>}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 size={20} className="text-green-600 shrink-0"/>
            <p className="font-semibold text-green-800">{result.success} data guru berhasil diimport</p>
          </div>
          {result.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-red-600"/>
                <p className="font-semibold text-red-700 text-sm">{result.errors.length} error:</p>
              </div>
              {result.errors.slice(0,10).map((e,i)=><p key={i} className="text-xs text-red-600">• {e}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────
export default function AdminGuruPage() {
  const [activeTab, setActiveTab] = useState<Tab>('daftar')
  const [data, setData] = useState<Guru[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState<'add'|'edit'|null>(null)
  const [selected, setSelected] = useState<Partial<Guru>>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const { data: g } = await supabaseAdmin.from('guru').select('*').order('nama')
    setData(g || [])
    setLoading(false)
  }
  useEffect(() => { fetch() }, [])

  const filtered = data.filter(g => {
    const m = g.nama.toLowerCase().includes(search.toLowerCase()) || g.nip?.includes(search)
    const s = statusFilter ? g.status_kepegawaian === statusFilter : true
    return m && s
  })

  const save = async () => {
    setSaving(true)
    if (selected.id) {
      const { id, created_at, ...rest } = selected as any
      await supabaseAdmin.from('guru').update(rest).eq('id', id)
    } else {
      const { id, created_at, ...rest } = selected as any
      await supabaseAdmin.from('guru').insert([rest])
    }
    await fetch(); setModal(null); setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Hapus data guru ini?')) return
    await supabaseAdmin.from('guru').delete().eq('id', id)
    await fetch()
  }

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setSelected(p => ({ ...p, [key]: e.target.value }))

  const statusColor = (s: string) => s==='PNS'?'badge-blue':s==='GTT'?'badge-orange':'badge-gray'

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Data Guru & Staff</h1>
          <p className="page-subtitle">Kelola tenaga pendidik dan kependidikan</p>
        </div>
        {activeTab === 'daftar' && (
          <button className="btn btn-primary" onClick={() => { setSelected(EMPTY); setModal('add') }}>
            <Plus size={16}/>Tambah Guru
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab==='daftar'?'active':''}`} onClick={()=>setActiveTab('daftar')}>
          <Users size={15}/>Daftar Guru
        </button>
        <button className={`tab-btn ${activeTab==='import'?'active':''}`} onClick={()=>setActiveTab('import')}>
          <FileUp size={15}/>Import Excel
        </button>
      </div>

      {/* ── TAB: Daftar ── */}
      {activeTab === 'daftar' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[['Total',data.length,'var(--primary)'],['PNS',data.filter(g=>g.status_kepegawaian==='PNS').length,'#2563eb'],['GTT',data.filter(g=>g.status_kepegawaian==='GTT').length,'#ea580c'],['PTT',data.filter(g=>g.status_kepegawaian==='PTT').length,'#6b7280']].map(([l,v,c])=>(
              <div key={l as string} className="card card-pad text-center">
                <p className="text-2xl font-extrabold" style={{color:c as string}}>{v}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="w-64"><SearchBar value={search} onChange={setSearch} placeholder="Cari nama / NIP..."/></div>
            <select className="form-input w-auto" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="PNS">PNS</option><option value="GTT">GTT</option><option value="PTT">PTT</option>
            </select>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>No</th><th>Nama</th><th>NIP</th><th>Jabatan</th><th>Email</th><th>Status</th><th>Aksi</th>
                </tr></thead>
                <tbody>
                  {loading?(<tr><td colSpan={7} className="text-center py-10 text-gray-400">Memuat...</td></tr>)
                  :filtered.length===0?(<tr><td colSpan={7}><EmptyState icon={Users} title="Belum ada data guru"/></td></tr>)
                  :filtered.map((g,i)=>(
                    <tr key={g.id}>
                      <td className="text-gray-400 text-xs">{i+1}</td>
                      <td>
                        <p className="font-semibold text-gray-800">{g.nama}</p>
                        <p className="text-xs text-gray-400">{g.jabatan||'-'}</p>
                      </td>
                      <td className="text-gray-500 text-xs">{g.nip||'-'}</td>
                      <td className="text-gray-600">{g.jabatan||'-'}</td>
                      <td className="text-gray-500 text-xs">{g.email||'-'}</td>
                      <td><span className={`badge ${statusColor(g.status_kepegawaian)}`}>{g.status_kepegawaian}</span></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={()=>{setSelected(g);setModal('edit')}} className="btn btn-secondary btn-sm btn-icon"><Pencil size={14}/></button>
                          <button onClick={()=>del(g.id)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: Import ── */}
      {activeTab === 'import' && <ImportGuru/>}

      {/* Modal */}
      <Modal open={modal==='add'||modal==='edit'} onClose={()=>setModal(null)}
        title={modal==='add'?'Tambah Guru':'Edit Data Guru'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="form-label">Nama Lengkap *</label>
            <input className="form-input" value={selected.nama||''} onChange={f('nama')} required/></div>
          <div><label className="form-label">NIP</label>
            <input className="form-input" value={selected.nip||''} onChange={f('nip')}/></div>
          <div><label className="form-label">Jabatan</label>
            <input className="form-input" value={selected.jabatan||''} onChange={f('jabatan')}/></div>
          <div><label className="form-label">Jenis Kelamin</label>
            <select className="form-input" value={selected.jenis_kelamin||'L'} onChange={f('jenis_kelamin')}>
              <option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
          <div><label className="form-label">Status Kepegawaian</label>
            <select className="form-input" value={selected.status_kepegawaian||'GTT'} onChange={f('status_kepegawaian')}>
              <option value="PNS">PNS</option><option value="GTT">GTT/Honorer</option><option value="PTT">PTT</option></select></div>
          <div><label className="form-label">Email</label>
            <input className="form-input" type="email" value={selected.email||''} onChange={f('email')}/></div>
          <div><label className="form-label">No. HP</label>
            <input className="form-input" value={selected.phone||''} onChange={f('phone')}/></div>
          <div><label className="form-label">Tempat Lahir</label>
            <input className="form-input" value={(selected as any).tempat_lahir||''} onChange={f('tempat_lahir')}/></div>
          <div><label className="form-label">Tanggal Lahir</label>
            <input className="form-input" type="date" value={(selected as any).tanggal_lahir||''} onChange={f('tanggal_lahir')}/></div>
          <div className="md:col-span-2"><label className="form-label">Alamat</label>
            <textarea className="form-input" rows={2} value={(selected as any).alamat||''} onChange={f('alamat')}/></div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t">
          <button onClick={()=>setModal(null)} className="btn btn-secondary">Batal</button>
          <button onClick={save} disabled={saving} className="btn btn-primary">{saving?'Menyimpan...':'Simpan'}</button>
        </div>
      </Modal>
    </div>
  )
}
