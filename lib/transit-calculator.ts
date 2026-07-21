import { AVG_TRUCK_SPEED_MPH } from "@/lib/constants";
import type { DriveMode, TransitEstimate } from "@/lib/types";

export function calculateTransit(
  distanceMiles: number,
  mode: DriveMode,
): TransitEstimate {
  const windshieldHours = distanceMiles / AVG_TRUCK_SPEED_MPH;

  if (mode === "team") {
    const effectiveDriveHoursPerDay = 21;
    const transitDays = windshieldHours / effectiveDriveHoursPerDay;
    return {
      drivingHours: windshieldHours,
      transitDays,
      totalElapsedHours: windshieldHours * 1.1,
    };
  }

  const driveHoursPerDay = 11;
  const resetHours = 10;
  const drivingDays = Math.max(1, Math.ceil(windshieldHours / driveHoursPerDay));
  const totalHours = windshieldHours + (drivingDays - 1) * resetHours;

  return {
    drivingHours: windshieldHours,
    transitDays: drivingDays,
    totalElapsedHours: totalHours,
  };
}
