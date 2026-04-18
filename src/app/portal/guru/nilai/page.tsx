'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { BarChart2, Save, CheckCircle } from 'lucide-react'

const MAPEL = ['Matematika','Bahasa Indonesia','IPA','IPS','PKn','Bahasa Arab','Qur\'an Hadits','Fiqih','Aqidah Akhlak','SKI','PJOK','SBdP','Bahasa Inggris']

export default function GuruNilai() {
  const { user } = useAuth()
  const [kelas, setKelas] = useState<any[]>([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [selectedMapel, setSelectedMapel] = useState(MAPEL[0])
  const [semester, setSemester] = useState('2')
  const [tahunAjaran, setTahunAjaran] = useState('2024/2025')
  const [siswaList, setSiswaList] = useState<any[]>([])
  const [nilaiMap, setNilaiMap] = useState<Record<string,{uts:string,uas:string,tugas:string,harian:string}>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('kelas').select('*').order('nama_kelas').then(({ data }) => setKelas(data||[]))
  }, [])

  useEffect(() => {
    if (!selectedKelas) return
    setLoading(true)
    Promise.all([
      supabase.from('siswa').select('id, nama').eq('kelas_id', selectedKelas).eq('status','aktif').order('nama'),
      supabase.from('nilai').select('*').eq('kelas_id', selectedKelas).eq('mapel', selectedMapel).eq('semester', semester).eq('tahun_ajaran', tahunAjaran),
    ]).then(([{ data: siswa }, { data: nilai }]) => {
      setSiswaList(siswa||[])
      const map: Record<string,any> = {}
      for (const s of (siswa||[])) {
        const found = (nilai||[]).find((n:any) => n.siswa_id === s.id)
        map[s.id] = { uts: found?.nilai_uts?.toString()||'', uas: found?.nilai_uas?.toString()||'', tugas: found?.nilai_tugas?.toString()||'', harian: found?.nilai_harian?.toString()||'' }
      }
      setNilaiMap(map)
      setLoading(false)
    })
  }, [selectedKelas, selectedMapel, semester, tahunAjaran])

  const setNilai = (siswaId:string, field:string, val:string) => {
    setNilaiMap(prev => ({ ...prev, [siswaId]: { ...prev[siswaId], [field]: val } }))
    setSaved(false)
  }

  const calcAkhir = (n:any) => {
    const vals = [n.uts, n.uas, n.tugas, n.harian].map(v => parseFloat(v)||0).filter(v => v > 0)
    if (!vals.length) return 0
    return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)
  }

  const getPredikat = (nilai:number) => {
    if (nilai >= 90) return 'A'
    if (nilai >= 80) return 'B'
    if (nilai >= 70) return 'C'
    if (nilai >= 60) return 'D'
    return 'E'
  }

  const handleSave = async () => {
    if (!selectedKelas) return
    setSaving(true)
    const records = siswaList.map(s => {
      const n = nilaiMap[s.id] || { uts:'', uas:'', tugas:'', harian:'' }
      const akhir = calcAkhir(n)
      return {
        siswa_id: s.id, kelas_id: selectedKelas, mapel: selectedMapel,
        semester, tahun_ajaran: tahunAjaran,
        nilai_uts: n.uts ? parseFloat(n.uts) : null,
        nilai_uas: n.uas ? parseFloat(n.uas) : null,
        nilai_tugas: n.tugas ? parseFloat(n.tugas) : null,
        nilai_harian: n.harian ? parseFloat(n.harian) : null,
        nilai_akhir: akhir || null,
        predikat: akhir ? getPredikat(akhir) : null,
        dibuat_oleh: user?.id,
      }
    })
    await supabase.from('nilai').upsert(records, { onConflict: 'siswa_id,kelas_id,mapel,semester,tahun_ajaran' })
    setSaving(false); setSaved(true)
    setTimeout(()=>setSaved(false), 3000)
  }

  const inputStyle = { width:64, padding:'5px 6px', borderRadius:6, border:'1px solid #d1d5db', fontSize:'0.85rem', textAlign:'center' as const, outline:'none' }

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><BarChart2 size={22} color="#166534"/> Input Nilai Siswa</h1>
        <p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>UTS, UAS, Tugas, dan Nilai Harian</p>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <select className="form-select" style={{ width:200 }} value={selectedKelas} onChange={e=>setSelectedKelas(e.target.value)}>
          <option value="">— Pilih Kelas —</option>
          {kelas.map(k=><option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
        </select>
        <select className="form-select" style={{ width:200 }} value={selectedMapel} onChange={e=>setSelectedMapel(e.target.value)}>
          {MAPEL.map(m=><option key={m}>{m}</option>)}
        </select>
        <select className="form-select" style={{ width:160 }} value={semester} onChange={e=>setSemester(e.target.value)}>
          <option value="1">Semester 1 (Ganjil)</option>
          <option value="2">Semester 2 (Genap)</option>
        </select>
        <input className="form-input" style={{ width:130 }} placeholder="2024/2025" value={tahunAjaran} onChange={e=>setTahunAjaran(e.target.value)}/>
      </div>
      {selectedKelas && (
        <>
          {loading ? <div style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat siswa...</div> : (
            <div className="table-wrap" style={{ marginBottom:16 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th><th>Nama Siswa</th>
                    <th style={{ textAlign:'center' }}>UTS</th>
                    <th style={{ textAlign:'center' }}>UAS</th>
                    <th style={{ textAlign:'center' }}>Tugas</th>
                    <th style={{ textAlign:'center' }}>Harian</th>
                    <th style={{ textAlign:'center' }}>Rata-rata</th>
                    <th style={{ textAlign:'center' }}>Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  {siswaList.length === 0 ? <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Tidak ada siswa</td></tr>
                    : siswaList.map((s,i) => {
                      const n = nilaiMap[s.id] || { uts:'', uas:'', tugas:'', harian:'' }
                      const akhir = calcAkhir(n)
                      const pred = akhir ? getPredikat(akhir) : '—'
                      const predColor = akhir>=80?'#166534':akhir>=70?'#b45309':'#dc2626'
                    return (
                      <tr key={s.id}>
                        <td style={{ color:'#9ca3af' }}>{i+1}</td>
                        <td style={{ fontWeight:600 }}>{s.nama}</td>
                        {['uts','uas','tugas','harian'].map(f => (
                          <td key={f} style={{ textAlign:'center' }}>
                            <input style={inputStyle} type="number" min="0" max="100" value={(n as any)[f]} onChange={e=>setNilai(s.id, f, e.target.value)}/>
                          </td>
                        ))}
                        <td style={{ textAlign:'center', fontWeight:700, color: akhir >= 75 ? '#166534' : '#dc2626', fontSize:'1rem' }}>{akhir||'—'}</td>
                        <td style={{ textAlign:'center' }}><span style={{ fontWeight:700, color:predColor, fontSize:'0.9rem' }}>{pred}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            {saved && <div style={{ display:'flex', alignItems:'center', gap:6, color:'#166534', fontSize:'0.875rem', fontWeight:600 }}><CheckCircle size={16}/> Nilai tersimpan!</div>}
            <button onClick={handleSave} className="btn-primary" disabled={saving || siswaList.length===0}>
              <Save size={16}/> {saving?'Menyimpan...':'Simpan Nilai'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
