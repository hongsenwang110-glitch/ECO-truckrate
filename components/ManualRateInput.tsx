"use client";

interface ManualRateInputProps {
  spot: string;
  contract: string;
  onSpotChange: (value: string) => void;
  onContractChange: (value: string) => void;
  distanceMiles: number;
}

function parseRate(value: string) {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function ManualRateInput({
  spot,
  contract,
  onSpotChange,
  onContractChange,
  distanceMiles,
}: ManualRateInputProps) {
  const spotNum = parseRate(spot);
  const contractNum = parseRate(contract);

  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Manual DAT Rate (optional)</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-500">Spot ($/mi or total)</span>
          <input
            value={spot}
            onChange={(e) => onSpotChange(e.target.value)}
            placeholder="e.g. 2.45 or 4800"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
          />
          {spotNum && distanceMiles > 0 && (
            <span className="text-xs text-slate-500">
              ≈{" "}
              {spotNum < 20
                ? `$${(spotNum * distanceMiles).toFixed(0)} total`
                : `$${(spotNum / distanceMiles).toFixed(3)}/mi`}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-500">Contract ($/mi or total)</span>
          <input
            value={contract}
            onChange={(e) => onContractChange(e.target.value)}
            placeholder="e.g. 2.20 or 4300"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
          />
          {contractNum && distanceMiles > 0 && (
            <span className="text-xs text-slate-500">
              ≈{" "}
              {contractNum < 20
                ? `$${(contractNum * distanceMiles).toFixed(0)} total`
                : `$${(contractNum / distanceMiles).toFixed(3)}/mi`}
            </span>
          )}
        </label>
      </div>
    </section>
  );
}
