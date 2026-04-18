'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import Modal from '@/components/ui/Modal'
import SearchBar from '@/components/ui/SearchBar'
import EmptyState from '@/components/ui/EmptyState'
import { GraduationCap, Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Siswa } from '@/types'

const EMPTY: Partial<Siswa> = { nama:'', jenis_kelamin:'L', status:'aktif' }

export default function AdminSiswaPage() {
  const [data, setData] = useState<Siswa[]>([])
  const [kelas, setKelas] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [kelasFilter, setKelasFilter] = useState('')
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [selected, setSelected] = useState<Partial<Siswa>>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const { data: s } = await supabaseAdmin.from('siswa').select('*, kelas(nama)').order('nama')
    const { data: k } = await supabaseAdmin.from('kelas').select('*').order('tingkat').order('nama')
    setData(s || []); setKelas(k || [])
    setLoading(false)
  }
  useEffect(() => { fetch() }, [])

  const filtered = data.filter(s => {
    const m = s.nama.toLowerCase().includes(search.toLowerCase()) || s.nisn?.includes(search)
    const k = kelasFilter ? s.kelas_id === kelasFilter : true
    return m && k
  })

  const save = async () => {
    setSaving(true)
    if (selected.id) {
      const { id, kelas, created_at, ...rest } = selected as any
      await supabaseAdmin.from('siswa').update(rest).eq('id', id)
    } else {
      const { kelas, id, created_at, ...rest } = selected as any
      await supabaseAdmin.from('siswa').insert([rest])
    }
    await fetch(); setModal(null); setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Hapus data siswa ini?')) return
    await supabaseAdmin.from('siswa').delete().eq('id', id)
    await fetch()
  }

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setSelected(p => ({ ...p, [key]: e.target.value }))

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Data Siswa</h1><p className="page-subtitle">Kelola seluruh data siswa aktif</p></div>
        <button className="btn btn-primary" onClick={() => { setSelected(EMPTY); setModal('add') }}>
          <Plus size={16}/>Tambah Siswa
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[['Total Siswa',data.length,'text-emerald-700'],['Laki-laki',data.filter(s=>s.jenis_kelamin==='L').length,'text-blue-600'],['Perempuan',data.filter(s=>s.jenis_kelamin==='P').length,'text-pink-500']].map(([l,v,c])=>(
          <div key={l as string} className="card card-pad text-center">
            <p className={`text-2xl font-extrabold ${c}`}>{v}</p>
            <p className="text-xs text-gray-500 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="w-64"><SearchBar value={search} onChange={setSearch} placeholder="Cari nama / NISN..."/></div>
        <select className="form-input w-auto" value={kelasFilter} onChange={e=>setKelasFilter(e.target.value)}>
          <option value="">Semua Kelas</option>
          {kelas.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>No</th><th>Nama Siswa</th><th>NISN</th><th>Kelas</th><th>L/P</th>
              <th>Tgl Lahir</th><th>Status</th><th>Aksi</th>
            </tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={8} className="text-center py-10 text-gray-400">Memuat...</td></tr>)
              :filtered.length===0?(<tr><td colSpan={8}><EmptyState icon={GraduationCap} title="Belum ada data siswa"/></td></tr>)
              :filtered.map((s,i)=>(
                <tr key={s.id}>
                  <td className="text-gray-400 text-xs">{i+1}</td>
                  <td><p className="font-semibold text-gray-800">{s.nama}</p></td>
                  <td className="text-gray-500">{s.nisn||'-'}</td>
                  <td><span className="badge badge-green">{(s as any).kelas?.nama||'-'}</span></td>
                  <td><span className={`badge ${s.jenis_kelamin==='L'?'badge-blue':'bg-pink-100 text-pink-700'}`}>{s.jenis_kelamin}</span></td>
                  <td className="text-gray-500">{s.tanggal_lahir||'-'}</td>
                  <td><span className={`badge ${s.status==='aktif'?'badge-green':'badge-gray'}`}>{s.status}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={()=>{setSelected(s);setModal('view')}} className="btn btn-secondary btn-sm btn-icon"><Eye size={14}/></button>
                      <button onClick={()=>{setSelected(s);setModal('edit')}} className="btn btn-secondary btn-sm btn-icon"><Pencil size={14}/></button>
                      <button onClick={()=>del(s.id)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      <Modal open={modal==='add'||modal==='edit'} onClose={()=>setModal(null)}
        title={modal==='add'?'Tambah Siswa Baru':'Edit Data Siswa'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="form-label">Nama Lengkap *</label>
            <input className="form-input" value={selected.nama||''} onChange={f('nama')} required/></div>
          <div><label className="form-label">NISN</label>
            <input className="form-input" value={selected.nisn||''} onChange={f('nisn')}/></div>
          <div><label className="form-label">NIK *</label>
            <input className="form-input" value={selected.nik||''} onChange={f('nik')}/></div>
          <div><label className="form-label">Tempat Lahir</label>
            <input className="form-input" value={selected.tempat_lahir||''} onChange={f('tempat_lahir')}/></div>
          <div><label className="form-label">Tanggal Lahir</label>
            <input className="form-input" type="date" value={selected.tanggal_lahir||''} onChange={f('tanggal_lahir')}/></div>
          <div><label className="form-label">Jenis Kelamin</label>
            <select className="form-input" value={selected.jenis_kelamin||'L'} onChange={f('jenis_kelamin')}>
              <option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
          <div><label className="form-label">Kelas</label>
            <select className="form-input" value={selected.kelas_id||''} onChange={f('kelas_id')}>
              <option value="">-- Pilih Kelas --</option>
              {kelas.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
          <div><label className="form-label">Tahun Masuk</label>
            <input className="form-input" type="number" value={selected.tahun_masuk||''} onChange={f('tahun_masuk')}/></div>
          <div><label className="form-label">Status</label>
            <select className="form-input" value={selected.status||'aktif'} onChange={f('status')}>
              <option value="aktif">Aktif</option><option value="lulus">Lulus</option><option value="keluar">Keluar</option></select></div>
          <div className="md:col-span-2"><label className="form-label">Alamat</label>
            <textarea className="form-input" rows={2} value={selected.alamat||''} onChange={f('alamat')}/></div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t">
          <button onClick={()=>setModal(null)} className="btn btn-secondary">Batal</button>
          <button onClick={save} disabled={saving} className="btn btn-primary">
            {saving?'Menyimpan...':'Simpan'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
