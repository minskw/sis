'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { Grid3X3, Plus, Pencil, Trash2, Users } from 'lucide-react'

export default function AdminKelasPage() {
  const [data, setData] = useState<any[]>([])
  const [guru, setGuru] = useState<any[]>([])
  const [modal, setModal] = useState<'add'|'edit'|null>(null)
  const [selected, setSelected] = useState<any>({ nama:'', tingkat:1, tahun_ajaran:'2024/2025', kapasitas:32 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const [k, g] = await Promise.all([
      supabaseAdmin.from('kelas').select('*, wali_kelas:guru(nama)').order('tingkat').order('nama'),
      supabaseAdmin.from('guru').select('id, nama').order('nama')
    ])
    setData(k.data || []); setGuru(g.data || [])
    setLoading(false)
  }
  useEffect(() => { fetch() }, [])

  const save = async () => {
    setSaving(true)
    const { wali_kelas, id, created_at, ...rest } = selected
    if (selected.id) await supabaseAdmin.from('kelas').update(rest).eq('id', selected.id)
    else await supabaseAdmin.from('kelas').insert([rest])
    await fetch(); setModal(null); setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Hapus kelas ini?')) return
    await supabaseAdmin.from('kelas').delete().eq('id', id)
    await fetch()
  }

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setSelected((p: any) => ({ ...p, [key]: e.target.value }))

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Kelas & Rombel</h1><p className="page-subtitle">Manajemen rombongan belajar {data[0]?.tahun_ajaran||''}</p></div>
        <button className="btn btn-primary" onClick={()=>{setSelected({nama:'',tingkat:1,tahun_ajaran:'2024/2025',kapasitas:32});setModal('add')}}>
          <Plus size={16}/>Tambah Kelas
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading?<p className="text-gray-400 text-sm col-span-4 text-center py-10">Memuat...</p>
        :data.length===0?<div className="col-span-4"><EmptyState icon={Grid3X3} title="Belum ada data kelas"/></div>
        :data.map(k=>(
          <div key={k.id} className="card card-pad card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-extrabold text-lg">{k.tingkat}</div>
              <div className="flex gap-1">
                <button onClick={()=>{setSelected(k);setModal('edit')}} className="btn btn-secondary btn-icon btn-sm"><Pencil size={13}/></button>
                <button onClick={()=>del(k.id)} className="btn btn-danger btn-icon btn-sm"><Trash2 size={13}/></button>
              </div>
            </div>
            <p className="font-extrabold text-gray-800 text-lg">{k.nama}</p>
            <p className="text-xs text-gray-400 mt-0.5">Ruang: {k.ruang||'-'}</p>
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-gray-500">
              <Users size={12}/>
              <span>Wali: {k.wali_kelas?.nama||'-'}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal==='add'||modal==='edit'} onClose={()=>setModal(null)}
        title={modal==='add'?'Tambah Kelas Baru':'Edit Kelas'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="form-label">Nama Kelas *</label>
            <input className="form-input" placeholder="contoh: Kelas 5A" value={selected.nama||''} onChange={f('nama')}/></div>
          <div><label className="form-label">Tingkat *</label>
            <select className="form-input" value={selected.tingkat||1} onChange={f('tingkat')}>
              {[1,2,3,4,5,6].map(t=><option key={t} value={t}>Kelas {t}</option>)}
            </select></div>
          <div><label className="form-label">Tahun Ajaran</label>
            <input className="form-input" value={selected.tahun_ajaran||''} onChange={f('tahun_ajaran')}/></div>
          <div><label className="form-label">Ruang</label>
            <input className="form-input" placeholder="R-101" value={selected.ruang||''} onChange={f('ruang')}/></div>
          <div><label className="form-label">Kapasitas</label>
            <input className="form-input" type="number" value={selected.kapasitas||32} onChange={f('kapasitas')}/></div>
          <div className="col-span-2"><label className="form-label">Wali Kelas</label>
            <select className="form-input" value={selected.wali_kelas_id||''} onChange={f('wali_kelas_id')}>
              <option value="">-- Pilih Wali Kelas --</option>
              {guru.map(g=><option key={g.id} value={g.id}>{g.nama}</option>)}
            </select></div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t">
          <button onClick={()=>setModal(null)} className="btn btn-secondary">Batal</button>
          <button onClick={save} disabled={saving} className="btn btn-primary">{saving?'Menyimpan...':'Simpan'}</button>
        </div>
      </Modal>
    </div>
  )
}
