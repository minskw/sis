'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { ClipboardList } from 'lucide-react'

export default function OrtuAbsensi() {
  const { user } = useAuth()
  const [anak, setAnak] = useState<any[]>([])
  const [selectedAnak, setSelectedAnak] = useState('')
  const [absensi, setAbsensi] = useState<any[]>([])
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0,7))
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({ H:0, S:0, I:0, A:0 })

  useEffect(() => {
    if (!user) return
    supabase.from('wali_siswa').select('siswa_id, siswa(id, nama)').eq('user_id', user.id).then(({ data }) => {
      const list = (data||[]).map((w:any) => w.siswa).filter(Boolean)
      setAnak(list)
      if (list.length > 0) setSelectedAnak(list[0].id)
    })
  }, [user])

  useEffect(() => {
    if (!selectedAnak || !bulan) return
    setLoading(true)
    const from = bulan+'-01'
    const to = bulan+'-31'
    supabase.from('absensi').select('*').eq('siswa_id', selectedAnak).gte('tanggal', from).lte('tanggal', to).order('tanggal').then(({ data }) => {
      setAbsensi(data||[])
      const s = { H:0, S:0, I:0, A:0 }
      for (const a of (data||[])) s[a.status as keyof typeof s]++
      setSummary(s)
      setLoading(false)
    })
  }, [selectedAnak, bulan])

  const statusColor:Record<string,string> = { H:'#166534', S:'#1d4ed8', I:'#b45309', A:'#dc2626' }
  const statusBg:Record<string,string> = { H:'#dcfce7', S:'#dbeafe', I:'#fef9c3', A:'#fee2e2' }
  const statusLabel:Record<string,string> = { H:'Hadir', S:'Sakit', I:'Izin', A:'Alpha' }
  const namaAnak = anak.find(a => a.id === selectedAnak)?.nama || ''

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><ClipboardList size={22} color="#166534"/> Absensi Anak</h1>
        <p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>Rekap kehadiran harian</p>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        {anak.length > 1 && (
          <select className="form-select" style={{ width:220 }} value={selectedAnak} onChange={e=>setSelectedAnak(e.target.value)}>
            {anak.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
          </select>
        )}
        <input type="month" className="form-input" style={{ width:180 }} value={bulan} onChange={e=>setBulan(e.target.value)}/>
      </div>
      {selectedAnak && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            {(['H','S','I','A'] as const).map(s => (
              <div key={s} style={{ background:statusBg[s], border:`1px solid ${statusColor[s]}40`, borderRadius:10, padding:'14px', textAlign:'center' }}>
                <div style={{ fontSize:'2rem', fontWeight:900, color:statusColor[s] }}>{summary[s]}</div>
                <div style={{ fontSize:'0.8rem', color:statusColor[s], fontWeight:600 }}>{statusLabel[s]}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:8, fontWeight:600, color:'#374151', fontSize:'0.9rem' }}>
            Rekap {namaAnak} — {new Date(bulan+'-01').toLocaleDateString('id-ID',{month:'long',year:'numeric'})}
          </div>
          {loading ? <div style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat...</div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Tanggal</th><th>Hari</th><th>Status</th><th>Keterangan</th></tr></thead>
                <tbody>
                  {absensi.length === 0 ? <tr><td colSpan={4} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Belum ada data absensi bulan ini</td></tr>
                    : absensi.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight:600 }}>{new Date(a.tanggal).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</td>
                      <td style={{ fontSize:'0.85rem', color:'#6b7280' }}>{new Date(a.tanggal).toLocaleDateString('id-ID',{weekday:'long'})}</td>
                      <td><span style={{ padding:'3px 10px', borderRadius:99, fontWeight:700, fontSize:'0.8rem', background:statusBg[a.status], color:statusColor[a.status] }}>{statusLabel[a.status]}</span></td>
                      <td style={{ fontSize:'0.85rem', color:'#6b7280' }}>{a.keterangan||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
