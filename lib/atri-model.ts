import { ATRI } from "@/lib/constants";
import { fuelAdjustmentRatio } from "@/lib/fuel-surcharge";
import { blendedRegionalPerMile } from "@/lib/region-mapper";
import type { CostBreakdown } from "@/lib/types";

export function calculateAtriCost(
  distanceMiles: number,
  originState: string,
  destState: string,
  dieselPrice: number,
): CostBreakdown {
  const lineItems = { ...ATRI.costsPerMile };
  const basePerMile = ATRI.totalPerMile;

  const { blended, label } = blendedRegionalPerMile(originState, destState);
  const regionMultiplier = blended / ATRI.nationalAvgPerMile;
  const ratio = fuelAdjustmentRatio(dieselPrice, ATRI.baselineDieselGal);

  const adjustedLineItems: Record<string, number> = {};
  for (const [key, value] of Object.entries(lineItems)) {
    adjustedLineItems[key] =
      key === "fuel" ? value * regionMultiplier * ratio : value * regionMultiplier;
  }

  const adjustedPerMile = Object.values(adjustedLineItems).reduce((a, b) => a + b, 0);
  const totalCost = adjustedPerMile * distanceMiles;
  const teamPerMile = adjustedPerMile + ATRI.driverTotalPerMile;
  const teamTotalCost = teamPerMile * distanceMiles;

  return {
    lineItems: adjustedLineItems,
    basePerMile,
    regionAdjustedPerMile: blended,
    fuelAdjustedPerMile: adjustedLineItems.fuel,
    adjustedPerMile,
    totalCost,
    teamPerMile,
    teamTotalCost,
    regionLabel: label,
    dieselPrice,
    fuelAdjustmentRatio: ratio,
  };
}

export function rateColor(perMile: number) {
  if (perMile < 2.0) return "text-emerald-600";
  if (perMile <= 2.6) return "text-amber-600";
  return "text-red-600";
}
