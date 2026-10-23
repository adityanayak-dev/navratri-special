-- Created automatically by server/index.js on start; kept here for reference.
CREATE TABLE IF NOT EXISTS quiz_answers (
  id              BIGSERIAL PRIMARY KEY,
  attempt_id      TEXT        NOT NULL,   -- anonymous random id, one per quiz run
  question_number INTEGER     NOT NULL,   -- id of the question in src/content.js
  answer          TEXT        NOT NULL,   -- selected option(s) or the written answer
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_number)
);
CREATE INDEX IF NOT EXISTS quiz_answers_created_idx ON quiz_answers (created_at DESC);
