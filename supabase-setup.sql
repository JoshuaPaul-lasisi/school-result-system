-- Debbyfield Schools Academic Management System
-- Run this entire file in your Supabase SQL Editor (Project → SQL Editor → New query)

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

ALTER TABLE scores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance  ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON scores       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON attendance   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON observations FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS scores_term_session       ON scores(term, session);
CREATE INDEX IF NOT EXISTS attendance_term_session   ON attendance(term, session);
CREATE INDEX IF NOT EXISTS observations_term_session ON observations(term, session);
