"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { RouteResponse } from "@/lib/types";

interface RouteMapProps {
  route: RouteResponse | null;
}

export function RouteMap({ route }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [-98.5795, 39.8283],
      zoom: 3.5,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;

    const draw = () => {
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getSource("route")) map.removeSource("route");
      for (const id of ["origin", "dest"]) {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      }

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route.coordinates,
          },
        },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#2563eb",
          "line-width": 4,
          "line-opacity": 0.85,
        },
      });

      const addMarker = (id: string, coord: [number, number], color: string) => {
        map.addSource(id, {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: coord } },
        });
        map.addLayer({
          id,
          type: "circle",
          source: id,
          paint: { "circle-radius": 7, "circle-color": color, "circle-stroke-width": 2, "circle-stroke-color": "#fff" },
        });
      };

      addMarker("origin", [route.origin.longitude, route.origin.latitude], "#16a34a");
      addMarker("dest", [route.destination.longitude, route.destination.latitude], "#dc2626");

      const bounds = route.coordinates.reduce(
        (b, coord) => b.extend(coord as [number, number]),
        new maplibregl.LngLatBounds(route.coordinates[0], route.coordinates[0]),
      );
      map.fitBounds(bounds, { padding: 48, maxZoom: 7 });
    };

    if (map.isStyleLoaded()) draw();
    else map.once("load", draw);
  }, [route]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Route Map</h2>
        {route?.warning && <p className="mt-1 text-xs text-amber-700">{route.warning}</p>}
        {route && !route.warning && (
          <p className="mt-1 text-xs text-slate-500">
            {route.source === "here" ? "HERE truck routing" : "Estimated route"} ·{" "}
            {route.distanceMiles.toFixed(0)} mi
          </p>
        )}
      </div>
      <div ref={containerRef} className="h-[360px] w-full bg-slate-100" />
    </section>
  );
}
