'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { BarChart2 } from 'lucide-react'

export default function OrtuNilai() {
  const { user } = useAuth()
  const [anak, setAnak] = useState<any[]>([])
  const [selectedAnak, setSelectedAnak] = useState('')
  const [semester, setSemester] = useState('2')
  const [tahunAjaran, setTahunAjaran] = useState('2024/2025')
  const [nilai, setNilai] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('wali_siswa').select('siswa_id, siswa(id, nama)').eq('user_id', user.id).then(({ data }) => {
      const list = (data||[]).map((w:any) => w.siswa).filter(Boolean)
      setAnak(list)
      if (list.length) setSelectedAnak(list[0].id)
    })
  }, [user])

  useEffect(() => {
    if (!selectedAnak) return
    setLoading(true)
    supabase.from('nilai').select('*').eq('siswa_id', selectedAnak).eq('semester', semester).eq('tahun_ajaran', tahunAjaran).order('mapel').then(({ data }) => {
      setNilai(data||[]); setLoading(false)
    })
  }, [selectedAnak, semester, tahunAjaran])

  const predColor = (n:number) => n>=80?'#166534':n>=70?'#b45309':'#dc2626'
  const avg = nilai.filter(n=>n.nilai_akhir).reduce((a,n,_,arr) => a + n.nilai_akhir/arr.length, 0)
  const namaAnak = anak.find(a => a.id === selectedAnak)?.nama || ''

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><BarChart2 size={22} color="#166534"/> Nilai Anak</h1>
        <p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>Perkembangan akademik</p>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        {anak.length > 1 && <select className="form-select" style={{ width:220 }} value={selectedAnak} onChange={e=>setSelectedAnak(e.target.value)}>{anak.map(a=><option key={a.id} value={a.id}>{a.nama}</option>)}</select>}
        <select className="form-select" style={{ width:180 }} value={semester} onChange={e=>setSemester(e.target.value)}><option value="1">Semester 1</option><option value="2">Semester 2</option></select>
        <input className="form-input" style={{ width:130 }} value={tahunAjaran} onChange={e=>setTahunAjaran(e.target.value)}/>
      </div>
      {selectedAnak && nilai.length > 0 && (
        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'14px 20px', marginBottom:16, display:'flex', gap:24 }}>
          <div><div style={{ fontSize:'0.75rem', color:'#166534' }}>Siswa</div><div style={{ fontWeight:700, color:'#111827' }}>{namaAnak}</div></div>
          <div><div style={{ fontSize:'0.75rem', color:'#166534' }}>Rata-rata Umum</div><div style={{ fontWeight:700, fontSize:'1.2rem', color: avg>=75?'#166534':'#dc2626' }}>{Math.round(avg)||'—'}</div></div>
          <div><div style={{ fontSize:'0.75rem', color:'#166534' }}>Mata Pelajaran</div><div style={{ fontWeight:700, color:'#111827' }}>{nilai.length}</div></div>
          <div><div style={{ fontSize:'0.75rem', color:'#166534' }}>Di bawah KKM (75)</div><div style={{ fontWeight:700, color:'#dc2626' }}>{nilai.filter(n=>n.nilai_akhir&&n.nilai_akhir<75).length}</div></div>
        </div>
      )}
      {loading ? <div style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat...</div> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>No</th><th>Mata Pelajaran</th><th style={{ textAlign:'center' }}>UTS</th><th style={{ textAlign:'center' }}>UAS</th><th style={{ textAlign:'center' }}>Tugas</th><th style={{ textAlign:'center' }}>Nilai Akhir</th><th style={{ textAlign:'center' }}>Predikat</th></tr></thead>
            <tbody>
              {nilai.length === 0 ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Belum ada data nilai</td></tr>
                : nilai.map((n,i) => (
                <tr key={n.id}>
                  <td style={{ color:'#9ca3af' }}>{i+1}</td>
                  <td style={{ fontWeight:600 }}>{n.mapel}</td>
                  <td style={{ textAlign:'center' }}>{n.nilai_uts??'—'}</td>
                  <td style={{ textAlign:'center' }}>{n.nilai_uas??'—'}</td>
                  <td style={{ textAlign:'center' }}>{n.nilai_tugas??'—'}</td>
                  <td style={{ textAlign:'center', fontWeight:800, fontSize:'1rem', color:n.nilai_akhir?predColor(n.nilai_akhir):'#9ca3af' }}>{n.nilai_akhir??'—'}</td>
                  <td style={{ textAlign:'center' }}><span style={{ fontWeight:700, color:n.predikat&&n.nilai_akhir?predColor(n.nilai_akhir):'#9ca3af' }}>{n.predikat||'—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
