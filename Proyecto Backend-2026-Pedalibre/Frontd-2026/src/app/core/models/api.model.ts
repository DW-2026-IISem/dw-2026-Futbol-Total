export type Money = number | string;
export type IsoDateTime = string;

export interface ApiError {
  error: string;
  detail?: string;
}

export function toNumber(value: Money): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new TypeError(`Invalid monetary value: ${String(value)}`);
  }
  return parsed;
}
