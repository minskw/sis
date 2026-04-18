'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'
import EmptyState from '@/components/ui/EmptyState'
import { ClipboardList, Save } from 'lucide-react'

type Status = 'H'|'S'|'I'|'A'
const STATUS_INFO = [
  {v:'H',l:'Hadir',c:'bg-emerald-100 text-emerald-800 border-emerald-300'},
  {v:'S',l:'Sakit',c:'bg-blue-100 text-blue-800 border-blue-300'},
  {v:'I',l:'Izin',c:'bg-yellow-100 text-yellow-800 border-yellow-300'},
  {v:'A',l:'Alpha',c:'bg-red-100 text-red-800 border-red-300'},
]

export default function GuruAbsensiPage() {
  const { profile } = useProfile()
  const [guruId, setGuruId] = useState<string|null>(null)
  const [kelas, setKelas] = useState<any[]>([])
  const [kelasF, setKelasF] = useState('')
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [siswa, setSiswa] = useState<any[]>([])
  const [absenMap, setAbsenMap] = useState<Record<string,{status:Status,ket:string}>>({})
  const [existingIds, setExistingIds] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!profile) return
    const init = async () => {
      const { data: g } = await supabase.from('guru').select('id').eq('user_id', profile.user_id).single()
      if (g) {
        setGuruId(g.id)
        const { data: jadwal } = await supabase.from('jadwal_pelajaran').select('kelas_id, kelas(id,nama)').eq('guru_id', g.id)
        const uniqueKelas = Array.from(new Map((jadwal||[]).map(j=>[(j as any).kelas.id,(j as any).kelas])).values())
        setKelas(uniqueKelas)
        if (uniqueKelas[0]) setKelasF((uniqueKelas[0] as any).id)
      }
    }
    init()
  }, [profile])

  useEffect(() => {
    if (!kelasF) return
    const fetch = async () => {
      setLoading(true)
      const [s, a] = await Promise.all([
        supabase.from('siswa').select('id,nama').eq('kelas_id', kelasF).eq('status','aktif').order('nama'),
        supabase.from('absensi').select('*').eq('kelas_id', kelasF).eq('tanggal', tanggal),
      ])
      setSiswa(s.data||[])
      const newMap: Record<string,{status:Status,ket:string}> = {}
      const ids: Record<string,string> = {}
      ;(a.data||[]).forEach((ab: any) => {
        newMap[ab.siswa_id] = { status: ab.status, ket: ab.keterangan||'' }
        ids[ab.siswa_id] = ab.id
      })
      ;(s.data||[]).forEach((sw: any) => {
        if (!newMap[sw.id]) newMap[sw.id] = { status: 'H', ket: '' }
      })
      setAbsenMap(newMap); setExistingIds(ids); setLoading(false); setSaved(false)
    }
    fetch()
  }, [kelasF, tanggal])

  const setStatus = (sid: string, status: Status) =>
    setAbsenMap(p => ({ ...p, [sid]: { ...p[sid], status } }))
  const setKet = (sid: string, ket: string) =>
    setAbsenMap(p => ({ ...p, [sid]: { ...p[sid], ket } }))

  const handleSave = async () => {
    if (!guruId || !kelasF) return
    setSaving(true)
    const rows = siswa.map(s => ({
      siswa_id: s.id, kelas_id: kelasF, tanggal,
      status: absenMap[s.id]?.status || 'H',
      keterangan: absenMap[s.id]?.ket || '',
      guru_id: guruId,
    }))
    await supabaseAdmin.from('absensi').upsert(rows, { onConflict: 'siswa_id,tanggal' })
    setSaving(false); setSaved(true)
  }

  const count = (s: Status) => siswa.filter(sw=>absenMap[sw.id]?.status===s).length

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Input Absensi</h1><p className="page-subtitle">Catat kehadiran siswa</p></div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="form-input w-auto" value={kelasF} onChange={e=>setKelasF(e.target.value)}>
          {kelas.map((k:any)=><option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
        <input type="date" className="form-input w-auto" value={tanggal} onChange={e=>setTanggal(e.target.value)}/>
      </div>

      {siswa.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {STATUS_INFO.map(s=>(
            <div key={s.v} className="card card-pad text-center">
              <p className="text-2xl font-extrabold text-gray-800">{count(s.v as Status)}</p>
              <p className="text-xs text-gray-500">{s.l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>No</th><th>Nama Siswa</th><th>Status Kehadiran</th><th>Keterangan</th></tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={4} className="text-center py-10 text-gray-400">Memuat...</td></tr>)
              :siswa.length===0?(<tr><td colSpan={4}><EmptyState icon={ClipboardList} title={kelas.length===0?"Tidak ada kelas yang diajar":"Pilih kelas terlebih dahulu"}/></td></tr>)
              :siswa.map((s,i)=>(
                <tr key={s.id}>
                  <td className="text-gray-400">{i+1}</td>
                  <td className="font-semibold">{s.nama}</td>
                  <td>
                    <div className="flex gap-1.5">
                      {STATUS_INFO.map(st=>(
                        <button key={st.v} onClick={()=>setStatus(s.id, st.v as Status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition ${absenMap[s.id]?.status===st.v?st.c+' shadow-sm':'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                          {st.v}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    {absenMap[s.id]?.status !== 'H' && (
                      <input className="form-input py-1 text-sm" placeholder="Keterangan..." value={absenMap[s.id]?.ket||''}
                        onChange={e=>setKet(s.id, e.target.value)}/>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {siswa.length > 0 && (
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="btn btn-primary px-8">
            <Save size={16}/>{saving?'Menyimpan...':'Simpan Absensi'}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-semibold">✓ Absensi berhasil disimpan!</span>}
        </div>
      )}
    </div>
  )
}
