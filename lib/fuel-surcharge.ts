const BASE_DIESEL = 1.2;
const MPG = 6.0;

export function calculateFSC(currentDieselPrice: number) {
  if (currentDieselPrice <= BASE_DIESEL) {
    return { fscPerMile: 0, baseDiesel: BASE_DIESEL, mpg: MPG };
  }
  const fscPerMile = (currentDieselPrice - BASE_DIESEL) / MPG;
  return { fscPerMile, baseDiesel: BASE_DIESEL, mpg: MPG };
}

export function fuelAdjustmentRatio(currentDiesel: number, baseline = 3.83) {
  return currentDiesel / baseline;
}
