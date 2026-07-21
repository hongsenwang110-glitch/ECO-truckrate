"use client";

import { fmtDays, fmtHours } from "@/lib/format";
import type { TransitEstimate as TransitEstimateType } from "@/lib/types";

interface TransitEstimateProps {
  solo: TransitEstimateType;
  team: TransitEstimateType;
  fuelGallons: number;
}

export function TransitEstimate({ solo, team, fuelGallons }: TransitEstimateProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Route Summary
      </h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Est. drive (windshield)</dt>
          <dd className="font-medium tabular-nums">{fmtHours(solo.drivingHours)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Transit (Solo, HOS)</dt>
          <dd className="font-medium tabular-nums">
            {fmtDays(solo.transitDays)} · {fmtHours(solo.totalElapsedHours)} elapsed
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Transit (Team)</dt>
          <dd className="font-medium tabular-nums">{fmtDays(team.transitDays)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Fuel (est. @ 6 MPG)</dt>
          <dd className="font-medium tabular-nums">~{Math.round(fuelGallons)} gal</dd>
        </div>
      </dl>
    </section>
  );
}
