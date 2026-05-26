-- Debbyfield Schools Academic Management System
-- Run this ENTIRE file in your Supabase SQL Editor (Project → SQL Editor → New query)
-- Safe to re-run: all statements use IF NOT EXISTS / ON CONFLICT DO NOTHING

-- ── existing tables (scores, attendance, observations) ────────────────────────

CREATE TABLE IF NOT EXISTS scores (
  id           BIGSERIAL PRIMARY KEY,
  student_id   INTEGER NOT NULL,
  subject      TEXT NOT NULL,
  ca           NUMERIC(5,2),
  exam         NUMERIC(5,2),
  term         TEXT NOT NULL,
  session      TEXT NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject, term, session)
);

CREATE TABLE IF NOT EXISTS attendance (
  id           BIGSERIAL PRIMARY KEY,
  student_id   INTEGER NOT NULL,
  total_days   INTEGER NOT NULL DEFAULT 57,
  days_present INTEGER,
  term         TEXT NOT NULL,
  session      TEXT NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, term, session)
);

CREATE TABLE IF NOT EXISTS observations (
  id                BIGSERIAL PRIMARY KEY,
  student_id        INTEGER NOT NULL,
  character_note    TEXT DEFAULT '',
  teacher_comment   TEXT DEFAULT '',
  principal_comment TEXT DEFAULT '',
  term              TEXT NOT NULL,
  session           TEXT NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, term, session)
);

-- ── school structure ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS annexes (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  address    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO annexes (name, address) VALUES
  ('Mushin',         '12, Bamgboye Street, Off Alafia Street, Mushin, Lagos'),
  ('Obafemi-Owode',  '9, Assemblies of God Road, Obafemi-Owode, Ogun')
ON CONFLICT (name) DO NOTHING;

-- ── students ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS students (
  id         INTEGER PRIMARY KEY,   -- 1001-1100 existing, 2001+ new
  name       TEXT NOT NULL,
  gender     TEXT CHECK (gender IN ('Male','Female')),
  annex_id   INTEGER REFERENCES annexes(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Point-in-time enrollment: one row per student per term/session
CREATE TABLE IF NOT EXISTS enrollments (
  id         BIGSERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  cls        TEXT NOT NULL,
  sec        TEXT NOT NULL,
  annex_id   INTEGER REFERENCES annexes(id),
  status     TEXT NOT NULL DEFAULT 'active'
             CHECK (status IN ('active','left','graduated')),
  term       TEXT NOT NULL,
  session    TEXT NOT NULL,
  UNIQUE(student_id, term, session)
);

-- ── staff ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS staff (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  gender      TEXT CHECK (gender IN ('Male','Female')),
  staff_type  TEXT NOT NULL DEFAULT 'teaching'
              CHECK (staff_type IN ('teaching','non-teaching')),
  role        TEXT,
  phone       TEXT,
  annex_id    INTEGER REFERENCES annexes(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Point-in-time staff assignment: one row per staff member per term/session
CREATE TABLE IF NOT EXISTS staff_assignments (
  id         BIGSERIAL PRIMARY KEY,
  staff_id   BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  annex_id   INTEGER REFERENCES annexes(id),
  term       TEXT NOT NULL,
  session    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'active'
             CHECK (status IN ('active','left')),
  UNIQUE(staff_id, term, session)
);

-- ── admin ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_config (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  pin_hash   TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE scores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance        ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE annexes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff             ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config      ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scores'            AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON scores            FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='attendance'        AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON attendance        FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='observations'      AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON observations      FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='annexes'           AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON annexes           FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='students'          AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON students          FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='enrollments'       AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON enrollments       FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='staff'             AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON staff             FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='staff_assignments' AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON staff_assignments FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_config'      AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON admin_config      FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
END $$;

-- ── indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS scores_term_session            ON scores(term, session);
CREATE INDEX IF NOT EXISTS attendance_term_session        ON attendance(term, session);
CREATE INDEX IF NOT EXISTS observations_term_session      ON observations(term, session);
CREATE INDEX IF NOT EXISTS enrollments_term_session       ON enrollments(term, session);
CREATE INDEX IF NOT EXISTS enrollments_annex              ON enrollments(annex_id);
CREATE INDEX IF NOT EXISTS staff_assignments_term_session ON staff_assignments(term, session);
