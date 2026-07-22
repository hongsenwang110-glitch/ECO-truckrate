export interface MarketMultiplierTier {
  label: string;
  low: number;
  mid: number;
  high: number;
}

/** Distance-tiered markup over ATRI cost — long haul uses lower multipliers. */
export function getMarketMultipliers(distanceMiles: number): MarketMultiplierTier {
  if (distanceMiles < 1500) {
    return { label: "<1,500 mi", low: 1.38, mid: 1.48, high: 1.55 };
  }
  if (distanceMiles <= 2200) {
    return { label: "1,500–2,200 mi", low: 1.33, mid: 1.4, high: 1.48 };
  }
  return { label: ">2,200 mi", low: 1.28, mid: 1.36, high: 1.42 };
}

export function estimateMarketRange(
  atriTotal: number,
  atriPerMile: number,
  distanceMiles: number,
) {
  const tier = getMarketMultipliers(distanceMiles);
  return {
    tier,
    lowTotal: atriTotal * tier.low,
    midTotal: atriTotal * tier.mid,
    highTotal: atriTotal * tier.high,
    lowPerMile: atriPerMile * tier.low,
    midPerMile: atriPerMile * tier.mid,
    highPerMile: atriPerMile * tier.high,
  };
}
