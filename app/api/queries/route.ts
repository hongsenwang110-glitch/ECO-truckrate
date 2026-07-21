import { promises as fs } from "fs";
import path from "path";
import { insertQueryHistory, isDatabaseConfigured, listQueryHistory } from "@/lib/db";
import type { QueryRecord } from "@/lib/types";

const DATA_FILE = path.join(process.cwd(), "data", "query-history.json");

async function readJsonHistory(): Promise<QueryRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as QueryRecord[];
  } catch {
    return [];
  }
}

async function writeJsonHistory(rows: QueryRecord[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(rows.slice(0, 200), null, 2));
}

export async function GET() {
  if (isDatabaseConfigured()) {
    const rows = await listQueryHistory(50);
    return Response.json(rows);
  }

  const rows = await readJsonHistory();
  return Response.json(rows.slice(0, 50));
}

export async function POST(request: Request) {
  const record = (await request.json()) as QueryRecord;
  if (!record?.originZip || !record?.destZip) {
    return Response.json({ error: "Invalid record" }, { status: 400 });
  }

  const normalized: QueryRecord = {
    ...record,
    id: record.id ?? crypto.randomUUID(),
  };

  if (isDatabaseConfigured()) {
    await insertQueryHistory(normalized);
    return Response.json({ ok: true, storage: "neon" });
  }

  const rows = await readJsonHistory();
  rows.unshift(normalized);
  await writeJsonHistory(rows);
  return Response.json({ ok: true, storage: "json" });
}
