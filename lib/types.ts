export type DriveMode = "solo" | "team";

export interface ZipInfo {
  zip: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface RouteResponse {
  distanceMiles: number;
  durationSeconds: number;
  drivingHours: number;
  coordinates: [number, number][];
  origin: ZipInfo;
  destination: ZipInfo;
  source: "here" | "haversine";
  warning?: string;
}

export interface CostBreakdown {
  lineItems: Record<string, number>;
  basePerMile: number;
  regionAdjustedPerMile: number;
  fuelAdjustedPerMile: number;
  adjustedPerMile: number;
  totalCost: number;
  teamPerMile: number;
  teamTotalCost: number;
  regionLabel: string;
  dieselPrice: number;
  fuelAdjustmentRatio: number;
}

export interface TransitEstimate {
  drivingHours: number;
  transitDays: number;
  totalElapsedHours: number;
  resetHoursTotal?: number;
  resetBlocks?: number;
  driveHoursPerDay?: number;
  resetHoursPerBlock?: number;
}

export interface WarpQuoteResult {
  price: number;
  distanceMiles: number;
  transitDays: number;
  perMile: number;
  currency: string;
  quoteId?: string;
  quoteTier?: string;
  bookingUrl?: string;
  deliveryDate?: string;
  expiresAt?: string;
  error?: string;
}

export interface FuelPriceResult {
  price: number;
  period: string;
  source: "eia" | "fallback";
}

export interface QueryRecord {
  id: string;
  timestamp: string;
  originZip: string;
  destZip: string;
  originLabel: string;
  destLabel: string;
  distanceMiles: number;
  mode: DriveMode;
  atriTotal: number;
  atriPerMile: number;
  teamTotal: number;
  warpPrice: number | null;
  warpPerMile: number | null;
  datSpot: number | null;
  datContract: number | null;
}

export interface CalculateResult {
  route: RouteResponse;
  cost: CostBreakdown;
  transitSolo: TransitEstimate;
  transitTeam: TransitEstimate;
  fscPerMile: number;
  fuel: FuelPriceResult;
  warp: WarpQuoteResult | null;
}
