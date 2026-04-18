'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import SearchBar from '@/components/ui/SearchBar'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { School, CheckCircle2, XCircle, Eye } from 'lucide-react'

export default function AdminPPDBPage() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [catatan, setCatatan] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const { data: d } = await supabaseAdmin.from('ppdb').select('*').order('created_at', { ascending: false })
    setData(d || []); setLoading(false)
  }
  useEffect(() => { fetch() }, [])

  const filtered = data.filter(p => {
    const m = p.nama_siswa.toLowerCase().includes(search.toLowerCase()) || p.nama_ortu?.toLowerCase().includes(search.toLowerCase())
    const s = statusFilter ? p.status === statusFilter : true
    return m && s
  })

  const handleAction = async (id: string, status: 'diterima'|'ditolak') => {
    setProcessing(true)
    await supabaseAdmin.from('ppdb').update({ status, catatan_admin: catatan }).eq('id', id)
    if (status === 'diterima') {
      const item = data.find(d => d.id === id)
      if (item) {
        await supabaseAdmin.from('siswa').insert([{
          nama: item.nama_siswa, nik: item.nik, nisn: item.nisn,
          tempat_lahir: item.tempat_lahir, tanggal_lahir: item.tanggal_lahir,
          jenis_kelamin: item.jenis_kelamin, alamat: item.alamat,
          tahun_masuk: new Date().getFullYear(), status: 'aktif'
        }])
      }
    }
    await fetch(); setSelected(null); setProcessing(false)
  }

  const statusColor = (s: string) => s==='pending'?'badge-yellow':s==='diterima'?'badge-green':'badge-red'

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">PPDB Online</h1><p className="page-subtitle">Kelola penerimaan peserta didik baru</p></div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[['Semua',data.length,'text-gray-800'],['Pending',data.filter(d=>d.status==='pending').length,'text-yellow-600'],['Diterima',data.filter(d=>d.status==='diterima').length,'text-emerald-600']].map(([l,v,c])=>(
          <div key={l as string} className="card card-pad text-center">
            <p className={`text-2xl font-extrabold ${c}`}>{v}</p>
            <p className="text-xs text-gray-500 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="w-64"><SearchBar value={search} onChange={setSearch} placeholder="Cari nama siswa / ortu..."/></div>
        <select className="form-input w-auto" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="pending">Pending</option><option value="diterima">Diterima</option><option value="ditolak">Ditolak</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Nama Siswa</th><th>Orang Tua</th><th>Tgl Lahir</th><th>L/P</th><th>Tgl Daftar</th><th>Status</th><th>Aksi</th>
            </tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={7} className="text-center py-10 text-gray-400">Memuat...</td></tr>)
              :filtered.length===0?(<tr><td colSpan={7}><EmptyState icon={School} title="Belum ada pendaftar"/></td></tr>)
              :filtered.map(p=>(
                <tr key={p.id}>
                  <td><p className="font-semibold">{p.nama_siswa}</p><p className="text-xs text-gray-400">{p.nik}</p></td>
                  <td><p className="text-sm">{p.nama_ortu}</p><p className="text-xs text-gray-400">{p.phone_ortu}</p></td>
                  <td className="text-sm text-gray-600">{p.tanggal_lahir}</td>
                  <td><span className={`badge ${p.jenis_kelamin==='L'?'badge-blue':'bg-pink-100 text-pink-700'}`}>{p.jenis_kelamin}</span></td>
                  <td className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                  <td><span className={`badge ${statusColor(p.status)}`}>{p.status}</span></td>
                  <td>
                    <button onClick={()=>{setSelected(p);setCatatan('')}} className="btn btn-secondary btn-sm">
                      <Eye size={14}/>Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title="Detail Pendaftaran PPDB" size="lg">
        {selected && (
          <div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5">
              {[['Nama Siswa',selected.nama_siswa],['NIK',selected.nik],['NISN',selected.nisn||'-'],['Tempat Lahir',selected.tempat_lahir],['Tanggal Lahir',selected.tanggal_lahir],['Jenis Kelamin',selected.jenis_kelamin==='L'?'Laki-laki':'Perempuan'],['Alamat',selected.alamat],['Nama Orang Tua',selected.nama_ortu],['No. HP',selected.phone_ortu],['Email',selected.email_ortu||'-'],['Sekolah Asal',selected.sekolah_asal||'-'],['Tgl Daftar',new Date(selected.created_at).toLocaleDateString('id-ID')]].map(([l,v])=>(
                <div key={l as string}><p className="text-xs text-gray-400 font-medium">{l}</p><p className="font-semibold text-gray-800">{v}</p></div>
              ))}
            </div>
            {selected.status === 'pending' && (
              <div className="border-t pt-4">
                <label className="form-label">Catatan Admin (opsional)</label>
                <textarea className="form-input mb-4" rows={2} value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Tambahkan catatan..."/>
                <div className="flex gap-3">
                  <button onClick={()=>handleAction(selected.id,'diterima')} disabled={processing}
                    className="btn btn-primary flex-1 justify-center">
                    <CheckCircle2 size={16}/>Terima & Masukkan ke Data Siswa
                  </button>
                  <button onClick={()=>handleAction(selected.id,'ditolak')} disabled={processing}
                    className="btn btn-danger flex-1 justify-center">
                    <XCircle size={16}/>Tolak
                  </button>
                </div>
              </div>
            )}
            {selected.status !== 'pending' && (
              <div className={`mt-3 p-3 rounded-xl text-sm font-semibold ${selected.status==='diterima'?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-700'}`}>
                Status: {selected.status.toUpperCase()}{selected.catatan_admin?` — ${selected.catatan_admin}`:''}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
