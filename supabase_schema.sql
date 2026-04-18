-- ============================================================
-- SISFO MIN SINGKAWANG — SUPABASE DATABASE SCHEMA LENGKAP
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. PROFILES (extends auth.users) ───────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'ortu' CHECK (role IN ('admin','guru','ortu')),
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'ortu')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. GURU ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guru (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nip                  TEXT UNIQUE,
  nama                 TEXT NOT NULL,
  jenis_kelamin        CHAR(1) NOT NULL DEFAULT 'L' CHECK (jenis_kelamin IN ('L','P')),
  tempat_lahir         TEXT,
  tanggal_lahir        DATE,
  alamat               TEXT,
  jabatan              TEXT,
  mapel                TEXT,
  status_kepegawaian   TEXT NOT NULL DEFAULT 'GTT' CHECK (status_kepegawaian IN ('PNS','GTT','PTT','P3K')),
  no_hp                TEXT,
  email                TEXT,
  foto_url             TEXT,
  user_id              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. KELAS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kelas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kelas     TEXT NOT NULL,
  tingkat        INT NOT NULL CHECK (tingkat BETWEEN 1 AND 6),
  wali_kelas_id  UUID REFERENCES public.guru(id) ON DELETE SET NULL,
  tahun_ajaran   TEXT NOT NULL DEFAULT '2024/2025',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(nama_kelas, tahun_ajaran)
);

