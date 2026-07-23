import { NextRequest, NextResponse } from "next/server";
import { normalizeZip } from "@/lib/zip-lookup";
import type { WarpQuoteResult } from "@/lib/types";

function pickupDateCandidates() {
  const offsets = [3, 5, 7, 10];
  return offsets.map((days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  });
}

async function requestWarpQuote(
  origin_zip: string,
  destination_zip: string,
  pickup_date: string,
  useApiKey: boolean,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (useApiKey && process.env.WARP_API_KEY) {
    headers.Authorization = `Bearer ${process.env.WARP_API_KEY}`;
  }

  const res = await fetch("https://www.wearewarp.com/api/v1/ftl/quote", {
    method: "POST",
    headers,
    body: JSON.stringify({ origin_zip, destination_zip, pickup_date }),
    cache: "no-store",
  });

  const data = await res.json();
  return { res, data };
}

function parseWarpSuccess(
  data: Record<string, unknown>,
  routeMiles: number,
  pickup_date: string,
): WarpQuoteResult | null {
  const price = Number(data.price_usd ?? data.price ?? data.total_price ?? 0);
  if (price <= 0) return null;

  const distanceMiles = Number(
    data.distance_miles ?? data.distance ?? data.miles ?? routeMiles,
  );
  const transitDays = Number(
    data.transit_days ?? data.transitDays ?? (data.service as { transit_days?: number })?.transit_days ?? 0,
  );

  return {
    price,
    distanceMiles,
    transitDays,
    perMile: distanceMiles > 0 ? price / distanceMiles : 0,
    currency: String(data.currency ?? "USD"),
    quoteId: data.quote_id as string | undefined,
    quoteTier: data.quote_tier as string | undefined,
    bookingUrl: data.booking_url as string | undefined,
    deliveryDate: data.delivery_date as string | undefined,
    expiresAt: data.expires_at as string | undefined,
    pickupDate: pickup_date,
  };
}

function parseWarpError(data: Record<string, unknown>, status: number) {
  return String(
    data.error ?? data.message ?? `Warp API ${status}`,
  );
}

export async function POST(request: NextRequest) {
  let body: {
    origin_zip?: string;
    destination_zip?: string;
    pickup_date?: string;
    distance_miles?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const origin_zip = normalizeZip(body.origin_zip ?? "");
  const destination_zip = normalizeZip(body.destination_zip ?? "");
  const routeMiles = Number(body.distance_miles ?? 0);

  if (origin_zip.length !== 5 || destination_zip.length !== 5) {
    return NextResponse.json({ error: "Invalid ZIP codes" }, { status: 400 });
  }

  const dates = body.pickup_date
    ? [body.pickup_date, ...pickupDateCandidates()]
    : pickupDateCandidates();
  const uniqueDates = [...new Set(dates)];

  let lastError = "Warp quote unavailable";

  try {
    for (const pickup_date of uniqueDates) {
      for (const useApiKey of [Boolean(process.env.WARP_API_KEY), false]) {
        const { res, data } = await requestWarpQuote(
          origin_zip,
          destination_zip,
          pickup_date,
          useApiKey,
        );

        const parsed = parseWarpSuccess(data as Record<string, unknown>, routeMiles, pickup_date);
        if (res.ok && parsed) {
          return NextResponse.json(parsed);
        }

        lastError = parseWarpError(data as Record<string, unknown>, res.status);
      }
    }

    const result: WarpQuoteResult = {
      price: 0,
      distanceMiles: routeMiles,
      transitDays: 0,
      perMile: 0,
      currency: "USD",
      error: lastError,
    };
    return NextResponse.json(result);
  } catch (err) {
    const result: WarpQuoteResult = {
      price: 0,
      distanceMiles: routeMiles,
      transitDays: 0,
      perMile: 0,
      currency: "USD",
      error: err instanceof Error ? err.message : "Warp request failed",
    };
    return NextResponse.json(result);
  }
}
