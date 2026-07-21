import { NextRequest, NextResponse } from "next/server";
import { decode } from "@here/flexpolyline";
import { haversineMiles, lookupZip, normalizeZip } from "@/lib/zip-lookup";
import type { RouteResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const originZip = normalizeZip(request.nextUrl.searchParams.get("origin") ?? "");
  const destZip = normalizeZip(request.nextUrl.searchParams.get("dest") ?? "");

  const origin = lookupZip(originZip);
  const destination = lookupZip(destZip);

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "Invalid origin or destination ZIP code" },
      { status: 400 },
    );
  }

  const apiKey = process.env.HERE_API_KEY;
  if (!apiKey) {
    const straight = haversineMiles(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude,
    );
    const distanceMiles = straight * 1.25;
    const durationSeconds = (distanceMiles / 55) * 3600;
    const response: RouteResponse = {
      distanceMiles,
      durationSeconds,
      drivingHours: durationSeconds / 3600,
      coordinates: [
        [origin.longitude, origin.latitude],
        [destination.longitude, destination.latitude],
      ],
      origin,
      destination,
      source: "haversine",
      warning:
        "HERE_API_KEY 未配置 · 使用 ZIP 直线距离 ×1.25 估算 · 请配置 .env.local",
    };
    return NextResponse.json(response);
  }

  const params = new URLSearchParams({
    transportMode: "truck",
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    "truck[axleCount]": "5",
    "truck[trailersCount]": "1",
    "truck[height]": "400",
    "truck[width]": "260",
    "truck[length]": "1600",
    "truck[grossWeight]": "36287",
    return: "summary,polyline",
    apiKey,
  });

  const hereRes = await fetch(
    `https://router.hereapi.com/v8/routes?${params.toString()}`,
  );

  if (!hereRes.ok) {
    const text = await hereRes.text();
    return NextResponse.json(
      { error: `HERE Routing failed: ${text.slice(0, 300)}` },
      { status: 502 },
    );
  }

  const data = await hereRes.json();
  const section = data?.routes?.[0]?.sections?.[0];
  if (!section?.summary) {
    return NextResponse.json({ error: "No route returned from HERE" }, { status: 502 });
  }

  const distanceMiles = section.summary.length / 1609.34;
  const durationSeconds = section.summary.duration;
  let coordinates: [number, number][] = [
    [origin.longitude, origin.latitude],
    [destination.longitude, destination.latitude],
  ];

  if (section.polyline) {
    try {
      const decoded = decode(section.polyline);
      coordinates = decoded.polyline.map(
        (p) => [p[1], p[0]] as [number, number],
      );
    } catch {
      /* keep fallback line */
    }
  }

  const response: RouteResponse = {
    distanceMiles,
    durationSeconds,
    drivingHours: durationSeconds / 3600,
    coordinates,
    origin,
    destination,
    source: "here",
  };

  return NextResponse.json(response);
}