-- ─── 4. SISWA ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.siswa (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nisn            TEXT NOT NULL,
  nik             TEXT,
  nama            TEXT NOT NULL,
  jenis_kelamin   CHAR(1) NOT NULL DEFAULT 'L' CHECK (jenis_kelamin IN ('L','P')),
  tempat_lahir    TEXT,
  tanggal_lahir   DATE,
  alamat          TEXT,
  kelas_id        UUID REFERENCES public.kelas(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','nonaktif','lulus','pindah')),
  foto_url        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siswa_kelas ON public.siswa(kelas_id);
CREATE INDEX IF NOT EXISTS idx_siswa_status ON public.siswa(status);

-- ─── 5. WALI SISWA (link ortu akun ke siswa) ────────────────
CREATE TABLE IF NOT EXISTS public.wali_siswa (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  siswa_id    UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  hubungan    TEXT NOT NULL DEFAULT 'wali' CHECK (hubungan IN ('ayah','ibu','wali')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, siswa_id)
);

-- ─── 6. ABSENSI ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.absensi (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id     UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  kelas_id     UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  tanggal      DATE NOT NULL,
  status       CHAR(1) NOT NULL CHECK (status IN ('H','S','I','A')),
  keterangan   TEXT,
  dibuat_oleh  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(siswa_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_absensi_siswa ON public.absensi(siswa_id);
CREATE INDEX IF NOT EXISTS idx_absensi_kelas_tgl ON public.absensi(kelas_id, tanggal);

-- ─── 7. NILAI ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nilai (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id      UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  kelas_id      UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  mapel         TEXT NOT NULL,
  semester      TEXT NOT NULL CHECK (semester IN ('1','2')),
  tahun_ajaran  TEXT NOT NULL DEFAULT '2024/2025',
  nilai_uts     NUMERIC(5,2),
  nilai_uas     NUMERIC(5,2),
  nilai_tugas   NUMERIC(5,2),
  nilai_harian  NUMERIC(5,2),
  nilai_akhir   NUMERIC(5,2),
  predikat      CHAR(1),
  dibuat_oleh   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(siswa_id, kelas_id, mapel, semester, tahun_ajaran)
);

CREATE INDEX IF NOT EXISTS idx_nilai_siswa ON public.nilai(siswa_id);
CREATE INDEX IF NOT EXISTS idx_nilai_kelas ON public.nilai(kelas_id, mapel, semester);

-- ─── 8. IZIN ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.izin (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id          UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  ortu_id           UUID NOT NULL REFERENCES auth.users(id),
  tanggal_mulai     DATE NOT NULL,
  tanggal_selesai   DATE NOT NULL,
  jenis             TEXT NOT NULL DEFAULT 'izin' CHECK (jenis IN ('sakit','izin','dispensasi')),
  keterangan        TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','disetujui','ditolak')),
  diproses_oleh     UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  CHECK (tanggal_selesai >= tanggal_mulai)
);

CREATE INDEX IF NOT EXISTS idx_izin_siswa ON public.izin(siswa_id);
CREATE INDEX IF NOT EXISTS idx_izin_status ON public.izin(status);

-- ─── 9. PENGUMUMAN ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pengumuman (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul        TEXT NOT NULL,
  isi          TEXT NOT NULL,
  kategori     TEXT NOT NULL DEFAULT 'Umum',
  target_role  TEXT NOT NULL DEFAULT 'semua' CHECK (target_role IN ('semua','guru','ortu')),
  dibuat_oleh  UUID REFERENCES auth.users(id),
  tanggal      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. PPDB PENDAFTARAN ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ppdb_pendaftaran (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_siswa      TEXT NOT NULL,
  nisn            TEXT,
  nik             TEXT,
  jenis_kelamin   CHAR(1) NOT NULL DEFAULT 'L' CHECK (jenis_kelamin IN ('L','P')),
  tempat_lahir    TEXT,
  tanggal_lahir   DATE,
  alamat          TEXT,
  nama_ayah       TEXT,
  nama_ibu        TEXT,
  nama_wali       TEXT,
  no_hp           TEXT NOT NULL,
  email           TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','diterima','ditolak')),
  catatan         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 11. JADWAL PELAJARAN ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jadwal (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kelas_id    UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  guru_id     UUID REFERENCES public.guru(id) ON DELETE SET NULL,
  mapel       TEXT NOT NULL,
  hari        TEXT NOT NULL CHECK (hari IN ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')),
  jam_mulai   TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guru              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wali_siswa        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absensi           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nilai             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.izin              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengumuman        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppdb_pendaftaran  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal            ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ── PROFILES ────────────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR current_user_role() = 'admin');

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (current_user_role() = 'admin');

-- ── GURU ────────────────────────────────────────────────────
CREATE POLICY "guru_read_authenticated" ON public.guru
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "guru_write_admin" ON public.guru
  FOR ALL USING (current_user_role() = 'admin');

-- ── KELAS ───────────────────────────────────────────────────
CREATE POLICY "kelas_read_authenticated" ON public.kelas
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "kelas_write_admin" ON public.kelas
  FOR ALL USING (current_user_role() = 'admin');

-- ── SISWA ───────────────────────────────────────────────────
-- Admin: full access
CREATE POLICY "siswa_admin_all" ON public.siswa
  FOR ALL USING (current_user_role() = 'admin');

-- Guru: bisa baca semua siswa
CREATE POLICY "siswa_guru_read" ON public.siswa
  FOR SELECT USING (current_user_role() = 'guru');

-- Ortu: hanya bisa lihat anak sendiri
CREATE POLICY "siswa_ortu_read_own" ON public.siswa
  FOR SELECT USING (
    current_user_role() = 'ortu' AND
    id IN (SELECT siswa_id FROM public.wali_siswa WHERE user_id = auth.uid())
  );

-- Public insert for PPDB (tidak perlu login untuk daftar)
CREATE POLICY "ppdb_public_insert" ON public.ppdb_pendaftaran
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ppdb_public_select_by_id" ON public.ppdb_pendaftaran
  FOR SELECT USING (true);

CREATE POLICY "ppdb_admin_all" ON public.ppdb_pendaftaran
  FOR ALL USING (current_user_role() = 'admin');

-- ── WALI SISWA ──────────────────────────────────────────────
CREATE POLICY "wali_siswa_own" ON public.wali_siswa
  FOR SELECT USING (user_id = auth.uid() OR current_user_role() IN ('admin','guru'));

CREATE POLICY "wali_siswa_admin_all" ON public.wali_siswa
  FOR ALL USING (current_user_role() = 'admin');

-- ── ABSENSI ─────────────────────────────────────────────────
CREATE POLICY "absensi_admin_all" ON public.absensi
  FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "absensi_guru_all" ON public.absensi
  FOR ALL USING (current_user_role() = 'guru');

CREATE POLICY "absensi_ortu_read_own" ON public.absensi
  FOR SELECT USING (
    current_user_role() = 'ortu' AND
    siswa_id IN (SELECT siswa_id FROM public.wali_siswa WHERE user_id = auth.uid())
  );

-- ── NILAI ───────────────────────────────────────────────────
CREATE POLICY "nilai_admin_all" ON public.nilai
  FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "nilai_guru_all" ON public.nilai
  FOR ALL USING (current_user_role() = 'guru');

CREATE POLICY "nilai_ortu_read_own" ON public.nilai
  FOR SELECT USING (
    current_user_role() = 'ortu' AND
    siswa_id IN (SELECT siswa_id FROM public.wali_siswa WHERE user_id = auth.uid())
  );

-- ── IZIN ────────────────────────────────────────────────────
CREATE POLICY "izin_admin_all" ON public.izin
  FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "izin_guru_all" ON public.izin
  FOR ALL USING (current_user_role() = 'guru');

CREATE POLICY "izin_ortu_own" ON public.izin
  FOR ALL USING (
    current_user_role() = 'ortu' AND
    ortu_id = auth.uid()
  );

-- ── PENGUMUMAN ──────────────────────────────────────────────
CREATE POLICY "pengumuman_public_read" ON public.pengumuman
  FOR SELECT USING (
    target_role = 'semua' OR
    (auth.uid() IS NOT NULL AND (
      target_role = current_user_role() OR
      current_user_role() = 'admin'
    ))
  );

CREATE POLICY "pengumuman_admin_write" ON public.pengumuman
  FOR ALL USING (current_user_role() = 'admin');

-- ── JADWAL ──────────────────────────────────────────────────
CREATE POLICY "jadwal_read_authenticated" ON public.jadwal
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "jadwal_admin_all" ON public.jadwal
  FOR ALL USING (current_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════════
-- SEED DATA (Data awal / contoh)
-- ══════════════════════════════════════════════════════════════

-- Kelas
INSERT INTO public.kelas (nama_kelas, tingkat, tahun_ajaran) VALUES
  ('Kelas 1A', 1, '2024/2025'),
  ('Kelas 1B', 1, '2024/2025'),
  ('Kelas 2A', 2, '2024/2025'),
  ('Kelas 2B', 2, '2024/2025'),
  ('Kelas 3A', 3, '2024/2025'),
  ('Kelas 3B', 3, '2024/2025'),
  ('Kelas 4A', 4, '2024/2025'),
  ('Kelas 4B', 4, '2024/2025'),
  ('Kelas 5A', 5, '2024/2025'),
  ('Kelas 5B', 5, '2024/2025'),
  ('Kelas 6A', 6, '2024/2025'),
  ('Kelas 6B', 6, '2024/2025')
ON CONFLICT DO NOTHING;

-- Guru contoh (tanpa user_id dulu)
INSERT INTO public.guru (nip, nama, jenis_kelamin, jabatan, mapel, status_kepegawaian, no_hp) VALUES
  ('198501012010011001', 'Drs. Ahmad Fauzi, M.Pd', 'L', 'Kepala Sekolah', NULL, 'PNS', '08123456781'),
  ('199002022015012002', 'Siti Aisyah, S.Pd', 'P', 'Wali Kelas 1A', 'Matematika', 'PNS', '08123456782'),
  ('198803032017011003', 'Budi Santoso, S.Pd.I', 'L', 'Wali Kelas 2A', 'Qur\'an Hadits', 'PNS', '08123456783'),
  (NULL, 'Nur Hidayah, S.Pd', 'P', 'Guru Kelas', 'Bahasa Indonesia', 'GTT', '08123456784'),
  (NULL, 'M. Rizky, S.Pd', 'L', 'Guru Kelas', 'IPA', 'GTT', '08123456785'),
  ('199504052020012006', 'Rahma Dewi, S.Pd', 'P', 'Guru Kelas', 'IPS', 'PNS', '08123456786'),
  (NULL, 'Yusuf Al-Farisi, S.Pd.I', 'L', 'Guru PAI', 'Fiqih, Aqidah', 'GTT', '08123456787'),
  (NULL, 'Liana Sari, S.Pd', 'P', 'Guru PJOK', 'PJOK', 'GTT', '08123456788'),
  (NULL, 'Hendra Wijaya', 'L', 'Staf TU', NULL, 'PTT', '08123456789'),
  (NULL, 'Marlina, A.Md', 'P', 'Pustakawan', NULL, 'PTT', '08123456780')
ON CONFLICT DO NOTHING;

-- Pengumuman contoh
INSERT INTO public.pengumuman (judul, isi, kategori, target_role, tanggal) VALUES
  ('Jadwal Ujian Akhir Semester Genap 2024/2025', 'Ujian Akhir Semester Genap akan dilaksanakan pada tanggal 19-30 Mei 2025. Peserta didik diharapkan mempersiapkan diri dengan baik. Detail jadwal per mata pelajaran akan dibagikan melalui wali kelas masing-masing.', 'Akademik', 'semua', '2025-04-15'),
  ('Pendaftaran PPDB Tahun Ajaran 2025/2026 Dibuka', 'Dengan hormat, kami informasikan bahwa Pendaftaran Peserta Didik Baru (PPDB) Tahun Ajaran 2025/2026 resmi dibuka mulai 1 Mei 2025. Pendaftaran dapat dilakukan secara online melalui website sekolah. Kuota terbatas!', 'PPDB', 'semua', '2025-04-10'),
  ('Libur Hari Raya Idul Fitri 1446 H', 'Diberitahukan kepada seluruh warga sekolah bahwa kegiatan belajar mengajar akan diliburkan dalam rangka Hari Raya Idul Fitri 1446 H mulai tanggal 28 Maret - 12 April 2025.', 'Umum', 'semua', '2025-04-05'),
  ('Rapat Koordinasi Guru - Semester Genap', 'Kepada seluruh bapak/ibu guru dan staf, diwajibkan menghadiri rapat koordinasi semester genap pada Sabtu, 3 Mei 2025 pukul 08.00 WIB di Ruang Guru.', 'Kepegawaian', 'guru', '2025-04-01')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- CARA MEMBUAT AKUN ADMIN PERTAMA
-- Jalankan ini SETELAH membuat akun via Supabase Auth:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@minsingkawang.sch.id';
-- ══════════════════════════════════════════════════════════════
