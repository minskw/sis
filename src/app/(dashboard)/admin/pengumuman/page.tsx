'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { Megaphone, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

const EMPTY = { judul:'', isi:'', kategori:'Umum', target_role:'all', is_published:true }

export default function AdminPengumumanPage() {
  const [data, setData] = useState<any[]>([])
  const [modal, setModal] = useState<'add'|'edit'|null>(null)
  const [selected, setSelected] = useState<any>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const { data: d } = await supabaseAdmin.from('pengumuman').select('*').order('created_at', { ascending: false })
    setData(d||[]); setLoading(false)
  }
  useEffect(() => { fetch() }, [])

  const save = async () => {
    setSaving(true)
    if (selected.id) {
      const { id, created_at, created_by, ...rest } = selected
      await supabaseAdmin.from('pengumuman').update(rest).eq('id', id)
    } else {
      const { id, created_at, created_by, ...rest } = selected
      await supabaseAdmin.from('pengumuman').insert([rest])
    }
    await fetch(); setModal(null); setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return
    await supabaseAdmin.from('pengumuman').delete().eq('id', id)
    await fetch()
  }

  const togglePublish = async (id: string, current: boolean) => {
    await supabaseAdmin.from('pengumuman').update({ is_published: !current }).eq('id', id)
    setData(prev => prev.map(p => p.id===id ? {...p, is_published:!current} : p))
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setSelected((p: any) => ({ ...p, [k]: e.target.value }))

  const targetLabel = (t: string) => t==='all'?'Semua':t==='guru'?'Guru':'Orang Tua'
  const katColor: Record<string,string> = { Akademik:'badge-blue', PPDB:'badge-green', Keagamaan:'badge-yellow', Umum:'badge-gray' }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Pengumuman</h1><p className="page-subtitle">Kelola pengumuman dan informasi sekolah</p></div>
        <button className="btn btn-primary" onClick={()=>{setSelected(EMPTY);setModal('add')}}>
          <Plus size={16}/>Buat Pengumuman
        </button>
      </div>

      <div className="space-y-3">
        {loading?<p className="text-center py-10 text-gray-400">Memuat...</p>
        :data.length===0?<EmptyState icon={Megaphone} title="Belum ada pengumuman"/>
        :data.map(p=>(
          <div key={p.id} className={`card card-pad flex gap-4 items-start ${!p.is_published?'opacity-60':''}`}>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800">{p.judul}</h3>
                <span className={`badge ${katColor[p.kategori]||'badge-gray'}`}>{p.kategori}</span>
                <span className="badge badge-gray">{targetLabel(p.target_role)}</span>
                {!p.is_published&&<span className="badge bg-gray-100 text-gray-500">Draft</span>}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{p.isi}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(p.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={()=>togglePublish(p.id, p.is_published)} className="btn btn-secondary btn-sm btn-icon" title={p.is_published?'Sembunyikan':'Publikasikan'}>
                {p.is_published?<EyeOff size={14}/>:<Eye size={14}/>}
              </button>
              <button onClick={()=>{setSelected(p);setModal('edit')}} className="btn btn-secondary btn-sm btn-icon"><Pencil size={14}/></button>
              <button onClick={()=>del(p.id)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal==='add'||modal==='edit'} onClose={()=>setModal(null)} title={modal==='add'?'Buat Pengumuman':'Edit Pengumuman'} size="lg">
        <div className="space-y-4">
          <div><label className="form-label">Judul *</label>
            <input className="form-input" value={selected.judul||''} onChange={f('judul')}/></div>
          <div><label className="form-label">Isi Pengumuman *</label>
            <textarea className="form-input" rows={5} value={selected.isi||''} onChange={f('isi')}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Kategori</label>
              <select className="form-input" value={selected.kategori||'Umum'} onChange={f('kategori')}>
                {['Umum','Akademik','PPDB','Keagamaan'].map(k=><option key={k}>{k}</option>)}</select></div>
            <div><label className="form-label">Target</label>
              <select className="form-input" value={selected.target_role||'all'} onChange={f('target_role')}>
                <option value="all">Semua</option><option value="guru">Guru</option><option value="ortu">Orang Tua</option></select></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!selected.is_published} onChange={e=>setSelected((p:any)=>({...p,is_published:e.target.checked}))} className="w-4 h-4 accent-emerald-600"/>
            <span className="text-sm font-medium text-gray-700">Publikasikan sekarang</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t">
          <button onClick={()=>setModal(null)} className="btn btn-secondary">Batal</button>
          <button onClick={save} disabled={saving} className="btn btn-primary">{saving?'Menyimpan...':'Simpan'}</button>
        </div>
      </Modal>
    </div>
  )
}
