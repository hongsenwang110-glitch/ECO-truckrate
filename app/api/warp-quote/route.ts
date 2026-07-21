import { NextRequest, NextResponse } from "next/server";
import { normalizeZip } from "@/lib/zip-lookup";
import type { WarpQuoteResult } from "@/lib/types";

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
  const pickup_date =
    body.pickup_date ??
    new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  const routeMiles = Number(body.distance_miles ?? 0);

  if (origin_zip.length !== 5 || destination_zip.length !== 5) {
    return NextResponse.json({ error: "Invalid ZIP codes" }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (process.env.WARP_API_KEY) {
      headers.Authorization = `Bearer ${process.env.WARP_API_KEY}`;
    }

    const res = await fetch("https://www.wearewarp.com/api/v1/ftl/quote", {
      method: "POST",
      headers,
      body: JSON.stringify({ origin_zip, destination_zip, pickup_date }),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      const result: WarpQuoteResult = {
        price: 0,
        distanceMiles: routeMiles,
        transitDays: 0,
        perMile: 0,
        currency: "USD",
        error: data?.message ?? data?.error ?? `Warp API ${res.status}`,
      };
      return NextResponse.json(result, { status: 200 });
    }

    const price = Number(data.price_usd ?? data.price ?? data.total_price ?? 0);
    const distanceMiles = Number(
      data.distance_miles ?? data.distance ?? data.miles ?? routeMiles,
    );
    const transitDays = Number(
      data.transit_days ?? data.transitDays ?? data.service?.transit_days ?? 0,
    );

    const result: WarpQuoteResult = {
      price,
      distanceMiles,
      transitDays,
      perMile: distanceMiles > 0 ? price / distanceMiles : 0,
      currency: data.currency ?? "USD",
      quoteId: data.quote_id,
      quoteTier: data.quote_tier,
      bookingUrl: data.booking_url,
      deliveryDate: data.delivery_date,
      expiresAt: data.expires_at,
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
