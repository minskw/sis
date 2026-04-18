'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'
import EmptyState from '@/components/ui/EmptyState'
import { Calendar } from 'lucide-react'

const HARI = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
const COLORS = ['bg-emerald-100 text-emerald-800','bg-blue-100 text-blue-800','bg-purple-100 text-purple-800','bg-orange-100 text-orange-800','bg-teal-100 text-teal-800','bg-pink-100 text-pink-800','bg-indigo-100 text-indigo-800']

export default function GuruJadwalPage() {
  const { profile } = useProfile()
  const [jadwal, setJadwal] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const fetch = async () => {
      const { data: g } = await supabase.from('guru').select('id').eq('user_id', profile.user_id).single()
      if (!g) { setLoading(false); return }
      const { data } = await supabase.from('jadwal_pelajaran')
        .select('*, mapel:mata_pelajaran(nama), kelas(nama)')
        .eq('guru_id', g.id).order('hari').order('jam_mulai')
      setJadwal(data||[]); setLoading(false)
    }
    fetch()
  }, [profile])

  const mapelColors: Record<string,string> = {}
  ;[...new Set(jadwal.map(j=>j.mapel?.nama))].forEach((m,i) => { mapelColors[m as string] = COLORS[i%COLORS.length] })

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Jadwal Saya</h1><p className="page-subtitle">Jadwal mengajar mingguan</p></div>
      {loading?<p className="text-gray-400 text-center py-10">Memuat...</p>
      :jadwal.length===0?<EmptyState icon={Calendar} title="Belum ada jadwal" desc="Hubungi admin untuk mengatur jadwal mengajar Anda"/>
      :(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HARI.map(hari=>{
            const items = jadwal.filter(j=>j.hari===hari)
            if (!items.length) return null
            return (
              <div key={hari} className="card overflow-hidden">
                <div className="bg-emerald-700 text-white px-4 py-2.5 font-bold text-sm">{hari}</div>
                {items.map(j=>(
                  <div key={j.id} className="px-4 py-3 border-b last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">{j.jam_mulai}–{j.jam_selesai}</span>
                    </div>
                    <span className={`badge text-xs ${mapelColors[j.mapel?.nama]||'badge-gray'}`}>{j.mapel?.nama}</span>
                    <p className="text-xs text-gray-500 mt-1">{j.kelas?.nama}</p>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
