"use client";

import { rateColor } from "@/lib/atri-model";
import { fmtMoney, fmtPerMile } from "@/lib/format";
import { estimateMarketRange } from "@/lib/market-estimate";
import type { WarpQuoteResult } from "@/lib/types";

interface WarpQuoteProps {
  warp: WarpQuoteResult | null;
  loading: boolean;
  distanceMiles: number;
  atriTotal?: number;
  atriPerMile?: number;
}

export function WarpQuote({
  warp,
  loading,
  distanceMiles,
  atriTotal,
  atriPerMile,
}: WarpQuoteProps) {
  const perMile =
    warp && warp.price > 0
      ? warp.perMile > 0
        ? warp.perMile
        : warp.price / distanceMiles
      : 0;

  const market =
    atriTotal != null && atriPerMile != null
      ? estimateMarketRange(atriTotal, atriPerMile, distanceMiles)
      : null;

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

          {market && (
            <div className="relative rounded-lg border-2 border-blue-300 bg-blue-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-blue-800">⭐ 市场参考区间</span>
                </div>
                <span className="text-sm font-bold tabular-nums text-blue-900">
                  {fmtMoney(market.lowTotal)} – {fmtMoney(market.highTotal)}
                </span>
              </div>
              <p className="mt-1 pl-5 text-xs text-blue-600">
                {market.tier.label} · ATRI ×{market.tier.low}~{market.tier.high} · 推荐{" "}
                {fmtMoney(market.midTotal)} (×{market.tier.mid})
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
                Solo · all-in 全包价 · {warp.transitDays} 天时效 · 可用 ×0.8 粗估 carrier 价
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
          <strong>定价逻辑：</strong>市场系数按里程分段（长途 markup 更低）。
          &lt;1,500mi ×1.38~1.55 · 1,500–2,200mi ×1.33~1.48 · &gt;2,200mi ×1.28~1.42。
          建议报价用蓝色「推荐」中位值，Warp 做上限参考。
        </p>
      </div>
    </section>
  );
}
