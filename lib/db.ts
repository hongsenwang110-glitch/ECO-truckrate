import { neon } from "@neondatabase/serverless";
import type { QueryRecord } from "@/lib/types";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

type QueryRow = {
  id: string;
  timestamp: string;
  origin_zip: string;
  dest_zip: string;
  origin_label: string | null;
  dest_label: string | null;
  distance_miles: number;
  mode: string;
  atri_total: number | null;
  atri_per_mile: number | null;
  team_total: number | null;
  warp_price: number | null;
  warp_per_mile: number | null;
  dat_spot: number | null;
  dat_contract: number | null;
};

function rowToRecord(row: QueryRow): QueryRecord {
  return {
    id: row.id,
    timestamp: new Date(row.timestamp).toISOString(),
    originZip: row.origin_zip,
    destZip: row.dest_zip,
    originLabel: row.origin_label ?? "",
    destLabel: row.dest_label ?? "",
    distanceMiles: Number(row.distance_miles),
    mode: row.mode as QueryRecord["mode"],
    atriTotal: Number(row.atri_total ?? 0),
    atriPerMile: Number(row.atri_per_mile ?? 0),
    teamTotal: Number(row.team_total ?? 0),
    warpPrice: row.warp_price != null ? Number(row.warp_price) : null,
    warpPerMile: row.warp_per_mile != null ? Number(row.warp_per_mile) : null,
    datSpot: row.dat_spot != null ? Number(row.dat_spot) : null,
    datContract: row.dat_contract != null ? Number(row.dat_contract) : null,
  };
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function listQueryHistory(limit = 50): Promise<QueryRecord[]> {
  const sql = getSql();
  if (!sql) return [];

  const rows = await sql`
    SELECT
      id, timestamp, origin_zip, dest_zip, origin_label, dest_label,
      distance_miles, mode, atri_total, atri_per_mile, team_total,
      warp_price, warp_per_mile, dat_spot, dat_contract
    FROM query_history
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `;

  return (rows as QueryRow[]).map(rowToRecord);
}

export async function insertQueryHistory(record: QueryRecord): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  await sql`
    INSERT INTO query_history (
      id, timestamp, origin_zip, dest_zip, origin_label, dest_label,
      distance_miles, mode, atri_total, atri_per_mile, team_total,
      warp_price, warp_per_mile, dat_spot, dat_contract
    ) VALUES (
      ${record.id},
      ${record.timestamp},
      ${record.originZip},
      ${record.destZip},
      ${record.originLabel},
      ${record.destLabel},
      ${record.distanceMiles},
      ${record.mode},
      ${record.atriTotal},
      ${record.atriPerMile},
      ${record.teamTotal},
      ${record.warpPrice},
      ${record.warpPerMile},
      ${record.datSpot},
      ${record.datContract}
    )
    ON CONFLICT (id) DO NOTHING
  `;
}
