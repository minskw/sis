'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'
import EmptyState from '@/components/ui/EmptyState'
import { BarChart3 } from 'lucide-react'

export default function OrtuNilaiPage() {
  const { profile } = useProfile()
  const [anak, setAnak] = useState<any[]>([])
  const [selectedAnak, setSelectedAnak] = useState('')
  const [semester, setSemester] = useState('2')
  const [nilai, setNilai] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    const init = async () => {
      const { data } = await supabase.from('ortu_siswa').select('*, siswa(id,nama)').eq('user_id', profile.user_id)
      const anakList = (data||[]).map((d:any)=>d.siswa)
      setAnak(anakList)
      if(anakList[0]) setSelectedAnak(anakList[0].id)
    }
    init()
  }, [profile])

  useEffect(() => {
    if (!selectedAnak) return
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabase.from('nilai')
        .select('*, mapel:mata_pelajaran(nama,kkm)')
        .eq('siswa_id', selectedAnak).eq('semester', semester)
      setNilai(data||[]); setLoading(false)
    }
    fetch()
  }, [selectedAnak, semester])

  const predikat = (n: number) => n>=90?'A':n>=80?'B':n>=70?'C':n>=60?'D':'E'
  const predColor = (n: number) => n>=80?'badge-green':n>=70?'badge-yellow':'badge-red'

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Nilai Anak</h1><p className="page-subtitle">Lihat rekap nilai akademik</p></div>

      <div className="flex flex-wrap gap-3 mb-5">
        <select className="form-input w-auto" value={selectedAnak} onChange={e=>setSelectedAnak(e.target.value)}>
          {anak.map((a:any)=><option key={a.id} value={a.id}>{a.nama}</option>)}
        </select>
        <select className="form-input w-auto" value={semester} onChange={e=>setSemester(e.target.value)}>
          <option value="1">Semester 1 (Ganjil)</option>
          <option value="2">Semester 2 (Genap)</option>
        </select>
      </div>

      {nilai.length > 0 && (
        <div className="flex gap-5 p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">
          <div><p className="text-xs text-emerald-600">Rata-rata</p>
            <p className="font-extrabold text-xl text-emerald-900">{(nilai.reduce((a,n)=>a+(n.nilai_akhir||0),0)/nilai.length).toFixed(1)}</p></div>
          <div><p className="text-xs text-emerald-600">Di Bawah KKM</p>
            <p className="font-extrabold text-xl text-red-600">{nilai.filter(n=>(n.nilai_akhir||0)<(n.mapel?.kkm||75)).length}</p></div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Mata Pelajaran</th><th className="text-center">KKM</th><th className="text-center">Tugas</th><th className="text-center">UTS</th><th className="text-center">UAS</th><th className="text-center">Nilai Akhir</th><th className="text-center">Predikat</th></tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={7} className="text-center py-10 text-gray-400">Memuat...</td></tr>)
              :nilai.length===0?(<tr><td colSpan={7}><EmptyState icon={BarChart3} title="Belum ada data nilai"/></td></tr>)
              :nilai.map(n=>(
                <tr key={n.id}>
                  <td className="font-semibold">{n.mapel?.nama}</td>
                  <td className="text-center text-gray-500">{n.mapel?.kkm}</td>
                  <td className="text-center">{n.nilai_tugas??'-'}</td>
                  <td className="text-center">{n.nilai_uts??'-'}</td>
                  <td className="text-center">{n.nilai_uas??'-'}</td>
                  <td className="text-center font-bold text-gray-800">{n.nilai_akhir??'-'}</td>
                  <td className="text-center"><span className={`badge ${predColor(n.nilai_akhir||0)}`}>{predikat(n.nilai_akhir||0)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
