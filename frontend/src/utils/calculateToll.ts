import type { VehicleType } from "../types";
import { MTA_BASELINE, isPerTrip } from "../data/tollPolicy";
import type { TollPolicy } from "../data/tollPolicy";

/**
 * Returns true if the given Date falls within a peak-hour window
 * according to the provided toll policy.
 */
export function isPeakHour(date: Date, policy: TollPolicy = MTA_BASELINE): boolean {
  const hour = date.getHours();
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6;
  const { start, end } = isWeekend ? policy.weekendPeak : policy.weekdayPeak;
  return hour >= start && hour < end;
}

export interface TollResult {
  /** Total toll amount in USD */
  amount: number;
  /** "peak" | "overnight" | "per-trip" */
  period: "peak" | "overnight" | "per-trip";
  /** True if vehicle is only charged once per day */
  dailyCap: boolean;
  /** Crossing credit available (0 if overnight or per-trip) */
  crossingCredit: number;
  /** Net toll after applying crossing credit */
  netAmount: number;
}

/**
 * Calculate the CRZ toll for a given vehicle type and departure time.
 * Returns null if the route does not enter the zone.
 */
export function calculateToll(
  vehicleType: VehicleType,
  departureTime: Date,
  entersZone: boolean,
  policy: TollPolicy = MTA_BASELINE
): TollResult | null {
  if (!entersZone) return null;

  const rate = policy.rates[vehicleType];

  if (isPerTrip(rate)) {
    return {
      amount: rate.perTrip,
      period: "per-trip",
      dailyCap: false,
      crossingCredit: 0,
      netAmount: rate.perTrip,
    };
  }

  const peak = isPeakHour(departureTime, policy);
  const amount = peak ? rate.peak : rate.overnight;
  const crossingCredit = peak ? rate.crossingCredit : 0;
  const netAmount = Math.max(0, amount - crossingCredit);

  return {
    amount,
    period: peak ? "peak" : "overnight",
    dailyCap: rate.dailyCap,
    crossingCredit,
    netAmount,
  };
}

/** Format a toll result into a human-readable string, e.g. "$9.00" */
export function formatToll(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
