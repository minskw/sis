'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { MessageSquare, Plus, AlertCircle } from 'lucide-react'

const EMPTY = { jenis:'izin', keterangan:'', tanggal_mulai: new Date().toISOString().split('T')[0], tanggal_selesai: new Date().toISOString().split('T')[0] }

export default function OrtuIzinPage() {
  const { profile } = useProfile()
  const [anak, setAnak] = useState<any[]>([])
  const [selectedAnak, setSelectedAnak] = useState('')
  const [izin, setIzin] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [noAnak, setNoAnak] = useState(false)

  useEffect(() => {
    if (!profile) return
    const init = async () => {
      const { data } = await supabase.from('ortu_siswa').select('*, siswa(id,nama)').eq('user_id', profile.user_id)
      const anakList = (data||[]).map((d:any)=>d.siswa)
      setAnak(anakList)
      if(anakList[0]) setSelectedAnak(anakList[0].id)
      else setNoAnak(true)
    }
    init()
  }, [profile])

  useEffect(() => {
    if (!selectedAnak) return
    const fetch = async () => {
      const { data } = await supabase.from('izin').select('*').eq('siswa_id', selectedAnak).order('created_at',{ascending:false})
      setIzin(data||[])
    }
    fetch()
  }, [selectedAnak])

  const handleSubmit = async () => {
    if (!selectedAnak || !profile) return
    setSaving(true)
    await supabase.from('izin').insert([{
      ...form, siswa_id: selectedAnak, user_id: profile.user_id, status: 'pending'
    }])
    const { data } = await supabase.from('izin').select('*').eq('siswa_id', selectedAnak).order('created_at',{ascending:false})
    setIzin(data||[]); setModal(false); setForm(EMPTY); setSaving(false)
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }))

  const izinBadge = (s: string) => s==='pending'?'badge-yellow':s==='disetujui'?'badge-green':'badge-red'

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Pengajuan Izin</h1><p className="page-subtitle">Ajukan izin tidak masuk untuk anak Anda</p></div>
        {!noAnak && <button className="btn btn-primary" onClick={()=>setModal(true)}><Plus size={16}/>Ajukan Izin</button>}
      </div>

      {noAnak ? (
        <div className="card card-pad text-center py-12">
          <AlertCircle size={40} className="text-orange-400 mx-auto mb-3"/>
          <p className="font-semibold text-gray-700">Akun belum terhubung ke data siswa.</p>
          <p className="text-sm text-gray-400 mt-1">Hubungi Admin sekolah untuk menghubungkan akun Anda.</p>
        </div>
      ) : (
        <>
          <select className="form-input w-auto mb-5" value={selectedAnak} onChange={e=>setSelectedAnak(e.target.value)}>
            {anak.map((a:any)=><option key={a.id} value={a.id}>{a.nama}</option>)}
          </select>

          <div className="space-y-3">
            {izin.length===0?<EmptyState icon={MessageSquare} title="Belum ada pengajuan izin" desc="Klik 'Ajukan Izin' untuk membuat pengajuan baru"/>
            :izin.map(iz=>(
              <div key={iz.id} className="card card-pad flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
                  ${iz.jenis==='sakit'?'bg-blue-100 text-blue-700':iz.jenis==='izin'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-600'}`}>
                  {iz.jenis.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-800 capitalize">{iz.jenis}</p>
                    <span className={`badge ${izinBadge(iz.status)}`}>{iz.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">{iz.keterangan}</p>
                  <p className="text-xs text-gray-400 mt-1">{iz.tanggal_mulai} s.d. {iz.tanggal_selesai} • Dikirim {new Date(iz.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title="Ajukan Izin Tidak Masuk">
        <div className="space-y-4">
          <div><label className="form-label">Anak</label>
            <select className="form-input" value={selectedAnak} onChange={e=>setSelectedAnak(e.target.value)}>
              {anak.map((a:any)=><option key={a.id} value={a.id}>{a.nama}</option>)}
            </select></div>
          <div><label className="form-label">Jenis Izin</label>
            <select className="form-input" value={form.jenis} onChange={f('jenis')}>
              <option value="sakit">Sakit</option>
              <option value="izin">Izin (Keperluan Keluarga)</option>
              <option value="lainnya">Lainnya</option>
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Tanggal Mulai</label>
              <input type="date" className="form-input" value={form.tanggal_mulai} onChange={f('tanggal_mulai')}/></div>
            <div><label className="form-label">Tanggal Selesai</label>
              <input type="date" className="form-input" value={form.tanggal_selesai} onChange={f('tanggal_selesai')}/></div>
          </div>
          <div><label className="form-label">Keterangan *</label>
            <textarea className="form-input" rows={3} value={form.keterangan} onChange={f('keterangan')}
              placeholder="Jelaskan alasan izin dengan detail..."/></div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t">
          <button onClick={()=>setModal(false)} className="btn btn-secondary">Batal</button>
          <button onClick={handleSubmit} disabled={saving||!form.keterangan} className="btn btn-primary">
            {saving?'Mengirim...':'Kirim Pengajuan'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
