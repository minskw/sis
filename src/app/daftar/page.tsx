'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PPDBPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    student_name: '', nisn: '', nik: '', birth_place: '',
    birth_date: '', gender: 'L', address: '', parent_name: '',
    parent_phone: '', previous_school: ''
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return alert('Silakan login terlebih dahulu')
    setLoading(true)
    const res = await fetch('/api/ppdb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, user_id: user.id, status: 'pending' })
    })
    if (res.ok) {
      alert('✅ Pendaftaran berhasil dikirim! Silakan cek status pendaftaran Anda.')
      router.push('/status')
    } else {
      const err = await res.json()
      alert('Gagal mendaftar: ' + (err.error || 'Unknown error'))
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Login Diperlukan</h2>
        <p className="text-gray-500 mb-6">Anda harus login sebelum mengisi formulir PPDB.</p>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
          Login / Daftar Akun
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-emerald-700 text-white rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-extrabold mb-1">📝 Formulir PPDB SD/MI</h1>
        <p className="text-blue-100 text-sm">Tahun Ajaran 2025/2026 — Isi semua data dengan benar dan lengkap.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
        {/* Data Siswa */}
        <div>
          <h2 className="font-bold text-gray-700 text-base mb-4 border-b pb-2">👦 Data Calon Siswa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Anak <span className="text-red-500">*</span></label>
              <input type="text" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" onChange={set('student_name')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NISN (jika ada)</label>
              <input type="text" maxLength={10} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" onChange={set('nisn')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIK (No. KTP Anak) <span className="text-red-500">*</span></label>
              <input type="text" required maxLength={16} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" onChange={set('nik')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir <span className="text-red-500">*</span></label>
              <input type="text" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" onChange={set('birth_place')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir <span className="text-red-500">*</span></label>
              <input type="date" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" onChange={set('birth_date')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" onChange={set('gender')}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asal Sekolah (TK/RA)</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" onChange={set('previous_school')} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap <span className="text-red-500">*</span></label>
              <textarea required rows={3} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" onChange={set('address')} />
            </div>
          </div>
        </div>

        {/* Data Orang Tua */}
        <div>
          <h2 className="font-bold text-gray-700 text-base mb-4 border-b pb-2">👨‍👩‍👦 Data Orang Tua / Wali</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang Tua/Wali <span className="text-red-500">*</span></label>
              <input type="text" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" onChange={set('parent_name')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. HP/WhatsApp <span className="text-red-500">*</span></label>
              <input type="tel" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" onChange={set('parent_phone')} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold text-base transition"
          >
            {loading ? '⏳ Mengirim...' : '🚀 KIRIM PENDAFTARAN'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            Dengan mengklik kirim, Anda menyetujui data yang diisi adalah benar.
          </p>
        </div>
      </form>
    </div>
  )
}
