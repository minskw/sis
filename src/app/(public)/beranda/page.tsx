import Link from 'next/link'
import { GraduationCap, Users, BookOpen, Award, Phone, MapPin, Mail, ArrowRight, CheckCircle2, Calendar } from 'lucide-react'

const stats=[
  {icon:GraduationCap,val:'312+',label:'Siswa Aktif',color:'bg-emerald-100 text-emerald-700'},
  {icon:Users,val:'24',label:'Guru & Staff',color:'bg-blue-100 text-blue-700'},
  {icon:BookOpen,val:'12',label:'Rombel',color:'bg-orange-100 text-orange-700'},
  {icon:Award,val:'A',label:'Akreditasi',color:'bg-yellow-100 text-yellow-700'},
]

const pengumuman=[
  {tgl:'15 Apr',judul:'Jadwal UAS Semester Genap 2024/2025',kat:'Akademik'},
  {tgl:'10 Apr',judul:'PPDB Tahun Ajaran 2025/2026 Dibuka',kat:'PPDB'},
  {tgl:'5 Apr', judul:'Libur Hari Raya Idul Fitri 1446 H',kat:'Umum'},
  {tgl:'1 Apr', judul:'Kegiatan Pesantren Kilat Ramadan',kat:'Keagamaan'},
]

const ekskul=['Pramuka','Tahfidz Qur\'an','Kaligrafi','Futsal','Bulu Tangkis','Seni Tari','Olimpiade MIPA','English Club','PMR','Drumband']

export default function BerandaPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 60%), radial-gradient(circle at 80% 20%, #059669 0%, transparent 50%)'}}/>
        <div className="max-w-7xl mx-auto px-5 relative">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-white/20">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
                Kementerian Agama RI
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                Madrasah Ibtidaiyah<br/><span className="text-emerald-300">Negeri Singkawang</span>
              </h1>
              <p className="text-emerald-100 text-lg mb-8 max-w-lg">
                Mendidik generasi Islami yang unggul dalam prestasi, berakhlak mulia, dan berwawasan global.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/beranda#ppdb" className="btn bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-3">
                  <GraduationCap size={18}/>Daftar PPDB
                </Link>
                <Link href="/login" className="btn border border-white/40 text-white hover:bg-white/10 px-6 py-3">
                  Masuk Portal<ArrowRight size={18}/>
                </Link>
              </div>
            </div>
            <div className="shrink-0">
              <img src="https://dki.kemenag.go.id/storage/files/logo-kemenag-png-1png.png" alt="Logo" className="h-44 w-auto drop-shadow-2xl"/>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map(s=>(
              <div key={s.label} className="text-center card-hover p-5 rounded-2xl border border-gray-100">
                <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <s.icon size={22}/>
                </div>
                <p className="text-3xl font-extrabold text-gray-800">{s.val}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content grid */}
      <section className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pengumuman */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5" id="pengumuman">
              <h2 className="text-xl font-extrabold text-emerald-900">Pengumuman Terbaru</h2>
              <Link href="/login" className="text-sm text-emerald-600 font-semibold hover:underline flex items-center gap-1">Lihat Semua<ArrowRight size={14}/></Link>
            </div>
            <div className="space-y-3">
              {pengumuman.map((p,i)=>(
                <div key={i} className="flex gap-4 bg-white border rounded-xl p-4 card-hover">
                  <div className="bg-emerald-50 text-emerald-800 rounded-xl w-14 text-center py-2 shrink-0">
                    <p className="font-extrabold text-lg leading-tight">{p.tgl.split(' ')[0]}</p>
                    <p className="text-xs">{p.tgl.split(' ')[1]}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{p.judul}</p>
                    <span className="badge badge-green text-[10px] mt-1">{p.kat}</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 self-center"/>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-6">
            {/* Kontak */}
            <div className="bg-emerald-800 text-white rounded-2xl p-5">
              <h3 className="font-bold mb-4 text-emerald-200 text-sm uppercase tracking-wider">Kontak Sekolah</h3>
              {[
                [MapPin,'Jl. Contoh No.1, Singkawang Tengah, Kalimantan Barat 79100'],
                [Phone,'(0562) 123-456'],
                [Mail,'min.singkawang@kemenag.go.id'],
              ].map(([Icon, text],i)=>(
                <div key={i} className="flex gap-3 mb-3 last:mb-0">
                  <div className="w-7 h-7 bg-emerald-700 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={13}/>
                  </div>
                  <p className="text-emerald-100 text-xs leading-relaxed">{text as string}</p>
                </div>
              ))}
            </div>

            {/* Ekskul */}
            <div className="bg-white border rounded-2xl p-5">
              <h3 className="font-bold text-emerald-900 mb-3">Ekstrakurikuler</h3>
              <div className="flex flex-wrap gap-1.5">
                {ekskul.map(e=><span key={e} className="badge badge-green text-[11px]">{e}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi Misi */}
      <section className="bg-emerald-50 border-y border-emerald-100 py-14" id="profil">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-emerald-900">Visi & Misi</h2>
            <p className="text-gray-500 text-sm mt-1">MIN Singkawang</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
              <h3 className="font-bold text-emerald-800 mb-3 text-base">🎯 Visi</h3>
              <p className="text-gray-600 italic leading-relaxed text-sm">"Terwujudnya madrasah yang unggul dalam prestasi, berkarakter Islami, dan berwawasan lingkungan."</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
              <h3 className="font-bold text-emerald-800 mb-3 text-base">📌 Misi</h3>
              <ul className="space-y-2">
                {['Pembelajaran inovatif dan berkualitas','Pembentukan akhlakul karimah','Pengembangan potensi melalui ekskul','Peningkatan kompetensi pendidik','Lingkungan bersih dan kondusif'].map((m,i)=>(
                  <li key={i} className="flex gap-2 text-sm text-gray-600"><CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5"/>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PPDB CTA */}
      <section className="max-w-7xl mx-auto px-5 py-14" id="ppdb">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
          <GraduationCap size={48} className="mx-auto mb-4 text-emerald-300"/>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">PPDB Online 2025/2026</h2>
          <p className="text-emerald-100 mb-6 max-w-lg mx-auto">Daftarkan putra/putri Anda sekarang. Pendaftaran dilakukan secara online, mudah dan cepat.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn bg-white text-emerald-800 hover:bg-emerald-50 px-8 py-3 text-base">
              <GraduationCap size={18}/>Daftar Sekarang
            </Link>
            <Link href="/login" className="btn border border-white/40 text-white hover:bg-white/10 px-8 py-3 text-base">
              Cek Status Pendaftaran
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-emerald-200">
            {[['Buka Pendaftaran','1 Juni 2025'],['Pengumuman','15 Juli 2025'],['Daftar Ulang','16-20 Juli']].map(([label,val])=>(
              <div key={label} className="text-center">
                <p className="font-bold text-white">{val}</p>
                <p className="text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
