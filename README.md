# SISFO MIN Singkawang
## Sistem Informasi Sekolah Terpadu

Stack: **Next.js 15** · **Tailwind CSS v4** · **Supabase** · **TypeScript** · **Lucide Icons**

---

## 🚀 Setup Cepat

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase
1. Buat project baru di [app.supabase.com](https://app.supabase.com)
2. Buka **SQL Editor** dan jalankan seluruh isi file `supabase_schema.sql`
3. Salin URL dan API keys dari **Project Settings > API**

### 3. Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local dan isi nilai Supabase Anda
```

### 4. Jalankan
```bash
npm run dev
# Buka http://localhost:3000
```

---

## 👥 RBAC — Role-Based Access Control

| Role | Akses |
|---|---|
| **Admin** | Semua fitur: data siswa, guru, kelas, PPDB, pengumuman, izin, akun |
| **Guru** | Input absensi & nilai, proses izin, lihat daftar kelas |
| **Ortu/Wali** | Lihat data anak, absensi, nilai (read-only), ajukan izin |

### Cara Buat Akun Admin Pertama
1. Daftar akun baru via `/login` atau Supabase Dashboard > Authentication
2. Jalankan SQL ini di Supabase SQL Editor:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'email-anda@domain.com';
```

### Menghubungkan Akun Ortu ke Data Siswa
```sql
-- Cari user_id ortu dari tabel profiles
-- Cari siswa_id dari tabel siswa
INSERT INTO public.wali_siswa (user_id, siswa_id, hubungan)
VALUES ('uuid-user-ortu', 'uuid-siswa', 'ibu');
```

---

## 📂 Struktur Halaman

```
/ (landing page publik)
/login
/ppdb (form pendaftaran publik)
/status (cek status pendaftaran)
/pengumuman-publik
/profil-sekolah

/portal (layout dengan sidebar, wajib login)
  /portal (dashboard — beda tampilan per role)

  /portal/admin/siswa       → CRUD siswa + Import Excel
  /portal/admin/guru        → CRUD guru + Import Excel
  /portal/admin/kelas       → Manajemen rombel
  /portal/admin/ppdb        → Terima/tolak pendaftaran
  /portal/admin/pengumuman  → Buat pengumuman
  /portal/admin/izin        → Review pengajuan izin
  /portal/admin/akun        → Kelola akun & role

  /portal/guru/absensi → Input absensi H/S/I/A
  /portal/guru/nilai   → Input nilai UTS/UAS/tugas
  /portal/guru/kelas   → Lihat daftar siswa per kelas
  /portal/guru/izin    → Proses pengajuan izin

  /portal/ortu/anak    → Info data anak (read-only)
  /portal/ortu/absensi → Rekap absensi per bulan
  /portal/ortu/nilai   → Nilai per semester
  /portal/ortu/izin    → Ajukan & lihat status izin

  /portal/pengumuman   → Pengumuman (guru & ortu)
```

---

## 📊 Import Excel

### Format Template Siswa
| NISN | Nama | JK | Tempat Lahir | Tanggal Lahir | Alamat |
|---|---|---|---|---|---|
| 0012345678 | Ahmad Fauzan | L | Singkawang | 2015-06-15 | Jl. Contoh |

### Format Template Guru
| NIP | Nama | JK | Jabatan | Mapel | Status | No HP | Email |
|---|---|---|---|---|---|---|---|
| 19850101... | Ahmad, S.Pd | L | Wali Kelas | Matematika | PNS | 0812... | guru@... |

Download template tersedia di panel Admin → Tombol "Template".

---

## 🗄️ Database Tables

| Tabel | Keterangan |
|---|---|
| `profiles` | Akun pengguna + role (auto-sync dari auth.users) |
| `guru` | Data guru dan staff |
| `kelas` | Rombel belajar |
| `siswa` | Data peserta didik |
| `wali_siswa` | Relasi akun ortu ke data siswa |
| `absensi` | Rekap kehadiran harian (unique: siswa+tanggal) |
| `nilai` | Nilai per mapel per semester (unique: siswa+mapel+semester) |
| `izin` | Pengajuan izin dari ortu |
| `pengumuman` | Pengumuman sekolah |
| `ppdb_pendaftaran` | Data pendaftaran PPDB online |
| `jadwal` | Jadwal pelajaran |

---

## 🔒 Security

- Row Level Security (RLS) aktif di semua tabel
- Admin dapat akses semua data
- Guru dapat baca semua siswa, write absensi & nilai
- Ortu hanya dapat lihat data anak yang terhubung ke akun mereka
- PPDB form bisa diakses tanpa login (public insert)
- Service Role key hanya digunakan server-side

---

## 📦 Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di dashboard Vercel:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
```
