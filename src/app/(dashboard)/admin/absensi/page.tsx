'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import EmptyState from '@/components/ui/EmptyState'
import { ClipboardList, CheckCircle2, XCircle } from 'lucide-react'

export default function AdminAbsensiPage() {
  const [absensi, setAbsensi] = useState<any[]>([])
  const [izin, setIzin] = useState<any[]>([])
  const [kelas, setKelas] = useState<any[]>([])
  const [kelasF, setKelasF] = useState('')
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [tab, setTab] = useState<'absensi'|'izin'>('absensi')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: k } = await supabaseAdmin.from('kelas').select('*').order('tingkat').order('nama')
      setKelas(k||[])
    }
    init()
  }, [])

  useEffect(() => {
    if (!kelasF) return
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabaseAdmin.from('absensi')
        .select('*, siswa(nama)').eq('kelas_id', kelasF).eq('tanggal', tanggal)
      setAbsensi(data||[])
      setLoading(false)
    }
    fetch()
  }, [kelasF, tanggal])

  useEffect(() => {
    const fetchIzin = async () => {
      const { data } = await supabaseAdmin.from('izin')
        .select('*, siswa(nama, kelas:kelas(nama))')
        .order('created_at', { ascending: false })
      setIzin(data||[])
    }
    fetchIzin()
  }, [])

  const handleIzin = async (id: string, status: 'disetujui'|'ditolak') => {
    await supabaseAdmin.from('izin').update({ status }).eq('id', id)
    setIzin(prev => prev.map(iz => iz.id===id ? {...iz,status} : iz))
  }

  const statusBadge = (s: string) => ({H:'badge-green',S:'badge-blue',I:'badge-yellow',A:'badge-red'})[s]||'badge-gray'
  const izinBadge = (s: string) => s==='pending'?'badge-yellow':s==='disetujui'?'badge-green':'badge-red'

  const count = (s: string) => absensi.filter(a=>a.status===s).length

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Rekap Absensi & Izin</h1><p className="page-subtitle">Monitor kehadiran dan kelola pengajuan izin</p></div>

      <div className="flex gap-2 mb-5">
        {[{v:'absensi',l:'Rekap Absensi'},{v:'izin',l:'Pengajuan Izin'}].map(t=>(
          <button key={t.v} onClick={()=>setTab(t.v as any)}
            className={`btn ${tab===t.v?'btn-primary':'btn-secondary'}`}>{t.l}</button>
        ))}
      </div>

      {tab==='absensi'&&(
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <select className="form-input w-auto" value={kelasF} onChange={e=>setKelasF(e.target.value)}>
              <option value="">-- Pilih Kelas --</option>
              {kelas.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
            <input type="date" className="form-input w-auto" value={tanggal} onChange={e=>setTanggal(e.target.value)}/>
          </div>

          {absensi.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[['Hadir','H','text-emerald-600'],['Sakit','S','text-blue-600'],['Izin','I','text-yellow-600'],['Alpha','A','text-red-600']].map(([l,s,c])=>(
                <div key={s} className="card card-pad text-center">
                  <p className={`text-2xl font-extrabold ${c}`}>{count(s as string)}</p>
                  <p className="text-xs text-gray-500">{l}</p>
                </div>
              ))}
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>No</th><th>Nama Siswa</th><th>Status</th><th>Keterangan</th></tr></thead>
                <tbody>
                  {loading?(<tr><td colSpan={4} className="text-center py-10 text-gray-400">Memuat...</td></tr>)
                  :!kelasF?(<tr><td colSpan={4}><EmptyState icon={ClipboardList} title="Pilih kelas untuk melihat absensi"/></td></tr>)
                  :absensi.length===0?(<tr><td colSpan={4}><EmptyState icon={ClipboardList} title="Belum ada data absensi untuk tanggal ini"/></td></tr>)
                  :absensi.map((a,i)=>(
                    <tr key={a.id}>
                      <td className="text-gray-400">{i+1}</td>
                      <td className="font-semibold">{a.siswa?.nama}</td>
                      <td><span className={`badge ${statusBadge(a.status)}`}>{a.status==='H'?'Hadir':a.status==='S'?'Sakit':a.status==='I'?'Izin':'Alpha'}</span></td>
                      <td className="text-gray-500 text-sm">{a.keterangan||'-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab==='izin'&&(
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Nama Siswa</th><th>Kelas</th><th>Jenis</th><th>Tanggal</th><th>Keterangan</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {izin.length===0?(<tr><td colSpan={7}><EmptyState icon={ClipboardList} title="Belum ada pengajuan izin"/></td></tr>)
                :izin.map(iz=>(
                  <tr key={iz.id}>
                    <td className="font-semibold">{iz.siswa?.nama}</td>
                    <td><span className="badge badge-green">{iz.siswa?.kelas?.nama||'-'}</span></td>
                    <td><span className="badge badge-blue">{iz.jenis}</span></td>
                    <td className="text-sm text-gray-600">{iz.tanggal_mulai} — {iz.tanggal_selesai}</td>
                    <td className="text-sm text-gray-500 max-w-xs truncate">{iz.keterangan}</td>
                    <td><span className={`badge ${izinBadge(iz.status)}`}>{iz.status}</span></td>
                    <td>
                      {iz.status==='pending'&&(
                        <div className="flex gap-1">
                          <button onClick={()=>handleIzin(iz.id,'disetujui')} className="btn btn-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                            <CheckCircle2 size={13}/>Setujui
                          </button>
                          <button onClick={()=>handleIzin(iz.id,'ditolak')} className="btn btn-danger btn-sm">
                            <XCircle size={13}/>Tolak
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
