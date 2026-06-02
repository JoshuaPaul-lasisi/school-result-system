-- Debbyfield Schools Academic Management System
-- Run this ENTIRE file in your Supabase SQL Editor (Project → SQL Editor → New query)
-- Safe to re-run: all statements use IF NOT EXISTS / ON CONFLICT DO NOTHING

-- ── existing tables (scores, attendance, observations) ────────────────────────

CREATE TABLE IF NOT EXISTS scores (
  id           BIGSERIAL PRIMARY KEY,
  student_id   INTEGER NOT NULL,
  subject      TEXT NOT NULL,
  ca           NUMERIC(5,2),   -- CA1 (max 20)
  ca2          NUMERIC(5,2),   -- CA2 (max 20)
  exam         NUMERIC(5,2),
  term         TEXT NOT NULL,
  session      TEXT NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject, term, session)
);

-- Add ca2 to existing installations
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='scores' AND column_name='ca2'
  ) THEN ALTER TABLE scores ADD COLUMN ca2 NUMERIC(5,2); END IF;
END $$;

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

-- ── exam papers (AI-generated) ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exam_papers (
  id          BIGSERIAL PRIMARY KEY,
  subject     TEXT NOT NULL,
  cls         TEXT NOT NULL,
  sec         TEXT NOT NULL,
  paper_type  TEXT NOT NULL CHECK (paper_type IN ('CA1','CA2','Exam')),
  term        TEXT NOT NULL,
  session     TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject, cls, paper_type, term, session)
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
ALTER TABLE exam_papers       ENABLE ROW LEVEL SECURITY;
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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_papers'       AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON exam_papers       FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_config'      AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON admin_config      FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
END $$;

-- ── student profiles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  student_id   INTEGER PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  dob          DATE,
  blood_group  TEXT,
  genotype     TEXT,
  address      TEXT,
  admission_date DATE,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── guardians ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guardians (
  id           BIGSERIAL PRIMARY KEY,
  student_id   INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  name         TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  occupation   TEXT,
  is_primary   BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── fee structure ─────────────────────────────────────────────────────────────
-- One row per fee item per class group per term/session.
-- class_group = 'All' means the fee applies to every student regardless of class.
CREATE TABLE IF NOT EXISTS fee_structure (
  id           BIGSERIAL PRIMARY KEY,
  class_group  TEXT NOT NULL CHECK (class_group IN ('Pre-Primary','Primary','JSS','SS','All')),
  fee_name     TEXT NOT NULL,
  amount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_optional  BOOLEAN DEFAULT false,
  term         TEXT NOT NULL,
  session      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_group, fee_name, term, session)
);

-- ── payment log ───────────────────────────────────────────────────────────────
-- Every individual payment transaction recorded by admin
CREATE TABLE IF NOT EXISTS payment_log (
  id             BIGSERIAL PRIMARY KEY,
  student_id     INTEGER REFERENCES students(id),
  student_name   TEXT,
  amount         NUMERIC(10,2) NOT NULL,
  fee_name       TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cash'
                 CHECK (payment_method IN ('cash','transfer','cheque')),
  receipt_number TEXT,
  note           TEXT,
  term           TEXT NOT NULL,
  session        TEXT NOT NULL,
  payment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security for new tables ─────────────────────────────────────────

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structure    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_log      ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_profiles' AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON student_profiles FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='guardians'        AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON guardians        FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fee_structure'    AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON fee_structure    FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payment_log'      AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON payment_log      FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
END $$;

-- ── EDGE testing system ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS edge_tests (
  id          BIGSERIAL PRIMARY KEY,
  test_type   TEXT NOT NULL CHECK (test_type IN ('weekly','mock')),
  cls         TEXT NOT NULL,
  subject     TEXT,           -- mock exams only
  half        TEXT,           -- weekly tests only: 'A' or 'B'
  week_number INTEGER,        -- weekly tests only: 3–10
  mock_number INTEGER,        -- mock exams only: 1–6
  term        TEXT NOT NULL,
  session     TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edge_scores (
  id            BIGSERIAL PRIMARY KEY,
  student_id    INTEGER NOT NULL REFERENCES students(id),
  edge_test_id  BIGINT  NOT NULL REFERENCES edge_tests(id) ON DELETE CASCADE,
  score         NUMERIC(6,2),
  max_score     NUMERIC(6,2),
  term          TEXT NOT NULL,
  session       TEXT NOT NULL,
  recorded_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, edge_test_id)
);

ALTER TABLE edge_tests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_scores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='edge_tests'  AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON edge_tests  FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='edge_scores' AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON edge_scores FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
END $$;

-- ── indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS scores_term_session            ON scores(term, session);
CREATE INDEX IF NOT EXISTS attendance_term_session        ON attendance(term, session);
CREATE INDEX IF NOT EXISTS observations_term_session      ON observations(term, session);
CREATE INDEX IF NOT EXISTS enrollments_term_session       ON enrollments(term, session);
CREATE INDEX IF NOT EXISTS enrollments_annex              ON enrollments(annex_id);
CREATE INDEX IF NOT EXISTS staff_assignments_term_session ON staff_assignments(term, session);
CREATE INDEX IF NOT EXISTS exam_papers_term_session        ON exam_papers(term, session);
CREATE INDEX IF NOT EXISTS exam_papers_cls                 ON exam_papers(cls);
CREATE INDEX IF NOT EXISTS guardians_student_id           ON guardians(student_id);
CREATE INDEX IF NOT EXISTS fee_structure_term_session     ON fee_structure(term, session);
CREATE INDEX IF NOT EXISTS payment_log_term_session       ON payment_log(term, session);
CREATE INDEX IF NOT EXISTS payment_log_student_id         ON payment_log(student_id);
CREATE INDEX IF NOT EXISTS edge_tests_term_session        ON edge_tests(term, session);
CREATE INDEX IF NOT EXISTS edge_tests_cls                 ON edge_tests(cls);
CREATE INDEX IF NOT EXISTS edge_scores_student_id         ON edge_scores(student_id);
CREATE INDEX IF NOT EXISTS edge_scores_test_id            ON edge_scores(edge_test_id);

-- ── schemes of work ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS schemes (
  id         BIGSERIAL PRIMARY KEY,
  subject    TEXT NOT NULL,
  cls        TEXT NOT NULL,
  term       TEXT NOT NULL,
  session    TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject, cls, term, session)
);

