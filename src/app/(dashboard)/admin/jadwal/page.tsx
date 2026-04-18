'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { Calendar, Plus, Trash2 } from 'lucide-react'

const HARI = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']

export default function AdminJadwalPage() {
  const [jadwal, setJadwal] = useState<any[]>([])
  const [kelas, setKelas] = useState<any[]>([])
  const [guru, setGuru] = useState<any[]>([])
  const [mapel, setMapel] = useState<any[]>([])
  const [kelasF, setKelasF] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>({ hari:'Senin', jam_mulai:'07:00', jam_selesai:'07:45' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      const [k,g,m] = await Promise.all([
        supabaseAdmin.from('kelas').select('*').order('tingkat').order('nama'),
        supabaseAdmin.from('guru').select('id,nama').order('nama'),
        supabaseAdmin.from('mata_pelajaran').select('*').order('nama'),
      ])
      setKelas(k.data||[]); setGuru(g.data||[]); setMapel(m.data||[])
      if(k.data?.[0]) setKelasF(k.data[0].id)
    }
    init()
  }, [])

  useEffect(() => {
    if (!kelasF) return
    const fetch = async () => {
      const { data } = await supabaseAdmin.from('jadwal_pelajaran')
        .select('*, mapel:mata_pelajaran(nama), guru(nama)').eq('kelas_id', kelasF)
        .order('hari').order('jam_mulai')
      setJadwal(data||[])
    }
    fetch()
  }, [kelasF])

  const save = async () => {
    setSaving(true)
    await supabaseAdmin.from('jadwal_pelajaran').insert([{ ...form, kelas_id: kelasF }])
    const { data } = await supabaseAdmin.from('jadwal_pelajaran')
      .select('*, mapel:mata_pelajaran(nama), guru(nama)').eq('kelas_id', kelasF).order('hari').order('jam_mulai')
    setJadwal(data||[]); setModal(false); setSaving(false)
  }

  const del = async (id: string) => {
    await supabaseAdmin.from('jadwal_pelajaran').delete().eq('id', id)
    setJadwal(prev => prev.filter(j=>j.id!==id))
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLSelectElement|HTMLInputElement>) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Jadwal Pelajaran</h1><p className="page-subtitle">Atur jadwal per kelas</p></div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}><Plus size={16}/>Tambah Jadwal</button>
      </div>

      <select className="form-input w-auto mb-5" value={kelasF} onChange={e=>setKelasF(e.target.value)}>
        {kelas.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}
      </select>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {HARI.map(hari => {
          const items = jadwal.filter(j=>j.hari===hari)
          return (
            <div key={hari} className="card overflow-hidden">
              <div className="bg-emerald-700 text-white px-4 py-2.5 font-bold text-sm">{hari}</div>
              {items.length===0?<p className="text-xs text-gray-400 p-4 text-center">Belum ada jadwal</p>
              :items.map(j=>(
                <div key={j.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-gray-50">
                  <div className="text-xs text-gray-400 w-20 shrink-0">{j.jam_mulai}–{j.jam_selesai}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">{j.mapel?.nama}</p>
                    <p className="text-xs text-gray-400">{j.guru?.nama||'-'}</p>
                  </div>
                  <button onClick={()=>del(j.id)} className="btn btn-danger btn-icon btn-sm"><Trash2 size={13}/></button>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Tambah Jadwal Pelajaran">
        <div className="space-y-4">
          <div><label className="form-label">Hari</label>
            <select className="form-input" value={form.hari} onChange={f('hari')}>
              {HARI.map(h=><option key={h}>{h}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Jam Mulai</label><input type="time" className="form-input" value={form.jam_mulai} onChange={f('jam_mulai')}/></div>
            <div><label className="form-label">Jam Selesai</label><input type="time" className="form-input" value={form.jam_selesai} onChange={f('jam_selesai')}/></div>
          </div>
          <div><label className="form-label">Mata Pelajaran</label>
            <select className="form-input" value={form.mapel_id||''} onChange={f('mapel_id')}>
              <option value="">-- Pilih --</option>{mapel.map(m=><option key={m.id} value={m.id}>{m.nama}</option>)}</select></div>
          <div><label className="form-label">Guru</label>
            <select className="form-input" value={form.guru_id||''} onChange={f('guru_id')}>
              <option value="">-- Pilih --</option>{guru.map(g=><option key={g.id} value={g.id}>{g.nama}</option>)}</select></div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t">
          <button onClick={()=>setModal(false)} className="btn btn-secondary">Batal</button>
          <button onClick={save} disabled={saving} className="btn btn-primary">{saving?'Menyimpan...':'Simpan'}</button>
        </div>
      </Modal>
    </div>
  )
}
