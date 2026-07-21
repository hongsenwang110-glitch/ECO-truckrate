-- ECO Truck Rate Calculator — query history table
-- Run once in Neon SQL Editor

CREATE TABLE IF NOT EXISTS query_history (
  id              TEXT PRIMARY KEY,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  origin_zip      TEXT NOT NULL,
  dest_zip        TEXT NOT NULL,
  origin_label    TEXT,
  dest_label      TEXT,
  distance_miles  DOUBLE PRECISION NOT NULL,
  mode            TEXT NOT NULL DEFAULT 'solo',
  atri_total      DOUBLE PRECISION,
  atri_per_mile   DOUBLE PRECISION,
  team_total      DOUBLE PRECISION,
  warp_price      DOUBLE PRECISION,
  warp_per_mile   DOUBLE PRECISION,
  dat_spot        DOUBLE PRECISION,
  dat_contract    DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_query_history_ts
  ON query_history (timestamp DESC);
