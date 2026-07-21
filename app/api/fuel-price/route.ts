import { NextResponse } from "next/server";
import type { FuelPriceResult } from "@/lib/types";

const FALLBACK_DIESEL = 3.612;

export async function GET() {
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) {
    const result: FuelPriceResult = {
      price: FALLBACK_DIESEL,
      period: "fallback",
      source: "fallback",
    };
    return NextResponse.json(result);
  }

  const url = new URL("https://api.eia.gov/v2/petroleum/pri/gnd/data/");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("frequency", "weekly");
  url.searchParams.set("data[0]", "value");
  url.searchParams.append("facets[duoarea][]", "NUS");
  url.searchParams.append("facets[product][]", "EPD2D");
  url.searchParams.set("sort[0][column]", "period");
  url.searchParams.set("sort[0][direction]", "desc");
  url.searchParams.set("length", "1");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    const json = await res.json();
    const row = json?.response?.data?.[0];
    if (!row?.value) throw new Error("No EIA data");

    const result: FuelPriceResult = {
      price: Number(row.value),
      period: String(row.period),
      source: "eia",
    };
    return NextResponse.json(result);
  } catch {
    const result: FuelPriceResult = {
      price: FALLBACK_DIESEL,
      period: "fallback",
      source: "fallback",
    };
    return NextResponse.json(result);
  }
}
