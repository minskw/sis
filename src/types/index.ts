export type Role = 'admin' | 'guru' | 'ortu'
export interface Profile { id:string; user_id:string; full_name:string; role:Role; phone?:string; created_at:string }
export interface Siswa { id:string; nisn?:string; nik?:string; nama:string; jenis_kelamin:'L'|'P'; tempat_lahir?:string; tanggal_lahir?:string; alamat?:string; kelas_id?:string; tahun_masuk?:number; status:'aktif'|'lulus'|'keluar'; foto_url?:string; created_at:string; kelas?:Kelas }
export interface Guru { id:string; nip?:string; nama:string; jenis_kelamin?:'L'|'P'; email?:string; phone?:string; jabatan?:string; status_kepegawaian:'PNS'|'GTT'|'PTT'; user_id?:string; created_at:string }
export interface Kelas { id:string; nama:string; tingkat:number; tahun_ajaran:string; wali_kelas_id?:string; ruang?:string; kapasitas?:number; wali_kelas?:Guru }
export interface MataPelajaran { id:string; nama:string; kode?:string; kkm:number }
export interface Nilai { id:string; siswa_id:string; mapel_id:string; kelas_id:string; semester:1|2; tahun_ajaran:string; nilai_tugas?:number; nilai_uts?:number; nilai_uas?:number; nilai_akhir?:number; guru_id?:string; created_at:string; siswa?:Siswa; mapel?:MataPelajaran }
export interface Absensi { id:string; siswa_id:string; kelas_id:string; tanggal:string; status:'H'|'S'|'I'|'A'; keterangan?:string; guru_id?:string; created_at:string; siswa?:Siswa }
export interface Izin { id:string; siswa_id:string; user_id:string; tanggal_mulai:string; tanggal_selesai:string; jenis:'sakit'|'izin'|'lainnya'; keterangan:string; status:'pending'|'disetujui'|'ditolak'; created_at:string; siswa?:Siswa }
export interface Pengumuman { id:string; judul:string; isi:string; kategori:string; target_role:'all'|'guru'|'ortu'; is_published:boolean; created_at:string }
export interface PPDBRegistration { id:string; user_id?:string; nama_siswa:string; nik:string; nisn?:string; tempat_lahir:string; tanggal_lahir:string; jenis_kelamin:'L'|'P'; alamat?:string; nama_ortu:string; phone_ortu:string; email_ortu?:string; sekolah_asal?:string; status:'pending'|'diterima'|'ditolak'; catatan_admin?:string; created_at:string }
export interface OrangTuaSiswa { id:string; user_id:string; siswa_id:string; hubungan:'ayah'|'ibu'|'wali'; siswa?:Siswa }
