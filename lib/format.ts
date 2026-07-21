export function fmtMoney(value: number, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function fmtPerMile(value: number) {
  return `$${value.toFixed(3)}/mi`;
}

export function fmtHours(hours: number) {
  return `${hours.toFixed(1)}h`;
}

export function fmtDays(days: number) {
  return `${days.toFixed(1)}d`;
}

export function fmtTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
