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
  id               INTEGER PRIMARY KEY DEFAULT 1,
  pin_hash         TEXT NOT NULL,
  admin_pin_hash   TEXT,           -- separate PIN for office admin role
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Add admin_pin_hash to existing installs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_config' AND column_name='admin_pin_hash')
  THEN ALTER TABLE admin_config ADD COLUMN admin_pin_hash TEXT; END IF;
END $$;

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

-- ── inventory / stock management ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_items (
  id                  BIGSERIAL PRIMARY KEY,
  item_name           TEXT NOT NULL,
  category            TEXT NOT NULL
                      CHECK (category IN ('Uniform','Sportswear','Tuesday Wear','Textbooks','Stationery','Other')),
  unit_price          NUMERIC(10,2) NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Every stock movement: positive qty = in, negative qty = out
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id               BIGSERIAL PRIMARY KEY,
  item_id          BIGINT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL
                   CHECK (transaction_type IN ('stock_in','sale','adjustment')),
  quantity         INTEGER NOT NULL,       -- signed: +in, -out
  unit_price       NUMERIC(10,2) DEFAULT 0,
  total_value      NUMERIC(10,2) DEFAULT 0, -- always positive (revenue for sales, cost for stock_in)
  student_name     TEXT,                   -- optional, for sales
  note             TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  term             TEXT NOT NULL,
  session          TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inventory_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='inventory_items'        AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON inventory_items        FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='inventory_transactions' AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON inventory_transactions FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
END $$;

CREATE INDEX IF NOT EXISTS inv_txns_item_id      ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS inv_txns_term_session ON inventory_transactions(term, session);
CREATE INDEX IF NOT EXISTS inv_txns_date         ON inventory_transactions(transaction_date);

-- ── entrance & transfer exam system ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feeder_schools (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  address         TEXT,
  contact_person  TEXT,
  email           TEXT,
  phone           TEXT,
  discount_note   TEXT,   -- e.g. "5% off for 10+ students referred"
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS external_candidates (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  gender            TEXT CHECK (gender IN ('Male','Female')),
  dob               DATE,
  phone             TEXT,
  parent_name       TEXT,
  parent_phone      TEXT,
  parent_email      TEXT,
  feeder_school_id  BIGINT REFERENCES feeder_schools(id),
  exam_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  exam_session      TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'wrote'
                    CHECK (status IN ('wrote','admitted','enrolled','declined')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Fixed subjects: Mathematics, English, Verbal Reasoning, Quantitative Aptitude, General Reasoning
CREATE TABLE IF NOT EXISTS candidate_scores (
  id            BIGSERIAL PRIMARY KEY,
  candidate_id  BIGINT NOT NULL REFERENCES external_candidates(id) ON DELETE CASCADE,
  subject       TEXT NOT NULL,
  score         NUMERIC(5,1),
  max_score     NUMERIC(5,1) NOT NULL DEFAULT 100,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, subject)
);

ALTER TABLE feeder_schools      ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_scores    ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='feeder_schools'      AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON feeder_schools      FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='external_candidates' AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON external_candidates FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='candidate_scores'    AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON candidate_scores    FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
END $$;

CREATE INDEX IF NOT EXISTS ext_cand_school        ON external_candidates(feeder_school_id);
CREATE INDEX IF NOT EXISTS ext_cand_session       ON external_candidates(exam_session);
CREATE INDEX IF NOT EXISTS ext_cand_date          ON external_candidates(exam_date);
CREATE INDEX IF NOT EXISTS cand_scores_candidate  ON candidate_scores(candidate_id);

-- ── EDGE extracurricular activities ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activity_memberships (
  id           BIGSERIAL PRIMARY KEY,
  student_id   INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  track        TEXT NOT NULL CHECK (track IN ('Voice','Mind','Create','Lead & Build')),
  role         TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('member','captain','deputy','champion')),
  term         TEXT NOT NULL,
  session      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, track, term, session)
);

CREATE TABLE IF NOT EXISTS activity_sessions (
  id               BIGSERIAL PRIMARY KEY,
  track            TEXT NOT NULL CHECK (track IN ('Voice','Mind','Create','Lead & Build')),
  session_date     DATE NOT NULL,
  topic            TEXT,
  notes            TEXT,
  attendance_count INTEGER DEFAULT 0,
  term             TEXT NOT NULL,
  session          TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_competitions (
  id               BIGSERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  competition_date DATE,
  track            TEXT CHECK (track IN ('Voice','Mind','Create','Lead & Build','General')),
  level            TEXT NOT NULL DEFAULT 'internal'
                   CHECK (level IN ('internal','inter-school','regional','national')),
  position         TEXT,
  participants     TEXT,
  notes            TEXT,
  term             TEXT NOT NULL,
  session          TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── school calendar ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS school_events (
  id           BIGSERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  event_date   DATE NOT NULL,
  end_date     DATE,
  event_type   TEXT NOT NULL DEFAULT 'other'
               CHECK (event_type IN ('academic','activities','holiday','meeting','other')),
  description  TEXT,
  term         TEXT NOT NULL,
  session      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── timetable ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS timetable_teachers (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  subjects     TEXT,              -- comma-separated
  classes      TEXT,              -- comma-separated, blank = all JSS/SS
  availability TEXT,              -- comma-separated days, e.g. "Mon,Tue,Wed,Thu"
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetable_slots (
  id           BIGSERIAL PRIMARY KEY,
  cls          TEXT NOT NULL,     -- e.g. "JSS 1"
  day          TEXT NOT NULL,     -- "Mon"|"Tue"|"Wed"|"Thu"  (Fri is always Weekly Test)
  period_index INTEGER NOT NULL,  -- 0-9 matching TT_PERIODS array
  subject      TEXT NOT NULL,
  teacher_name TEXT,
  term         TEXT NOT NULL,
  session      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (cls, day, period_index, term, session)
);

ALTER TABLE activity_memberships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_teachers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots       ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='activity_memberships'  AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON activity_memberships  FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='activity_sessions'     AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON activity_sessions     FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='activity_competitions' AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON activity_competitions FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='school_events'         AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON school_events         FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='timetable_teachers'    AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON timetable_teachers    FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='timetable_slots'       AND policyname='anon_all') THEN CREATE POLICY "anon_all" ON timetable_slots       FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
END $$;

CREATE INDEX IF NOT EXISTS activity_memberships_term   ON activity_memberships(term, session);
CREATE INDEX IF NOT EXISTS activity_memberships_student ON activity_memberships(student_id);
CREATE INDEX IF NOT EXISTS activity_sessions_term      ON activity_sessions(term, session);
CREATE INDEX IF NOT EXISTS activity_sessions_track     ON activity_sessions(track);
CREATE INDEX IF NOT EXISTS activity_competitions_term  ON activity_competitions(term, session);
CREATE INDEX IF NOT EXISTS school_events_term          ON school_events(term, session);
CREATE INDEX IF NOT EXISTS school_events_date          ON school_events(event_date);
CREATE INDEX IF NOT EXISTS timetable_slots_cls         ON timetable_slots(cls, term, session);
CREATE INDEX IF NOT EXISTS timetable_slots_day         ON timetable_slots(day);

-- ── pre-populate teachers (from school records) ───────────────────────────────
INSERT INTO timetable_teachers (name, subjects, classes, availability, notes) VALUES
  ('Olumide',  'Mathematics, Economics, Accounting',      'JSS 1,JSS 2,JSS 3,SS 1,SS 2,SS 3', 'Wed,Thu', 'Wed→Maths/JSS; Thu→Economics+Accounting/SS'),
  ('Tola',     'NVE, Business Studies',                   'JSS 1,JSS 2,JSS 3',                 'Tue,Wed,Thu', NULL),
  ('Victoria', 'CRS, PHE, Home Economics',                'JSS 1,JSS 2,JSS 3,SS 1,SS 2,SS 3', 'Tue,Wed,Thu', 'CRS for JSS+SS; PHE+Home Ec for JSS'),
  ('Sofiat',   'Basic Science, Agricultural Science, Biology', 'JSS 1,JSS 2,JSS 3,SS 1,SS 2,SS 3', 'Mon,Tue,Wed,Thu', 'Agric+Basic Sci for JSS; Agric+Biology for SS'),
  ('Aruotin',  'English Language, Literature in English', 'JSS 1,JSS 2,JSS 3,SS 1,SS 2,SS 3', 'Mon,Tue', NULL),
  ('Aliyu',    'Government, Civic Education, CCA',        'JSS 1,JSS 2,JSS 3,SS 1,SS 2,SS 3', 'Mon,Tue,Wed,Thu', 'Government+Civic Ed for SS; CCA for JSS'),
  ('Victor',   'Mathematics, ICT, Basic Technology',      'JSS 1,JSS 2,JSS 3,SS 1,SS 2,SS 3', 'Mon,Tue,Wed,Thu', 'Maths+ICT+Basic Tech for JSS; Maths+ICT for SS')
ON CONFLICT DO NOTHING;

-- ── Supabase Storage: Results PDF bucket ──────────────────────────────────────
-- Run these AFTER creating the bucket in the Supabase Dashboard:
--   Dashboard → Storage → New bucket → Name: "results" → Private → Create
--
-- Then run this SQL to allow the app (anon key) to upload and create signed URLs:

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='results_anon_insert'
  ) THEN
    CREATE POLICY "results_anon_insert" ON storage.objects
      FOR INSERT TO anon WITH CHECK (bucket_id = 'results');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='results_anon_select'
  ) THEN
    CREATE POLICY "results_anon_select" ON storage.objects
      FOR SELECT TO anon USING (bucket_id = 'results');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='results_anon_update'
  ) THEN
    CREATE POLICY "results_anon_update" ON storage.objects
      FOR UPDATE TO anon USING (bucket_id = 'results');
  END IF;
END $$;
-- Each PDF is stored at: {session}/{term}/{student_id}.pdf
-- Parents receive a signed link valid for 7 days via WhatsApp.

-- ── Public website CMS: news, gallery, contact messages ───────────────────────
-- These power the public website (index.html, news.html, gallery.html, contact.html)
-- and are managed by staff from the "Website" section inside the operational system.

CREATE TABLE IF NOT EXISTS site_news (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  image_url     TEXT,
  published     BOOLEAN DEFAULT TRUE,
  published_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_gallery (
  id          SERIAL PRIMARY KEY,
  image_url   TEXT NOT NULL,
  caption     TEXT,
  category    TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_messages (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'new',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_news     ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_gallery  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Public (anon) visitors may only read published news/gallery, and submit messages — never read others' messages.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_news'     AND policyname='public_read_published') THEN CREATE POLICY "public_read_published" ON site_news     FOR SELECT TO anon USING (published = true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_gallery'  AND policyname='public_read_all')       THEN CREATE POLICY "public_read_all"       ON site_gallery  FOR SELECT TO anon USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_messages' AND policyname='public_insert_only')    THEN CREATE POLICY "public_insert_only"    ON site_messages FOR INSERT TO anon WITH CHECK (true); END IF;

  -- Staff (signed in via the operational system, using the same anon key) manage all CMS content & view messages.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_news'     AND policyname='staff_manage_all') THEN CREATE POLICY "staff_manage_all" ON site_news     FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_gallery'  AND policyname='staff_manage_all') THEN CREATE POLICY "staff_manage_all" ON site_gallery  FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_messages' AND policyname='staff_manage_all') THEN CREATE POLICY "staff_manage_all" ON site_messages FOR ALL TO anon USING (true) WITH CHECK (true); END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_site_news_published    ON site_news (published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_gallery_sort      ON site_gallery (sort_order);
CREATE INDEX IF NOT EXISTS idx_site_messages_status   ON site_messages (status, created_at DESC);

-- ── Supabase Storage: Website media bucket ────────────────────────────────────
-- Run AFTER creating the bucket in the Supabase Dashboard:
--   Dashboard → Storage → New bucket → Name: "site-media" → Public → Create
-- (Public, because images are displayed directly on the public website.)

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='sitemedia_anon_insert'
  ) THEN
    CREATE POLICY "sitemedia_anon_insert" ON storage.objects
      FOR INSERT TO anon WITH CHECK (bucket_id = 'site-media');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='sitemedia_anon_select'
  ) THEN
    CREATE POLICY "sitemedia_anon_select" ON storage.objects
      FOR SELECT TO anon USING (bucket_id = 'site-media');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='sitemedia_anon_update'
  ) THEN
    CREATE POLICY "sitemedia_anon_update" ON storage.objects
      FOR UPDATE TO anon USING (bucket_id = 'site-media');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='sitemedia_anon_delete'
  ) THEN
    CREATE POLICY "sitemedia_anon_delete" ON storage.objects
      FOR DELETE TO anon USING (bucket_id = 'site-media');
  END IF;
END $$;

-- ── section_subjects: custom subject lists per section (managed via Admin → Subjects) ──
CREATE TABLE IF NOT EXISTS section_subjects (
  section TEXT PRIMARY KEY,
  subjects JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE section_subjects ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='section_subjects' AND policyname='anon_all') THEN
    CREATE POLICY "anon_all" ON section_subjects FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;
