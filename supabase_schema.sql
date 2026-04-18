-- ============================================================
-- SIS MIN SINGKAWANG - SUPABASE SCHEMA
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','guru','ortu')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GURU
CREATE TABLE IF NOT EXISTS guru (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nip TEXT UNIQUE,
  nama TEXT NOT NULL,
  jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L','P')),
  tempat_lahir TEXT,
  tanggal_lahir DATE,
  alamat TEXT,
  email TEXT,
  phone TEXT,
  jabatan TEXT,
  status_kepegawaian TEXT DEFAULT 'GTT' CHECK (status_kepegawaian IN ('PNS','GTT','PTT')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. KELAS
CREATE TABLE IF NOT EXISTS kelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  tingkat INTEGER NOT NULL CHECK (tingkat BETWEEN 1 AND 6),
  tahun_ajaran TEXT NOT NULL,
  wali_kelas_id UUID REFERENCES guru(id) ON DELETE SET NULL,
  ruang TEXT,
  kapasitas INTEGER DEFAULT 32,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SISWA
CREATE TABLE IF NOT EXISTS siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nisn TEXT UNIQUE,
  nik TEXT UNIQUE,
  nama TEXT NOT NULL,
  jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L','P')),
  tempat_lahir TEXT,
  tanggal_lahir DATE,
  alamat TEXT,
  kelas_id UUID REFERENCES kelas(id) ON DELETE SET NULL,
  tahun_masuk INTEGER,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif','lulus','keluar')),
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORTU_SISWA (link user ortu ke siswa)
CREATE TABLE IF NOT EXISTS ortu_siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE NOT NULL,
  hubungan TEXT DEFAULT 'wali' CHECK (hubungan IN ('ayah','ibu','wali')),
  UNIQUE(user_id, siswa_id)
);

-- 6. MATA PELAJARAN
CREATE TABLE IF NOT EXISTS mata_pelajaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kode TEXT UNIQUE,
  kkm INTEGER DEFAULT 75,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. JADWAL PELAJARAN
CREATE TABLE IF NOT EXISTS jadwal_pelajaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE NOT NULL,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE NOT NULL,
  guru_id UUID REFERENCES guru(id) ON DELETE SET NULL,
  hari TEXT NOT NULL CHECK (hari IN ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')),
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ABSENSI
CREATE TABLE IF NOT EXISTS absensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE NOT NULL,
  kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE NOT NULL,
  tanggal DATE NOT NULL,
  status CHAR(1) NOT NULL CHECK (status IN ('H','S','I','A')),
  keterangan TEXT,
  guru_id UUID REFERENCES guru(id) ON DELETE SET NULL,
  izin_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(siswa_id, tanggal)
);

-- 9. IZIN
CREATE TABLE IF NOT EXISTS izin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('sakit','izin','lainnya')),
  keterangan TEXT NOT NULL,
  lampiran_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','disetujui','ditolak')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NILAI
CREATE TABLE IF NOT EXISTS nilai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE NOT NULL,
  mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE NOT NULL,
  kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE NOT NULL,
  semester INTEGER NOT NULL CHECK (semester IN (1,2)),
  tahun_ajaran TEXT NOT NULL,
  nilai_tugas NUMERIC(5,2),
  nilai_uts NUMERIC(5,2),
  nilai_uas NUMERIC(5,2),
  nilai_akhir NUMERIC(5,2) GENERATED ALWAYS AS (
    ROUND((COALESCE(nilai_tugas,0)*0.3 + COALESCE(nilai_uts,0)*0.3 + COALESCE(nilai_uas,0)*0.4)::NUMERIC, 2)
  ) STORED,
  guru_id UUID REFERENCES guru(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(siswa_id, mapel_id, semester, tahun_ajaran)
);

