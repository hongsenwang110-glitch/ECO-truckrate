"use client";

import { calculateFSC } from "@/lib/fuel-surcharge";
import { fmtPerMile } from "@/lib/format";
import type { FuelPriceResult } from "@/lib/types";

interface FuelSurchargeProps {
  fuel: FuelPriceResult;
  distanceMiles: number;
}

export function FuelSurcharge({ fuel, distanceMiles }: FuelSurchargeProps) {
  const { fscPerMile, baseDiesel, mpg } = calculateFSC(fuel.price);
  const totalFsc = fscPerMile * distanceMiles;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Fuel Surcharge (DOE schedule)
      </h2>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">National diesel</dt>
          <dd className="font-medium tabular-nums">
            ${fuel.price.toFixed(3)}/gal
            {fuel.source === "fallback" && (
              <span className="ml-1 text-xs text-amber-600">(fallback)</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">FSC base</dt>
          <dd className="font-medium tabular-nums">${baseDiesel.toFixed(2)}/gal @ {mpg} MPG</dd>
        </div>
        <div>
          <dt className="text-slate-500">FSC rate</dt>
          <dd className="font-medium tabular-nums">{fmtPerMile(fscPerMile)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Lane FSC total</dt>
          <dd className="font-medium tabular-nums">${totalFsc.toFixed(0)}</dd>
        </div>
      </dl>
    </section>
  );
}
