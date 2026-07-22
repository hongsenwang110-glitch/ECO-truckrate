"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ZipInput } from "@/components/ZipInput";
import { CostBreakdown } from "@/components/CostBreakdown";
import { TransitEstimate } from "@/components/TransitEstimate";
import { WarpQuote } from "@/components/WarpQuote";
import { ManualRateInput } from "@/components/ManualRateInput";
import { RouteMap } from "@/components/RouteMap";
import { FuelSurcharge } from "@/components/FuelSurcharge";
import { QueryHistory } from "@/components/QueryHistory";
import { calculateAtriCost } from "@/lib/atri-model";
import { calculateTransit } from "@/lib/transit-calculator";
import { HISTORY_STORAGE_KEY } from "@/lib/constants";
import { fmtMoney, fmtPerMile } from "@/lib/format";
import type {
  CalculateResult,
  DriveMode,
  FuelPriceResult,
  QueryRecord,
  RouteResponse,
  WarpQuoteResult,
} from "@/lib/types";

const TEST_LANES = [
  { origin: "92337", dest: "60466", label: "LAX → CHI" },
  { origin: "92337", dest: "77032", label: "LAX → HOU" },
  { origin: "92337", dest: "07114", label: "LAX → EWR" },
];

function parseManualRate(value: string, distanceMiles: number) {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n < 20 ? n * distanceMiles : n;
}

