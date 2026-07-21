"use client";

import { useState } from "react";
import { LINE_ITEM_LABELS } from "@/lib/constants";
import { rateColor } from "@/lib/atri-model";
import { fmtMoney, fmtPerMile } from "@/lib/format";
import type { CostBreakdown as CostBreakdownType, DriveMode } from "@/lib/types";

interface CostBreakdownProps {
  cost: CostBreakdownType;
  mode: DriveMode;
  distanceMiles: number;
}

export function CostBreakdown({ cost, mode, distanceMiles }: CostBreakdownProps) {
  const [open, setOpen] = useState(false);
  const perMile = mode === "team" ? cost.teamPerMile : cost.adjustedPerMile;
  const total = mode === "team" ? cost.teamTotalCost : cost.totalCost;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            ATRI Cost Model
          </h2>
          <p className="mt-1 text-xs text-slate-400">{cost.regionLabel}</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold tabular-nums ${rateColor(perMile)}`}>
            {fmtMoney(total)}
          </p>
          <p className={`text-sm tabular-nums ${rateColor(perMile)}`}>{fmtPerMile(perMile)}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-slate-500">ATRI Base</dt>
          <dd className="font-medium tabular-nums">{fmtPerMile(cost.basePerMile)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Region Adj.</dt>
          <dd className="font-medium tabular-nums">{fmtPerMile(cost.regionAdjustedPerMile)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Fuel (adj.)</dt>
          <dd className="font-medium tabular-nums">{fmtPerMile(cost.fuelAdjustedPerMile)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Diesel</dt>
          <dd className="font-medium tabular-nums">${cost.dieselPrice.toFixed(3)}/gal</dd>
        </div>
      </dl>

      {mode === "team" && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Team premium includes an extra driver (wages + benefits ≈{" "}
          {fmtPerMile(cost.teamPerMile - cost.adjustedPerMile)}).
        </p>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
      >
        {open ? "Hide" : "Show"} 9-line cost breakdown
      </button>

      {open && (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 text-right font-medium">$/mi</th>
              <th className="pb-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(cost.lineItems).map(([key, value]) => (
              <tr key={key} className="border-b border-slate-100">
                <td className="py-2">{LINE_ITEM_LABELS[key] ?? key}</td>
                <td className="py-2 text-right tabular-nums">{fmtPerMile(value)}</td>
                <td className="py-2 text-right tabular-nums">{fmtMoney(value * distanceMiles, 0)}</td>
              </tr>
            ))}
            {mode === "team" && (
              <tr className="font-medium text-amber-700">
                <td className="py-2">+ Team driver premium</td>
                <td className="py-2 text-right tabular-nums">
                  {fmtPerMile(cost.teamPerMile - cost.adjustedPerMile)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {fmtMoney((cost.teamPerMile - cost.adjustedPerMile) * distanceMiles, 0)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
