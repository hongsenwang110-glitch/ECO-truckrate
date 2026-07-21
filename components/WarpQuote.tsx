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
  const margin =
    warp && warp.price > 0 && atriTotal != null ? warp.price - atriTotal : null;

  return (
    <section className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
            市场报价 · Warp FTL
          </h2>
          <p className="text-xs text-emerald-700">真实可订全包价（含 FSC）· 报价参考首选</p>
        </div>
        <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-900">
          {warp?.quoteTier ?? "Warp Network"}
        </span>
      </div>

      {loading && (
        <div className="animate-pulse space-y-2">
          <div className="h-10 w-48 rounded bg-emerald-200" />
          <div className="h-4 w-64 rounded bg-emerald-100" />
        </div>
      )}

      {!loading && warp?.error && (
        <p className="text-sm text-amber-800">Warp 报价失败: {warp.error}</p>
      )}

      {!loading && warp && !warp.error && warp.price > 0 && (
        <>
          <p className={`text-4xl font-bold tabular-nums ${rateColor(perMile)}`}>
            {fmtMoney(warp.price, 2)}
          </p>
          <p className={`mt-1 text-base tabular-nums ${rateColor(perMile)}`}>
            {fmtPerMile(perMile)} · all-in · {warp.transitDays} 天时效
          </p>
          {margin != null && (
            <p
              className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                margin >= 0 ? "bg-white text-emerald-900" : "bg-red-100 text-red-800"
              }`}
            >
              vs ATRI 成本 {fmtMoney(atriTotal ?? 0)} →{" "}
              <strong>{margin >= 0 ? "+" : ""}{fmtMoney(margin, 0)}</strong>{" "}
              {margin >= 0 ? "价差空间" : "低于成本"}
            </p>
          )}
          {warp.bookingUrl && (
            <a
              href={warp.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
            >
              在 Warp 查看/预订 →
            </a>
          )}
        </>
      )}

      {!loading && (!warp || warp.error || warp.price <= 0) && !warp?.error && (
        <p className="text-sm text-emerald-800">该 lane 暂无 Warp 报价返回。</p>
      )}

      <p className="mt-3 text-xs text-emerald-700/80">
        单一渠道参考价，非 DAT 全市场均价。ATRI 为行业成本底，Warp 更接近实际采购价。
      </p>
    </section>
  );
}