-- ── daily attendance ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_attendance (
  id           BIGSERIAL PRIMARY KEY,
  student_id   INTEGER NOT NULL REFERENCES students(id),
  school_date  DATE NOT NULL,
  cls          TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'present'
               CHECK (status IN ('present','absent','excused')),
  term         TEXT NOT NULL,
  session      TEXT NOT NULL,
  UNIQUE(student_id, school_date)
);

-- ── school holidays ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS school_holidays (
  id            SERIAL PRIMARY KEY,
  holiday_date  DATE NOT NULL UNIQUE,
  holiday_name  TEXT NOT NULL,
  term          TEXT NOT NULL,
  session       TEXT NOT NULL
);

ALTER TABLE schemes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_attendance  ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_holidays   ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='schemes'          AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON schemes          FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='daily_attendance' AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON daily_attendance FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='school_holidays'  AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON school_holidays  FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
END $$;

CREATE INDEX IF NOT EXISTS schemes_cls              ON schemes(cls, term, session);
CREATE INDEX IF NOT EXISTS daily_att_date           ON daily_attendance(school_date);
CREATE INDEX IF NOT EXISTS daily_att_term_session   ON daily_attendance(term, session);
CREATE INDEX IF NOT EXISTS daily_att_student        ON daily_attendance(student_id);
CREATE INDEX IF NOT EXISTS holidays_term_session    ON school_holidays(term, session);

-- ── expand fee_structure to allow school-wide fees (existing installs) ────────
DO $$ BEGIN
  ALTER TABLE fee_structure DROP CONSTRAINT IF EXISTS fee_structure_class_group_check;
  ALTER TABLE fee_structure
    ADD CONSTRAINT fee_structure_class_group_check
    CHECK (class_group IN ('Pre-Primary','Primary','JSS','SS','All'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── expense log ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_log (
  id             BIGSERIAL PRIMARY KEY,
  description    TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('Staff Cost','Supplies','Maintenance','Programme Cost','Other')),
  amount         NUMERIC(10,2) NOT NULL,
  expense_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_ref    TEXT,
  note           TEXT,
  term           TEXT NOT NULL,
  session        TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── asset register ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id              BIGSERIAL PRIMARY KEY,
  item_name       TEXT NOT NULL,
  location        TEXT,
  quantity        INTEGER NOT NULL DEFAULT 1,
  condition       TEXT NOT NULL DEFAULT 'Good'
                  CHECK (condition IN ('Good','Fair','Poor')),
  responsible     TEXT,
  date_recorded   DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── incident & communication log ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incident_log (
  id             BIGSERIAL PRIMARY KEY,
  incident_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  persons        TEXT NOT NULL,
  incident_type  TEXT NOT NULL
                 CHECK (incident_type IN ('Parent Complaint','Staff Issue','Student Discipline','External Visit','Other')),
  description    TEXT NOT NULL,
  action_taken   TEXT,
  follow_up      BOOLEAN NOT NULL DEFAULT false,
  follow_up_note TEXT,
  recorded_by    TEXT DEFAULT 'Joshua',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── staff: add start_date, next_of_kin, nok_phone, notes (existing installs) ─
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff' AND column_name='start_date')   THEN ALTER TABLE staff ADD COLUMN start_date  DATE;        END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff' AND column_name='next_of_kin') THEN ALTER TABLE staff ADD COLUMN next_of_kin TEXT;        END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff' AND column_name='nok_phone')   THEN ALTER TABLE staff ADD COLUMN nok_phone   TEXT;        END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff' AND column_name='notes')       THEN ALTER TABLE staff ADD COLUMN notes       TEXT;        END IF;
END $$;

ALTER TABLE expense_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='expense_log'  AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON expense_log  FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='assets'       AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON assets       FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='incident_log' AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON incident_log FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
END $$;

CREATE INDEX IF NOT EXISTS expense_log_term_session ON expense_log(term, session);
CREATE INDEX IF NOT EXISTS assets_condition         ON assets(condition);
CREATE INDEX IF NOT EXISTS incident_log_date        ON incident_log(incident_date);
CREATE INDEX IF NOT EXISTS incident_log_followup    ON incident_log(follow_up);
