'use client'
import { useState } from 'react'

const JADWAL: Record<string, Record<string,string[]>> = {
  'Kelas 5A': {
    'Senin':    ['Upacara','Matematika','Matematika','Bahasa Indonesia','Bahasa Indonesia','IPA','IPA'],
    'Selasa':   ['Bahasa Arab','Bahasa Arab','Qur\'an Hadits','Qur\'an Hadits','IPS','IPS','SBdP'],
    'Rabu':     ['PKn','PKn','Matematika','Matematika','Bahasa Indonesia','Fiqih','Fiqih'],
    'Kamis':    ['IPA','IPA','Bahasa Inggris','Bahasa Inggris','Aqidah Akhlak','Aqidah Akhlak','SKI'],
    'Jumat':    ['PJOK','PJOK','PJOK','Matematika','IPS','',''],
    'Sabtu':    ['SBdP','SBdP','Bahasa Indonesia','PKn','Ekstra','Ekstra',''],
  }
}

const JAM = ['07.00–07.45','07.45–08.30','08.30–09.15','09.15–10.00','10.15–11.00','11.00–11.45','11.45–12.30']
const HARI = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
const MAPEL_COLOR: Record<string,string> = {
  'Matematika':'bg-blue-100 text-blue-800','Bahasa Indonesia':'bg-emerald-100 text-emerald-800',
  'IPA':'bg-teal-100 text-teal-800','IPS':'bg-cyan-100 text-cyan-800',
  'PKn':'bg-red-100 text-red-800','Bahasa Arab':'bg-amber-100 text-amber-800',
  "Qur'an Hadits":'bg-yellow-100 text-yellow-800','Fiqih':'bg-orange-100 text-orange-800',
  'Aqidah Akhlak':'bg-purple-100 text-purple-800','SKI':'bg-pink-100 text-pink-800',
  'PJOK':'bg-lime-100 text-lime-800','SBdP':'bg-violet-100 text-violet-800',
  'Bahasa Inggris':'bg-indigo-100 text-indigo-800','Ekstra':'bg-gray-100 text-gray-700',
  'Upacara':'bg-red-200 text-red-900',
}

export default function JadwalPage() {
  const [kelas, setKelas] = useState('Kelas 5A')
  const jadwal = JADWAL['Kelas 5A']

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-emerald-900">🗓️ Jadwal Pelajaran</h1>
        <p className="text-sm text-gray-500">Jadwal pelajaran mingguan per kelas</p>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        {Object.keys(JADWAL).concat(['Kelas 1A','Kelas 2A','Kelas 3A','Kelas 4A','Kelas 6A']).map(k=>(
          <button key={k} onClick={()=>setKelas(k)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${kelas===k?'bg-emerald-700 text-white':'bg-white border text-gray-600 hover:bg-emerald-50'}`}>{k}</button>
        ))}
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-emerald-800 text-white">
            <tr>
              <th className="p-3 text-left font-semibold w-24">Jam ke-</th>
              {HARI.map(h=><th key={h} className="p-3 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {JAM.map((jam, i) => (
              <tr key={jam} className="border-b last:border-0">
                <td className="p-2 bg-emerald-50 text-center">
                  <p className="font-bold text-emerald-800">{i+1}</p>
                  <p className="text-emerald-600 text-xs">{jam}</p>
                </td>
                {HARI.map(hari => {
                  const mp = jadwal[hari]?.[i] || ''
                  const color = MAPEL_COLOR[mp] || 'bg-gray-50 text-gray-400'
                  return (
                    <td key={hari} className="p-1.5 text-center">
                      {mp ? (
                        <span className={`inline-block w-full rounded-lg py-1.5 px-1 font-medium ${color}`}>{mp}</span>
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">* Istirahat: 09.15–09.30 dan 11.00–11.15</p>
    </div>
  )
}
