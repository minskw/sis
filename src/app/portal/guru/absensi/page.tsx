'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { ClipboardList, Save, CheckCircle } from 'lucide-react'

type AbsenStatus = 'H'|'S'|'I'|'A'

export default function GuruAbsensi() {
  const { user } = useAuth()
  const [guruData, setGuruData] = useState<any>(null)
  const [kelas, setKelas] = useState<any[]>([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [siswaList, setSiswaList] = useState<any[]>([])
  const [absenMap, setAbsenMap] = useState<Record<string,AbsenStatus>>({})
  const [existing, setExisting] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('guru').select('id').eq('user_id', user.id).single().then(({ data }) => {
      if (data) {
        setGuruData(data)
        supabase.from('kelas').select('*').order('nama_kelas').then(({ data: k }) => setKelas(k||[]))
      } else {
        // fallback: show all kelas for admins testing as guru
        supabase.from('kelas').select('*').order('nama_kelas').then(({ data: k }) => setKelas(k||[]))
      }
    })
  }, [user])

  useEffect(() => {
    if (!selectedKelas) return
    setLoading(true)
    Promise.all([
      supabase.from('siswa').select('id, nama').eq('kelas_id', selectedKelas).eq('status','aktif').order('nama'),
      supabase.from('absensi').select('*').eq('kelas_id', selectedKelas).eq('tanggal', tanggal),
    ]).then(([{ data: siswa }, { data: absen }]) => {
      setSiswaList(siswa||[])
      const existingAbsen = absen||[]
      setExisting(existingAbsen)
      const map: Record<string,AbsenStatus> = {}
      for (const s of (siswa||[])) {
        const found = existingAbsen.find((a:any) => a.siswa_id === s.id)
        map[s.id] = found ? found.status : 'H'
      }
      setAbsenMap(map)
      setLoading(false)
    })
  }, [selectedKelas, tanggal])

  const toggle = (id:string, status:AbsenStatus) => {
    setAbsenMap(prev => ({ ...prev, [id]: status }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!selectedKelas) { alert('Pilih kelas terlebih dahulu'); return }
    setSaving(true)
    const records = siswaList.map(s => ({
      siswa_id: s.id, kelas_id: selectedKelas, tanggal, status: absenMap[s.id]||'H',
      dibuat_oleh: user?.id,
    }))
    // Upsert
    await supabase.from('absensi').upsert(records, { onConflict: 'siswa_id,tanggal' })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const count = (s:AbsenStatus) => Object.values(absenMap).filter(v => v === s).length
  const btnStyle = (s:AbsenStatus, active:boolean) => ({
    width:36, height:36, borderRadius:8, border:`2px solid ${active ? statusColor[s] : '#e5e7eb'}`,
    background: active ? statusBg[s] : 'white', color: active ? statusColor[s] : '#d1d5db',
    fontWeight:700, fontSize:'0.85rem', cursor:'pointer', transition:'all 0.1s',
  })
  const statusColor:Record<AbsenStatus,string> = { H:'#166534', S:'#1d4ed8', I:'#b45309', A:'#dc2626' }
  const statusBg:Record<AbsenStatus,string> = { H:'#dcfce7', S:'#dbeafe', I:'#fef9c3', A:'#fee2e2' }
  const statusLabel:Record<AbsenStatus,string> = { H:'Hadir', S:'Sakit', I:'Izin', A:'Alpha' }

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:10 }}><ClipboardList size={22} color="#166534"/> Input Absensi Siswa</h1>
        <p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:3 }}>Rekap kehadiran harian</p>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <select className="form-select" style={{ width:200 }} value={selectedKelas} onChange={e=>setSelectedKelas(e.target.value)}>
          <option value="">— Pilih Kelas —</option>
          {kelas.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
        </select>
        <input type="date" className="form-input" style={{ width:180 }} value={tanggal} onChange={e=>setTanggal(e.target.value)}/>
      </div>
      {selectedKelas && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            {(['H','S','I','A'] as AbsenStatus[]).map(s => (
              <div key={s} style={{ background:statusBg[s], border:`1px solid ${statusColor[s]}30`, borderRadius:10, padding:'12px 16px', textAlign:'center' }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:statusColor[s] }}>{count(s)}</div>
                <div style={{ fontSize:'0.75rem', color:statusColor[s], fontWeight:600 }}>{statusLabel[s]}</div>
              </div>
            ))}
          </div>
          {loading ? <div style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Memuat siswa...</div> : (
            <div className="table-wrap" style={{ marginBottom:16 }}>
              <div style={{ background:'#f8fafc', borderBottom:'1px solid #e5e7eb', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:600, fontSize:'0.875rem', color:'#374151' }}>
                  {kelas.find(k=>k.id===selectedKelas)?.nama_kelas} — {new Date(tanggal).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                </span>
                <div style={{ display:'flex', gap:8, fontSize:'0.75rem' }}>
                  {(['H','S','I','A'] as AbsenStatus[]).map(s => <span key={s} style={{ padding:'2px 8px', borderRadius:4, background:statusBg[s], color:statusColor[s], fontWeight:600 }}>{s}={statusLabel[s]}</span>)}
                </div>
              </div>
              <table className="data-table">
                <thead><tr><th>No</th><th>Nama Siswa</th><th style={{ textAlign:'center' }}>Status Kehadiran</th></tr></thead>
                <tbody>
                  {siswaList.length === 0 ? <tr><td colSpan={3} style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Tidak ada siswa di kelas ini</td></tr>
                    : siswaList.map((s,i) => (
                    <tr key={s.id}>
                      <td style={{ color:'#9ca3af', width:40 }}>{i+1}</td>
                      <td style={{ fontWeight:600 }}>{s.nama}</td>
                      <td><div style={{ display:'flex', gap:6, justifyContent:'center' }}>
                        {(['H','S','I','A'] as AbsenStatus[]).map(st => (
                          <button key={st} onClick={()=>toggle(s.id,st)} style={btnStyle(st, absenMap[s.id]===st)}>{st}</button>
                        ))}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            {saved && <div style={{ display:'flex', alignItems:'center', gap:6, color:'#166534', fontSize:'0.875rem', fontWeight:600 }}><CheckCircle size={16}/> Tersimpan!</div>}
            <button onClick={handleSave} className="btn-primary" disabled={saving || siswaList.length===0}>
              <Save size={16}/> {saving?'Menyimpan...':'Simpan Absensi'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
