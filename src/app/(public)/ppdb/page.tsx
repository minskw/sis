'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GraduationCap, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PPDBPublicPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState<any>(null)
  const [form, setForm] = useState<any>({
    nama_siswa:'',nik:'',nisn:'',tempat_lahir:'',tanggal_lahir:'',
    jenis_kelamin:'L',alamat:'',nama_ortu:'',phone_ortu:'',email_ortu:'',sekolah_asal:''
  })

  const f = (k: string) => (e: React.ChangeEvent<any>) => setForm((p: any)=>({...p,[k]:e.target.value}))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.from('ppdb').insert([{ ...form, status:'pending' }]).select().single()
    if (!error) setSubmitted(data)
    else alert('Gagal mendaftar: ' + error.message)
    setLoading(false)
  }

  if (submitted) return (
    <div className="max-w-lg mx-auto py-16 text-center px-5">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={40} className="text-emerald-600"/>
      </div>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Pendaftaran Berhasil!</h2>
      <p className="text-gray-500 mb-6">Nomor pendaftaran Anda: <strong className="text-emerald-700">{submitted.id.slice(0,8).toUpperCase()}</strong></p>
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left mb-6">
        <p className="text-sm font-semibold text-emerald-800 mb-3">Detail Pendaftaran:</p>
        {[['Nama Siswa',submitted.nama_siswa],['NIK',submitted.nik],['Orang Tua',submitted.nama_ortu],['No. HP',submitted.phone_ortu]].map(([l,v])=>(
          <div key={l as string} className="flex justify-between text-sm py-1.5 border-b border-emerald-100 last:border-0">
            <span className="text-gray-500">{l}</span><span className="font-semibold text-gray-800">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-400 mb-4">Pengumuman hasil seleksi akan disampaikan melalui website ini dan dihubungi via nomor HP yang terdaftar.</p>
      <Link href="/beranda" className="btn btn-primary"><ArrowLeft size={16}/>Kembali ke Beranda</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto py-10 px-5">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <GraduationCap size={28} className="text-emerald-700"/>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800">Formulir PPDB Online</h1>
        <p className="text-gray-500 text-sm mt-1">MIN Singkawang — Tahun Ajaran 2025/2026</p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="p-5 border-b bg-emerald-50">
          <p className="font-bold text-emerald-800">Data Calon Siswa</p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Nama Lengkap Siswa *</label>
            <input className="form-input" required value={form.nama_siswa} onChange={f('nama_siswa')}/>
          </div>
          <div><label className="form-label">NIK (16 digit) *</label>
            <input className="form-input" required maxLength={16} value={form.nik} onChange={f('nik')}/></div>
          <div><label className="form-label">NISN (jika ada)</label>
            <input className="form-input" maxLength={10} value={form.nisn} onChange={f('nisn')}/></div>
          <div><label className="form-label">Tempat Lahir *</label>
            <input className="form-input" required value={form.tempat_lahir} onChange={f('tempat_lahir')}/></div>
          <div><label className="form-label">Tanggal Lahir *</label>
            <input className="form-input" type="date" required value={form.tanggal_lahir} onChange={f('tanggal_lahir')}/></div>
          <div><label className="form-label">Jenis Kelamin</label>
            <select className="form-input" value={form.jenis_kelamin} onChange={f('jenis_kelamin')}>
              <option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
          <div><label className="form-label">Asal TK/RA</label>
            <input className="form-input" value={form.sekolah_asal} onChange={f('sekolah_asal')}/></div>
          <div className="md:col-span-2"><label className="form-label">Alamat Lengkap *</label>
            <textarea className="form-input" rows={2} required value={form.alamat} onChange={f('alamat')}/></div>
        </div>

        <div className="p-5 border-t bg-gray-50 border-b">
          <p className="font-bold text-gray-700">Data Orang Tua / Wali</p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="form-label">Nama Orang Tua/Wali *</label>
            <input className="form-input" required value={form.nama_ortu} onChange={f('nama_ortu')}/></div>
          <div><label className="form-label">No. HP/WhatsApp *</label>
            <input className="form-input" required type="tel" value={form.phone_ortu} onChange={f('phone_ortu')}/></div>
          <div className="md:col-span-2"><label className="form-label">Email (opsional)</label>
            <input className="form-input" type="email" value={form.email_ortu} onChange={f('email_ortu')}/></div>
        </div>

        <div className="p-5 border-t">
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3">
            {loading?'Mengirim...':'Kirim Pendaftaran'}
          </button>
        </div>
      </form>
    </div>
  )
}
