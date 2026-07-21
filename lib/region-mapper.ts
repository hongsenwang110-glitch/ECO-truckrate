import { ATRI, STATE_TO_REGION } from "@/lib/constants";

export function regionForState(state: string): keyof typeof ATRI.regionTotalsPerMile {
  return STATE_TO_REGION[state.toUpperCase()] ?? "midwest";
}

/** MVP: 50/50 blend of origin and destination regions */
export function blendedRegionalPerMile(originState: string, destState: string) {
  const o = regionForState(originState);
  const d = regionForState(destState);
  const originRate = ATRI.regionTotalsPerMile[o];
  const destRate = ATRI.regionTotalsPerMile[d];
  const blended = (originRate + destRate) / 2;
  const label =
    o === d
      ? `${formatRegion(o)} ($${originRate.toFixed(3)}/mi)`
      : `50% ${formatRegion(o)} + 50% ${formatRegion(d)}`;
  return { blended, originRate, destRate, originRegion: o, destRegion: d, label };
}

function formatRegion(r: string) {
  return r.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
