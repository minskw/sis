'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import SearchBar from '@/components/ui/SearchBar'
import EmptyState from '@/components/ui/EmptyState'
import { BarChart3 } from 'lucide-react'

export default function AdminNilaiPage() {
  const [nilai, setNilai] = useState<any[]>([])
  const [kelas, setKelas] = useState<any[]>([])
  const [mapel, setMapel] = useState<any[]>([])
  const [kelasF, setKelasF] = useState('')
  const [mapelF, setMapelF] = useState('')
  const [semF, setSemF] = useState('2')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const [k,m] = await Promise.all([
        supabaseAdmin.from('kelas').select('*').order('tingkat').order('nama'),
        supabaseAdmin.from('mata_pelajaran').select('*').order('nama'),
      ])
      setKelas(k.data||[]); setMapel(m.data||[])
      if(k.data?.[0]) setKelasF(k.data[0].id)
      if(m.data?.[0]) setMapelF(m.data[0].id)
    }
    init()
  }, [])

  useEffect(() => {
    if (!kelasF || !mapelF) return
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabaseAdmin.from('nilai')
        .select('*, siswa(nama), mapel:mata_pelajaran(nama,kkm)')
        .eq('kelas_id', kelasF).eq('mapel_id', mapelF).eq('semester', semF)
      setNilai(data||[])
      setLoading(false)
    }
    fetch()
  }, [kelasF, mapelF, semF])

  const filtered = nilai.filter(n => n.siswa?.nama?.toLowerCase().includes(search.toLowerCase()))
  const predikat = (n: number) => n>=90?'A':n>=80?'B':n>=70?'C':n>=60?'D':'E'
  const predColor = (n: number) => n>=80?'badge-green':n>=70?'badge-yellow':'badge-red'

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Rekap Nilai</h1><p className="page-subtitle">Lihat rekap nilai seluruh siswa</p></div>

      <div className="flex flex-wrap gap-3 mb-5">
        <select className="form-input w-auto" value={kelasF} onChange={e=>setKelasF(e.target.value)}>
          <option value="">-- Kelas --</option>
          {kelas.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
        <select className="form-input w-auto" value={mapelF} onChange={e=>setMapelF(e.target.value)}>
          <option value="">-- Mata Pelajaran --</option>
          {mapel.map(m=><option key={m.id} value={m.id}>{m.nama}</option>)}
        </select>
        <select className="form-input w-auto" value={semF} onChange={e=>setSemF(e.target.value)}>
          <option value="1">Semester 1 (Ganjil)</option>
          <option value="2">Semester 2 (Genap)</option>
        </select>
        <div className="w-52"><SearchBar value={search} onChange={setSearch} placeholder="Cari nama..."/></div>
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          {[
            ['Rata-rata Kelas', (filtered.reduce((a,n)=>a+(n.nilai_akhir||0),0)/filtered.length).toFixed(1)],
            ['Nilai Tertinggi', Math.max(...filtered.map(n=>n.nilai_akhir||0))],
            ['Di Bawah KKM', filtered.filter(n=>(n.nilai_akhir||0)<(n.mapel?.kkm||75)).length+' siswa'],
          ].map(([l,v])=>(
            <div key={l as string}><p className="text-xs text-emerald-600 font-medium">{l}</p><p className="font-extrabold text-emerald-900 text-xl">{v}</p></div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>No</th><th>Nama Siswa</th><th>Tugas</th><th>UTS</th><th>UAS</th><th>Nilai Akhir</th><th>Predikat</th></tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={7} className="text-center py-10 text-gray-400">Memuat...</td></tr>)
              :filtered.length===0?(<tr><td colSpan={7}><EmptyState icon={BarChart3} title="Pilih kelas & mata pelajaran"/></td></tr>)
              :filtered.map((n,i)=>(
                <tr key={n.id}>
                  <td className="text-gray-400">{i+1}</td>
                  <td className="font-semibold">{n.siswa?.nama}</td>
                  <td className="text-center">{n.nilai_tugas??'-'}</td>
                  <td className="text-center">{n.nilai_uts??'-'}</td>
                  <td className="text-center">{n.nilai_uas??'-'}</td>
                  <td className="text-center font-bold">{n.nilai_akhir??'-'}</td>
                  <td><span className={`badge ${predColor(n.nilai_akhir||0)}`}>{predikat(n.nilai_akhir||0)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
