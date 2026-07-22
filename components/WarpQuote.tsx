"use client";

import { rateColor } from "@/lib/atri-model";
import { fmtMoney, fmtPerMile } from "@/lib/format";
import type { WarpQuoteResult } from "@/lib/types";

interface WarpQuoteProps {
  warp: WarpQuoteResult | null;
  loading: boolean;
  distanceMiles: number;
  atriTotal?: number;
}

export function WarpQuote({ warp, loading, distanceMiles, atriTotal }: WarpQuoteProps) {
  const perMile =
    warp && warp.price > 0
      ? warp.perMile > 0
        ? warp.perMile
        : warp.price / distanceMiles
      : 0;

  const marketLow = atriTotal != null ? atriTotal * 1.35 : null;
  const marketHigh = atriTotal != null ? atriTotal * 1.55 : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            三方价格对比
          </h2>
          <p className="text-xs text-slate-500">ATRI 成本底 → 市场区间 → Warp broker 上限</p>
        </div>
      </div>

      {loading && (
        <div className="animate-pulse space-y-2">
          <div className="h-6 w-full rounded bg-slate-200" />
          <div className="h-4 w-64 rounded bg-slate-100" />
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {atriTotal != null && (
            <div className="relative rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-slate-400" />
                  <span className="text-sm font-medium text-slate-600">ATRI 成本底</span>
                </div>
                <span className="text-sm font-bold tabular-nums text-slate-600">
                  {fmtMoney(atriTotal)}
                </span>
              </div>
              <p className="mt-1 pl-5 text-xs text-slate-400">
                Solo driver 行业平均运营成本
              </p>
            </div>
          )}

          {marketLow != null && marketHigh != null && (
            <div className="relative rounded-lg border-2 border-blue-300 bg-blue-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-blue-800">⭐ 市场参考区间</span>
                </div>
                <span className="text-sm font-bold tabular-nums text-blue-900">
                  {fmtMoney(marketLow)} – {fmtMoney(marketHigh)}
                </span>
              </div>
              <p className="mt-1 pl-5 text-xs text-blue-600">
                ATRI ×1.35~1.55 · 对标 DAT carrier posted rates
              </p>
            </div>
          )}

          {warp && !warp.error && warp.price > 0 && (
            <div className="relative rounded-lg bg-amber-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-amber-800">Warp Broker 报价</span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${rateColor(perMile)}`}>
                  {fmtMoney(warp.price)} ({fmtPerMile(perMile)})
                </span>
              </div>
              <p className="mt-1 pl-5 text-xs text-amber-600">
                Solo · all-in 全包价（含 broker markup ~20-30%）· {warp.transitDays} 天时效
              </p>
            </div>
          )}

          {warp?.error && (
            <p className="text-sm text-amber-700">Warp: {warp.error}</p>
          )}
        </div>
      )}

      <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2">
        <p className="text-xs text-slate-500">
          <strong>定价逻辑：</strong>ATRI = 行业运营成本均值（成本底）→ 
          市场估价 = carrier 实际挂牌（+35%~55% markup）→ 
          Warp = broker 全包报价（+20-30% on top）。
          建议报价参考蓝色「市场区间」，Warp 做上限参考。
        </p>
      </div>
    </section>
  );
}
