'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import Modal from '@/components/ui/Modal'
import SearchBar from '@/components/ui/SearchBar'
import EmptyState from '@/components/ui/EmptyState'
import { Users, Plus, Pencil, Trash2 } from 'lucide-react'
import { Guru } from '@/types'

const EMPTY: Partial<Guru> = { nama:'', status_kepegawaian:'GTT', jenis_kelamin:'L' }

export default function AdminGuruPage() {
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
        <div><h1 className="page-title">Data Guru & Staff</h1><p className="page-subtitle">Kelola tenaga pendidik dan kependidikan</p></div>
        <button className="btn btn-primary" onClick={() => { setSelected(EMPTY); setModal('add') }}>
          <Plus size={16}/>Tambah Guru
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[['Total',data.length,'text-gray-800'],['PNS',data.filter(g=>g.status_kepegawaian==='PNS').length,'text-blue-600'],['GTT',data.filter(g=>g.status_kepegawaian==='GTT').length,'text-orange-500'],['PTT',data.filter(g=>g.status_kepegawaian==='PTT').length,'text-gray-500']].map(([l,v,c])=>(
          <div key={l as string} className="card card-pad text-center">
            <p className={`text-2xl font-extrabold ${c}`}>{v}</p>
            <p className="text-xs text-gray-500 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

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
                  <td><p className="font-semibold text-gray-800">{g.nama}</p><p className="text-xs text-gray-400">{g.jabatan||'-'}</p></td>
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
