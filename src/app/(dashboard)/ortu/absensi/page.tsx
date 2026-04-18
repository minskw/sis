'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'
import EmptyState from '@/components/ui/EmptyState'
import { ClipboardList } from 'lucide-react'

export default function OrtuAbsensiPage() {
  const { profile } = useProfile()
  const [anak, setAnak] = useState<any[]>([])
  const [selectedAnak, setSelectedAnak] = useState('')
  const [absensi, setAbsensi] = useState<any[]>([])
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0,7))
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
      const start = bulan + '-01'
      const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth()+1, 0).toISOString().split('T')[0]
      const { data } = await supabase.from('absensi').select('*')
        .eq('siswa_id', selectedAnak).gte('tanggal', start).lte('tanggal', end).order('tanggal')
      setAbsensi(data||[]); setLoading(false)
    }
    fetch()
  }, [selectedAnak, bulan])

  const count = (s: string) => absensi.filter(a=>a.status===s).length
  const badge: Record<string,string> = { H:'badge-green', S:'badge-blue', I:'badge-yellow', A:'badge-red' }
  const label: Record<string,string> = { H:'Hadir', S:'Sakit', I:'Izin', A:'Alpha' }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Absensi Anak</h1><p className="page-subtitle">Rekap kehadiran bulanan</p></div>

      <div className="flex flex-wrap gap-3 mb-5">
        <select className="form-input w-auto" value={selectedAnak} onChange={e=>setSelectedAnak(e.target.value)}>
          {anak.map((a:any)=><option key={a.id} value={a.id}>{a.nama}</option>)}
        </select>
        <input type="month" className="form-input w-auto" value={bulan} onChange={e=>setBulan(e.target.value)}/>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[['H','Hadir','text-emerald-600'],['S','Sakit','text-blue-600'],['I','Izin','text-yellow-600'],['A','Alpha','text-red-600']].map(([s,l,c])=>(
          <div key={s} className="card card-pad text-center">
            <p className={`text-2xl font-extrabold ${c}`}>{count(s as string)}</p>
            <p className="text-xs text-gray-500">{l}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Tanggal</th><th>Hari</th><th>Status</th><th>Keterangan</th></tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={4} className="text-center py-10 text-gray-400">Memuat...</td></tr>)
              :absensi.length===0?(<tr><td colSpan={4}><EmptyState icon={ClipboardList} title="Belum ada data absensi bulan ini"/></td></tr>)
              :absensi.map(a=>(
                <tr key={a.id}>
                  <td className="font-medium">{new Date(a.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</td>
                  <td className="text-gray-500">{new Date(a.tanggal+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long'})}</td>
                  <td><span className={`badge ${badge[a.status]}`}>{label[a.status]}</span></td>
                  <td className="text-gray-500 text-sm">{a.keterangan||'-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
