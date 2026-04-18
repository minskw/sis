'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        const { data } = await supabase.from('profiles').select('role').eq('user_id', (await supabase.auth.getUser()).data.user?.id).single()
        const role = data?.role || 'ortu'
        router.push(role === 'admin' ? '/admin' : role === 'guru' ? '/guru' : '/ortu')
      } else {
        const { error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, role: 'ortu' } }
        })
        if (err) throw err
        setError('Akun berhasil dibuat! Silakan login.')
        setMode('login')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-800 px-8 py-7 text-center">
          <img src="https://dki.kemenag.go.id/storage/files/logo-kemenag-png-1png.png" alt="Logo" className="h-16 w-auto mx-auto mb-3"/>
          <h1 className="text-white font-extrabold text-xl">MIN Singkawang</h1>
          <p className="text-emerald-300 text-sm mt-0.5">Sistem Informasi Sekolah</p>
        </div>
        {/* Form */}
        <div className="px-8 py-7">
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            {['login','register'].map(m=>(
              <button key={m} onClick={()=>{setMode(m as any);setError('')}}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode===m?'bg-white text-emerald-800 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
                {m==='login'?'Masuk':'Daftar Akun'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode==='register'&&(
              <div>
                <label className="form-label">Nama Lengkap</label>
                <input className="form-input" type="text" required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nama lengkap Anda"/>
              </div>
            )}
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@contoh.com"/>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input className="form-input pr-10" type={showPw?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            {error&&<p className={`text-sm px-3 py-2 rounded-lg ${error.includes('berhasil')?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-600'}`}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5 mt-2">
              {mode==='login'?<LogIn size={16}/>:<UserPlus size={16}/>}
              {loading?'Memproses...':(mode==='login'?'Masuk':'Daftar')}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-5">
            Khusus untuk <strong>Admin</strong> & <strong>Guru</strong>: akun dibuat oleh administrator sekolah.
          </p>
        </div>
      </div>
      <p className="text-center text-emerald-200 text-xs mt-4">© 2025 MIN Singkawang — Kemenag RI</p>
    </div>
  )
}
