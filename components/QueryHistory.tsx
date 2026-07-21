"use client";

import { fmtMoney, fmtPerMile } from "@/lib/format";
import type { QueryRecord } from "@/lib/types";

interface QueryHistoryProps {
  rows: QueryRecord[];
}

export function QueryHistory({ rows }: QueryHistoryProps) {
  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          查询历史
        </h2>
        <p className="text-sm text-slate-500">Calculate a lane to record history.</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          查询历史
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Origin</th>
              <th className="px-4 py-2 font-medium">Dest</th>
              <th className="px-4 py-2 text-right font-medium">Miles</th>
              <th className="px-4 py-2 text-right font-medium">Warp 市场价</th>
              <th className="px-4 py-2 text-right font-medium">ATRI 成本</th>
              <th className="px-4 py-2 text-right font-medium">价差</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const atri = row.mode === "team" ? row.teamTotal : row.atriTotal;
              const spread =
                row.warpPrice != null && row.warpPrice > 0 ? row.warpPrice - atri : null;
              return (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-2 tabular-nums text-slate-600">
                    {new Date(row.timestamp).toLocaleString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </td>
                  <td className="px-4 py-2 font-mono">{row.originZip}</td>
                  <td className="px-4 py-2 font-mono">{row.destZip}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{Math.round(row.distanceMiles)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {row.warpPrice ? (
                      <>
                        <span className="font-semibold text-emerald-700">{fmtMoney(row.warpPrice, 0)}</span>
                        {row.warpPerMile && (
                          <span className="block text-xs text-emerald-600">
                            {fmtPerMile(row.warpPerMile)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-slate-600">
                    {fmtMoney(atri, 0)}
                    <span className="block text-xs text-slate-400">{fmtPerMile(row.atriPerMile)}</span>
                  </td>
                  <td
                    className={`px-4 py-2 text-right tabular-nums font-medium ${
                      spread == null
                        ? "text-slate-400"
                        : spread >= 0
                          ? "text-emerald-700"
                          : "text-red-600"
                    }`}
                  >
                    {spread != null ? `${spread >= 0 ? "+" : ""}${fmtMoney(spread, 0)}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
