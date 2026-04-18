'use client'
import { useState, useRef } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { FileUp, Download, CheckCircle2, AlertCircle, Loader2, GraduationCap, Users } from 'lucide-react'

type ImportType = 'siswa' | 'guru'

interface ImportResult { success: number; errors: string[] }

export default function ImportPage() {
  const [type, setType] = useState<ImportType>('siswa')
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File|null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [result, setResult] = useState<ImportResult|null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const parseExcel = async (f: File) => {
    const XLSX = await import('xlsx')
    const buf = await f.arrayBuffer()
    const wb = XLSX.read(buf)
    const ws = wb.Sheets[wb.SheetNames[0]]
    return XLSX.utils.sheet_to_json(ws, { defval: '' })
  }

  const handleFile = async (f: File) => {
    setFile(f); setResult(null)
    try {
      const rows = await parseExcel(f)
      setPreview((rows as any[]).slice(0, 5))
    } catch { setPreview([]) }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const downloadTemplate = () => {
    const headers = type === 'siswa'
      ? ['nama','nisn','nik','jenis_kelamin','tempat_lahir','tanggal_lahir','alamat','tahun_masuk','status']
      : ['nama','nip','jenis_kelamin','jabatan','status_kepegawaian','email','phone','tempat_lahir','tanggal_lahir']
    // Create simple CSV template
    const csv = [headers.join(','), headers.map(()=>'').join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `template_${type}.csv`; a.click()
  }

  const doImport = async () => {
    if (!file) return
    setLoading(true); setResult(null)
    const rows: any[] = await parseExcel(file)
    const errors: string[] = []
    let success = 0

    const table = type === 'siswa' ? 'siswa' : 'guru'
    const chunks: any[][] = []
    for (let i = 0; i < rows.length; i += 50) chunks.push(rows.slice(i, i + 50))

    for (const chunk of chunks) {
      const clean = chunk.map((r: any, idx: number) => {
        if (!r.nama) { errors.push(`Baris ${idx + 1}: nama kosong`); return null }
        const out: any = { ...r }
        if (type === 'siswa') {
          out.status = r.status || 'aktif'
          out.jenis_kelamin = (r.jenis_kelamin || 'L').toString().toUpperCase().charAt(0)
        }
        if (type === 'guru') {
          out.status_kepegawaian = r.status_kepegawaian || 'GTT'
          out.jenis_kelamin = (r.jenis_kelamin || 'L').toString().toUpperCase().charAt(0)
        }
        return out
      }).filter(Boolean)

      const { error, data } = await supabaseAdmin.from(table).insert(clean)
      if (error) errors.push(error.message)
      else success += clean.length
    }

    setResult({ success, errors }); setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Import Data Excel</h1>
        <p className="page-subtitle">Upload file Excel/CSV untuk import data siswa atau guru secara massal</p>
      </div>

      {/* Type selector */}
      <div className="flex gap-3 mb-6">
        {[{v:'siswa',icon:GraduationCap,l:'Import Siswa'},{v:'guru',icon:Users,l:'Import Guru'}].map(opt=>(
          <button key={opt.v} onClick={()=>{setType(opt.v as ImportType);setFile(null);setPreview([]);setResult(null)}}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 transition ${type===opt.v?'border-emerald-700 bg-emerald-700 text-white':'border-gray-200 text-gray-600 hover:border-emerald-300'}`}>
            <opt.icon size={16}/>{opt.l}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="card card-pad mb-5 bg-emerald-50 border-emerald-200">
        <h3 className="font-bold text-emerald-800 mb-2 text-sm">📋 Petunjuk Import {type === 'siswa' ? 'Siswa' : 'Guru'}</h3>
        <ol className="text-sm text-emerald-700 space-y-1 list-decimal list-inside">
          <li>Download template Excel di bawah</li>
          <li>Isi data sesuai format kolom yang tersedia</li>
          <li>Kolom <strong>nama</strong> {type==='siswa'?'dan <strong>nik</strong>':''} wajib diisi</li>
          <li>Untuk jenis_kelamin: gunakan <strong>L</strong> atau <strong>P</strong></li>
          {type==='siswa'&&<li>Status: aktif / lulus / keluar</li>}
          {type==='guru'&&<li>status_kepegawaian: PNS / GTT / PTT</li>}
          <li>Upload file dan klik Mulai Import</li>
        </ol>
        <button onClick={downloadTemplate} className="btn btn-secondary mt-3">
          <Download size={15}/>Download Template {type.charAt(0).toUpperCase()+type.slice(1)}
        </button>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition mb-5
          ${dragging?'border-emerald-500 bg-emerald-50':'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}`}
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        onDrop={handleDrop}
        onClick={()=>inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
        {file ? (
          <div>
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileUp size={24} className="text-emerald-600"/>
            </div>
            <p className="font-bold text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-400 mt-1">{(file.size/1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileUp size={24} className="text-gray-400"/>
            </div>
            <p className="font-semibold text-gray-600">Drag & drop file Excel/CSV di sini</p>
            <p className="text-sm text-gray-400 mt-1">atau klik untuk memilih file</p>
            <p className="text-xs text-gray-300 mt-2">Mendukung: .xlsx, .xls, .csv</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="card overflow-hidden mb-5">
          <div className="p-4 border-b bg-gray-50">
            <p className="font-semibold text-gray-700 text-sm">Preview Data (5 baris pertama)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table text-xs">
              <thead><tr>{Object.keys(preview[0]).map(k=><th key={k}>{k}</th>)}</tr></thead>
              <tbody>{preview.map((row,i)=>(
                <tr key={i}>{Object.values(row).map((v:any,j)=><td key={j}>{String(v)}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action */}
      {file && (
        <button onClick={doImport} disabled={loading} className="btn btn-primary px-8 py-2.5">
          {loading?<><Loader2 size={16} className="animate-spin"/>Mengimport...</>:<><FileUp size={16}/>Mulai Import</>}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0"/>
            <p className="font-semibold text-emerald-800">{result.success} data berhasil diimport</p>
          </div>
          {result.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-red-600"/><p className="font-semibold text-red-700 text-sm">{result.errors.length} error:</p>
              </div>
              {result.errors.slice(0,10).map((e,i)=><p key={i} className="text-xs text-red-600">• {e}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
