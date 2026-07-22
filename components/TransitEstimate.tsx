"use client";

import { fmtDays, fmtHours } from "@/lib/format";
import type { TransitEstimate as TransitEstimateType } from "@/lib/types";

interface TransitEstimateProps {
  solo: TransitEstimateType;
  team: TransitEstimateType;
  fuelGallons: number;
}

export function TransitEstimate({ solo, team, fuelGallons }: TransitEstimateProps) {
  const resetBlocks = solo.resetBlocks ?? Math.max(0, solo.transitDays - 1);
  const resetHoursTotal =
    solo.resetHoursTotal ?? solo.totalElapsedHours - solo.drivingHours;
  const driveCap = solo.driveHoursPerDay ?? 11;
  const resetBlock = solo.resetHoursPerBlock ?? 10;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Route Summary
      </h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4 rounded-lg bg-blue-50 px-3 py-2">
          <dt className="font-medium text-blue-900">Solo 总时效 (含 HOS 休息)</dt>
          <dd className="text-right font-bold tabular-nums text-blue-900">
            {fmtDays(solo.transitDays)} · {fmtHours(solo.totalElapsedHours)}
          </dd>
        </div>

        <div className="flex justify-between gap-4 pl-3">
          <dt className="text-slate-500">纯驾驶时间 (windshield)</dt>
          <dd className="font-medium tabular-nums">{fmtHours(solo.drivingHours)}</dd>
        </div>

        <div className="flex justify-between gap-4 pl-3">
          <dt className="text-slate-500">
            HOS 休息 ({resetBlocks} × {resetBlock}h reset)
          </dt>
          <dd className="font-medium tabular-nums">+{fmtHours(resetHoursTotal)}</dd>
        </div>

        <div className="border-t border-slate-100 pt-3 text-xs text-slate-400">
          Solo 规则：每天最多 {driveCap}h 驾驶（14h duty window 内），之后需 {resetBlock}h off-duty reset
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Transit (Team)</dt>
          <dd className="font-medium tabular-nums">
            {fmtDays(team.transitDays)} · {fmtHours(team.totalElapsedHours)} elapsed
          </dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Fuel (est. @ 6 MPG)</dt>
          <dd className="font-medium tabular-nums">~{Math.round(fuelGallons)} gal</dd>
        </div>
      </dl>
    </section>
  );
}
