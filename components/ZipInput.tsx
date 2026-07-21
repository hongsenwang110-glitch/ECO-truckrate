"use client";

import { lookupZip } from "@/lib/zip-lookup";

interface ZipInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ZipInput({ label, value, onChange, placeholder }: ZipInputProps) {
  const preview = value.length >= 5 ? lookupZip(value) : null;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={5}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-lg text-slate-900 outline-none ring-slate-400 transition focus:border-slate-500 focus:ring-2"
      />
      <p className="min-h-[1.25rem] text-sm text-slate-500">
        {preview ? `${preview.city}, ${preview.state}` : value.length > 0 ? "Invalid ZIP" : "\u00a0"}
      </p>
    </div>
  );
}
