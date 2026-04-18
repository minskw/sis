export type Role = 'admin' | 'guru' | 'ortu'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  avatar_url?: string
  phone?: string
  created_at: string
}

export interface Siswa {
  id: string
  nisn: string
  nik?: string
  nama: string
  jenis_kelamin: 'L' | 'P'
  tempat_lahir?: string
  tanggal_lahir?: string
  alamat?: string
  kelas_id?: string
  status: 'aktif' | 'nonaktif' | 'lulus' | 'pindah'
  foto_url?: string
  created_at: string
  kelas?: Kelas
}

export interface Guru {
  id: string
  nip?: string
  nama: string
  jenis_kelamin: 'L' | 'P'
  tempat_lahir?: string
  tanggal_lahir?: string
  alamat?: string
  jabatan?: string
  mapel?: string
  status_kepegawaian: 'PNS' | 'GTT' | 'PTT' | 'P3K'
  no_hp?: string
  email?: string
  foto_url?: string
  user_id?: string
  created_at: string
}

export interface Kelas {
  id: string
  nama_kelas: string
  tingkat: number
  wali_kelas_id?: string
  tahun_ajaran: string
  created_at: string
  wali_kelas?: Guru
}

export interface Absensi {
  id: string
  siswa_id: string
  kelas_id: string
  tanggal: string
  status: 'H' | 'S' | 'I' | 'A'
  keterangan?: string
  dibuat_oleh: string
  created_at: string
  siswa?: Siswa
}

export interface Nilai {
  id: string
  siswa_id: string
  kelas_id: string
  mapel: string
  semester: '1' | '2'
  tahun_ajaran: string
  nilai_uts?: number
  nilai_uas?: number
  nilai_tugas?: number
  nilai_harian?: number
  nilai_akhir?: number
  predikat?: string
  dibuat_oleh: string
  created_at: string
  siswa?: Siswa
}

export interface Izin {
  id: string
  siswa_id: string
  ortu_id: string
  tanggal_mulai: string
  tanggal_selesai: string
  jenis: 'sakit' | 'izin' | 'dispensasi'
  keterangan: string
  status: 'pending' | 'disetujui' | 'ditolak'
  diproses_oleh?: string
  created_at: string
  siswa?: Siswa
}

export interface WaliSiswa {
  id: string
  user_id: string
  siswa_id: string
  hubungan: 'ayah' | 'ibu' | 'wali'
  created_at: string
  siswa?: Siswa
}

export interface Pengumuman {
  id: string
  judul: string
  isi: string
  kategori: string
  target_role: 'semua' | 'guru' | 'ortu'
  dibuat_oleh: string
  tanggal: string
  created_at: string
}

export interface PpdbPendaftaran {
  id: string
  nama_siswa: string
  nisn?: string
  nik?: string
  tempat_lahir?: string
  tanggal_lahir?: string
  jenis_kelamin: 'L' | 'P'
  alamat?: string
  nama_ayah?: string
  nama_ibu?: string
  nama_wali?: string
  no_hp: string
  email?: string
  status: 'pending' | 'diterima' | 'ditolak'
  catatan?: string
  created_at: string
}
