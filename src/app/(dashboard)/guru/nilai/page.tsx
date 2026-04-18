'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'
import EmptyState from '@/components/ui/EmptyState'
import { BarChart3, Save } from 'lucide-react'

export default function GuruNilaiPage() {
  const { profile } = useProfile()
  const [guruId, setGuruId] = useState<string|null>(null)
  const [kelas, setKelas] = useState<any[]>([])
  const [mapel, setMapel] = useState<any[]>([])
  const [kelasF, setKelasF] = useState('')
  const [mapelF, setMapelF] = useState('')
  const [semester, setSemester] = useState('2')
  const [tahunAjaran] = useState('2024/2025')
  const [siswa, setSiswa] = useState<any[]>([])
  const [nilaiMap, setNilaiMap] = useState<Record<string,any>>({})
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
        const { data: jadwal } = await supabase.from('jadwal_pelajaran')
          .select('kelas_id, kelas(id,nama), mapel_id, mapel:mata_pelajaran(id,nama,kkm)')
          .eq('guru_id', g.id)
        const uk = Array.from(new Map((jadwal||[]).map((j:any)=>[j.kelas.id,j.kelas])).values())
        const um = Array.from(new Map((jadwal||[]).map((j:any)=>[j.mapel.id,j.mapel])).values())
        setKelas(uk); setMapel(um)
        if(uk[0]) setKelasF((uk[0] as any).id)
        if(um[0]) setMapelF((um[0] as any).id)
      }
    }
    init()
  }, [profile])

  useEffect(() => {
    if (!kelasF || !mapelF) return
    const fetch = async () => {
      setLoading(true)
      const [s, n] = await Promise.all([
        supabase.from('siswa').select('id,nama').eq('kelas_id',kelasF).eq('status','aktif').order('nama'),
        supabase.from('nilai').select('*').eq('kelas_id',kelasF).eq('mapel_id',mapelF).eq('semester',semester).eq('tahun_ajaran',tahunAjaran),
      ])
      setSiswa(s.data||[])
      const nm: Record<string,any> = {}
      const ids: Record<string,string> = {}
      ;(n.data||[]).forEach((nv:any) => {
        nm[nv.siswa_id] = { tugas: nv.nilai_tugas||'', uts: nv.nilai_uts||'', uas: nv.nilai_uas||'' }
        ids[nv.siswa_id] = nv.id
      })
      ;(s.data||[]).forEach((sw:any) => {
        if (!nm[sw.id]) nm[sw.id] = { tugas:'', uts:'', uas:'' }
      })
      setNilaiMap(nm); setExistingIds(ids); setLoading(false); setSaved(false)
    }
    fetch()
  }, [kelasF, mapelF, semester])

  const setN = (sid: string, key: string, val: string) =>
    setNilaiMap(p => ({ ...p, [sid]: { ...p[sid], [key]: val } }))

  const handleSave = async () => {
    if (!guruId) return
    setSaving(true)
    const rows = siswa.map(s => ({
      siswa_id: s.id, mapel_id: mapelF, kelas_id: kelasF,
      semester: parseInt(semester), tahun_ajaran: tahunAjaran,
      nilai_tugas: parseFloat(nilaiMap[s.id]?.tugas)||null,
      nilai_uts: parseFloat(nilaiMap[s.id]?.uts)||null,
      nilai_uas: parseFloat(nilaiMap[s.id]?.uas)||null,
      guru_id: guruId,
    }))
    await supabaseAdmin.from('nilai').upsert(rows, { onConflict: 'siswa_id,mapel_id,semester,tahun_ajaran' })
    setSaving(false); setSaved(true)
  }

  const avg = (val: string) => val ? parseFloat(val) : 0
  const akhir = (sid: string) => {
    const n = nilaiMap[sid]
    if (!n) return 0
    return Math.round((avg(n.tugas)*0.3 + avg(n.uts)*0.3 + avg(n.uas)*0.4) * 10) / 10
  }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Input Nilai</h1><p className="page-subtitle">Masukkan nilai siswa per mata pelajaran</p></div>

      <div className="flex flex-wrap gap-3 mb-5">
        <select className="form-input w-auto" value={kelasF} onChange={e=>setKelasF(e.target.value)}>
          {kelas.map((k:any)=><option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
        <select className="form-input w-auto" value={mapelF} onChange={e=>setMapelF(e.target.value)}>
          {mapel.map((m:any)=><option key={m.id} value={m.id}>{m.nama}</option>)}
        </select>
        <select className="form-input w-auto" value={semester} onChange={e=>setSemester(e.target.value)}>
          <option value="1">Semester 1 (Ganjil)</option>
          <option value="2">Semester 2 (Genap)</option>
        </select>
      </div>

      <div className="card overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>No</th><th>Nama Siswa</th>
              <th className="text-center">Tugas (30%)</th>
              <th className="text-center">UTS (30%)</th>
              <th className="text-center">UAS (40%)</th>
              <th className="text-center">Nilai Akhir</th>
            </tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={6} className="text-center py-10 text-gray-400">Memuat...</td></tr>)
              :siswa.length===0?(<tr><td colSpan={6}><EmptyState icon={BarChart3} title="Pilih kelas dan mata pelajaran"/></td></tr>)
              :siswa.map((s,i)=>(
                <tr key={s.id}>
                  <td className="text-gray-400">{i+1}</td>
                  <td className="font-semibold">{s.nama}</td>
                  {['tugas','uts','uas'].map(key=>(
                    <td key={key} className="text-center">
                      <input type="number" min="0" max="100" step="0.5"
                        className="form-input text-center w-20 mx-auto py-1"
                        value={nilaiMap[s.id]?.[key]||''}
                        onChange={e=>setN(s.id, key, e.target.value)}
                        placeholder="-"/>
                    </td>
                  ))}
                  <td className="text-center">
                    <span className={`badge font-bold text-sm ${akhir(s.id)>=75?'badge-green':akhir(s.id)>=60?'badge-yellow':'badge-red'}`}>
                      {akhir(s.id)||'-'}
                    </span>
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
            <Save size={16}/>{saving?'Menyimpan...':'Simpan Semua Nilai'}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-semibold">✓ Nilai berhasil disimpan!</span>}
        </div>
      )}
    </div>
  )
}