-- 11. PPDB
CREATE TABLE IF NOT EXISTS ppdb (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nama_siswa TEXT NOT NULL,
  nik TEXT NOT NULL,
  nisn TEXT,
  tempat_lahir TEXT NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L','P')),
  alamat TEXT,
  nama_ortu TEXT NOT NULL,
  phone_ortu TEXT NOT NULL,
  email_ortu TEXT,
  sekolah_asal TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','diterima','ditolak')),
  catatan_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PENGUMUMAN
CREATE TABLE IF NOT EXISTS pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  kategori TEXT DEFAULT 'Umum',
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all','guru','ortu')),
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai ENABLE ROW LEVEL SECURITY;
ALTER TABLE izin ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppdb ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE mata_pelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_pelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE ortu_siswa ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- PROFILES policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (get_user_role() = 'admin');
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins manage profiles" ON profiles FOR ALL USING (get_user_role() = 'admin');

-- SISWA policies
CREATE POLICY "Admin full access siswa" ON siswa FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Guru read siswa" ON siswa FOR SELECT USING (get_user_role() IN ('admin','guru'));
CREATE POLICY "Ortu read own children" ON siswa FOR SELECT USING (
  id IN (SELECT siswa_id FROM ortu_siswa WHERE user_id = auth.uid())
);

-- GURU policies
CREATE POLICY "Admin full access guru" ON guru FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Guru read all guru" ON guru FOR SELECT USING (get_user_role() IN ('admin','guru','ortu'));

-- KELAS policies
CREATE POLICY "Admin full access kelas" ON kelas FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "All roles read kelas" ON kelas FOR SELECT USING (get_user_role() IS NOT NULL);

-- ABSENSI policies
CREATE POLICY "Admin full access absensi" ON absensi FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Guru manage absensi" ON absensi FOR ALL USING (get_user_role() = 'guru');
CREATE POLICY "Ortu read own child absensi" ON absensi FOR SELECT USING (
  siswa_id IN (SELECT siswa_id FROM ortu_siswa WHERE user_id = auth.uid())
);

-- NILAI policies
CREATE POLICY "Admin full access nilai" ON nilai FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Guru manage nilai" ON nilai FOR ALL USING (get_user_role() = 'guru');
CREATE POLICY "Ortu read own child nilai" ON nilai FOR SELECT USING (
  siswa_id IN (SELECT siswa_id FROM ortu_siswa WHERE user_id = auth.uid())
);

-- IZIN policies
CREATE POLICY "Admin full access izin" ON izin FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Guru read izin" ON izin FOR SELECT USING (get_user_role() = 'guru');
CREATE POLICY "Ortu manage own izin" ON izin FOR ALL USING (user_id = auth.uid());

-- PPDB policies
CREATE POLICY "Admin full access ppdb" ON ppdb FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Public insert ppdb" ON ppdb FOR INSERT WITH CHECK (true);
CREATE POLICY "User read own ppdb" ON ppdb FOR SELECT USING (user_id = auth.uid() OR get_user_role() = 'admin');

-- PENGUMUMAN policies
CREATE POLICY "Admin manage pengumuman" ON pengumuman FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "All read published pengumuman" ON pengumuman FOR SELECT USING (is_published = true);

-- MATA PELAJARAN policies
CREATE POLICY "Admin full access mapel" ON mata_pelajaran FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "All read mapel" ON mata_pelajaran FOR SELECT USING (true);

-- JADWAL policies
CREATE POLICY "Admin full access jadwal" ON jadwal_pelajaran FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "All read jadwal" ON jadwal_pelajaran FOR SELECT USING (true);

-- ORTU_SISWA policies
CREATE POLICY "Admin full access ortu_siswa" ON ortu_siswa FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Ortu read own links" ON ortu_siswa FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'ortu')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED DATA: MATA PELAJARAN
-- ============================================================
INSERT INTO mata_pelajaran (nama, kode, kkm) VALUES
  ('Matematika', 'MTK', 75),
  ('Bahasa Indonesia', 'BIND', 75),
  ('IPA', 'IPA', 70),
  ('IPS', 'IPS', 70),
  ('PKn', 'PKN', 75),
  ('Bahasa Arab', 'ARAB', 70),
  ('Qur''an Hadits', 'QURAN', 75),
  ('Fiqih', 'FIQIH', 75),
  ('Aqidah Akhlak', 'AQIDAH', 75),
  ('SKI', 'SKI', 70),
  ('PJOK', 'PJOK', 70),
  ('SBdP', 'SBDP', 70),
  ('Bahasa Inggris', 'BING', 70)
ON CONFLICT (kode) DO NOTHING;