export default function TruckRateCalculator() {
  const [originZip, setOriginZip] = useState("92337");
  const [destZip, setDestZip] = useState("60466");
  const [mode, setMode] = useState<DriveMode>("solo");
  const [loading, setLoading] = useState(false);
  const [warpLoading, setWarpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculateResult | null>(null);
  const [history, setHistory] = useState<QueryRecord[]>([]);
  const [datSpot, setDatSpot] = useState("");
  const [datContract, setDatContract] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    fetch("/api/queries")
      .then((r) => r.json())
      .then((rows: QueryRecord[]) => {
        if (Array.isArray(rows) && rows.length) setHistory(rows);
      })
      .catch(() => undefined);
  }, []);

  const persistHistory = useCallback((rows: QueryRecord[]) => {
    setHistory(rows);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(rows.slice(0, 50)));
  }, []);

  const handleCalculate = async () => {
    setError(null);
    setLoading(true);
    setWarpLoading(true);

    try {
      const routeRes = await fetch(
        `/api/route?origin=${encodeURIComponent(originZip)}&dest=${encodeURIComponent(destZip)}`,
      );
      const route: RouteResponse & { error?: string } = await routeRes.json();
      if (!routeRes.ok) throw new Error(route.error ?? "Route lookup failed");

      const fuelRes = await fetch("/api/fuel-price");
      const fuel: FuelPriceResult = await fuelRes.json();

      const cost = calculateAtriCost(
        route.distanceMiles,
        route.origin.state,
        route.destination.state,
        fuel.price,
      );
      const transitSolo = calculateTransit(route.distanceMiles, "solo");
      const transitTeam = calculateTransit(route.distanceMiles, "team");
      const fsc = (await import("@/lib/fuel-surcharge")).calculateFSC(fuel.price);

      const calc: CalculateResult = {
        route,
        cost,
        transitSolo,
        transitTeam,
        fscPerMile: fsc.fscPerMile,
        fuel,
        warp: null,
      };
      setResult(calc);
      setLoading(false);

      let warp: WarpQuoteResult | null = null;
      try {
        const warpRes = await fetch("/api/warp-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin_zip: originZip,
            destination_zip: destZip,
            distance_miles: route.distanceMiles,
          }),
        });
        warp = await warpRes.json();
      } catch {
        warp = null;
      }
      setWarpLoading(false);
      setResult((prev) => (prev ? { ...prev, warp } : prev));

      const warpPerMile =
        warp && !warp.error && warp.price > 0
          ? warp.perMile > 0
            ? warp.perMile
            : warp.price / route.distanceMiles
          : null;

      const record: QueryRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        originZip,
        destZip,
        originLabel: `${route.origin.city}, ${route.origin.state}`,
        destLabel: `${route.destination.city}, ${route.destination.state}`,
        distanceMiles: route.distanceMiles,
        mode,
        atriTotal: cost.totalCost,
        atriPerMile: cost.adjustedPerMile,
        teamTotal: cost.teamTotalCost,
        warpPrice: warp && !warp.error && warp.price > 0 ? warp.price : null,
        warpPerMile: warpPerMile,
        datSpot: parseManualRate(datSpot, route.distanceMiles),
        datContract: parseManualRate(datContract, route.distanceMiles),
      };

      const next = [record, ...history.filter((h) => h.id !== record.id)].slice(0, 50);
      persistHistory(next);
      fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      }).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed");
      setLoading(false);
      setWarpLoading(false);
    }
  };

  const activeTotal = useMemo(() => {
    if (!result) return null;
    return mode === "team" ? result.cost.teamTotalCost : result.cost.totalCost;
  }, [result, mode]);

  const activePerMile = useMemo(() => {
    if (!result) return null;
    return mode === "team" ? result.cost.teamPerMile : result.cost.adjustedPerMile;
  }, [result, mode]);

  const fuelGallons = result ? result.route.distanceMiles / 6 : 0;

  const warpPrice = result?.warp && !result.warp.error && result.warp.price > 0 ? result.warp.price : null;
  const warpPerMile =
    warpPrice && result
      ? result.warp!.perMile > 0
        ? result.warp!.perMile
        : warpPrice / result.route.distanceMiles
      : null;

  return (
    <div className="min-h-full bg-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">XLmiles ECO</p>
            <h1 className="text-xl font-semibold sm:text-2xl">干线报价模拟运算</h1>
            <p className="mt-1 text-sm text-slate-400">
              ATRI cost model · Warp market quote · Solo / Team compare
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEST_LANES.map((lane) => (
              <button
                key={lane.label}
                type="button"
                onClick={() => {
                  setOriginZip(lane.origin);
                  setDestZip(lane.dest);
                }}
                className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-400 hover:text-white"
              >
                {lane.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <ZipInput label="Origin ZIP" value={originZip} onChange={setOriginZip} placeholder="92337" />
            <ZipInput label="Dest ZIP" value={destZip} onChange={setDestZip} placeholder="60466" />
            <button
              type="button"
              onClick={handleCalculate}
              disabled={loading || originZip.length < 5 || destZip.length < 5}
              className="h-[46px] rounded-lg bg-slate-900 px-6 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Calculating…" : "Calculate"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="text-sm text-slate-500">Equipment: Dry Van 53&apos;</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Mode:</span>
              {(["solo", "team"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                    mode === m
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
        </section>

        {loading && !result && (
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        )}

        {result && (
          <>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {result.route.origin.city}, {result.route.origin.state} →{" "}
                    {result.route.destination.city}, {result.route.destination.state}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {result.route.distanceMiles.toFixed(0)} mi · {mode} mode ·{" "}
                    {result.route.source === "here" ? "HERE truck route" : "estimated distance"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ATRI 成本底
                  </p>
                  {activeTotal != null && activePerMile != null && (
                    <>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-700">
                        {fmtMoney(activeTotal)}
                      </p>
                      <p className="text-sm tabular-nums text-slate-500">{fmtPerMile(activePerMile)}</p>
                      <p className="mt-1 text-xs text-slate-400">行业运营成本均值</p>
                    </>
                  )}
                </div>

                <div className="rounded-xl border-2 border-blue-400 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                    ⭐ 市场估价区间
                  </p>
                  {activeTotal != null && (
                    <>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-blue-900">
                        {fmtMoney(activeTotal * 1.35)} – {fmtMoney(activeTotal * 1.55)}
                      </p>
                      <p className="text-sm tabular-nums text-blue-700">
                        {fmtPerMile((activePerMile ?? 0) * 1.35)} – {fmtPerMile((activePerMile ?? 0) * 1.55)}
                      </p>
                      <p className="mt-1 text-xs text-blue-600">ATRI ×1.35~1.55 (carrier 挂牌价)</p>
                    </>
                  )}
                </div>

                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                    Warp Broker 报价
                  </p>
                  {warpLoading ? (
                    <div className="mt-2 h-8 w-32 animate-pulse rounded bg-amber-200" />
                  ) : warpPrice ? (
                    <>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-amber-900">
                        {fmtMoney(warpPrice, 0)}
                      </p>
                      <p className="text-sm tabular-nums text-amber-700">
                        {warpPerMile ? fmtPerMile(warpPerMile) : ""} · all-in
                      </p>
                      <p className="mt-1 text-xs text-amber-600">含 broker markup ~20-30%</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-amber-700">
                      {result.warp?.error ? `Warp: ${result.warp.error}` : "加载中…"}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <WarpQuote
              warp={result.warp}
              loading={warpLoading}
              distanceMiles={result.route.distanceMiles}
              atriTotal={activeTotal ?? undefined}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <TransitEstimate
                solo={result.transitSolo}
                team={result.transitTeam}
                fuelGallons={fuelGallons}
              />
              <CostBreakdown cost={result.cost} mode={mode} distanceMiles={result.route.distanceMiles} />
            </div>

            <FuelSurcharge fuel={result.fuel} distanceMiles={result.route.distanceMiles} />

            <ManualRateInput
              spot={datSpot}
              contract={datContract}
              onSpotChange={setDatSpot}
              onContractChange={setDatContract}
              distanceMiles={result.route.distanceMiles}
            />

            <RouteMap route={result.route} />
          </>
        )}

        <QueryHistory rows={history} />
      </main>
    </div>
  );
}
