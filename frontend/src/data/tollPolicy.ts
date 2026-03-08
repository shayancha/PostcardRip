import type { VehicleType } from "../types";

/**
 * NYC Congestion Relief Zone — MTA Baseline Toll Policy
 * Effective January 5, 2025.
 *
 * Sources:
 *   https://congestionreliefzone.mta.info/tolling
 *   https://www.uppernyack-ny.us/home/news/mta-what-know-about-congestion-relief-zone-toll-rates
 *
 * Peak periods:
 *   Weekdays  — 5:00 AM to 9:00 PM
 *   Weekends  — 9:00 AM to 9:00 PM
 * Overnight:
 *   All other hours (75% discount off peak rate)
 *
 * Passenger vehicles & motorcycles: charged once per calendar day.
 * Trucks: charged per entry.
 * Taxis / FHV: charged per trip (flat, no time-of-day variation).
 *
 * Crossing credits (E-ZPass, peak only) for vehicles entering via
 * Lincoln Tunnel, Holland Tunnel, Queens-Midtown Tunnel, or Hugh L. Carey Tunnel:
 *   Passenger car  — up to $3.00
 *   Motorcycle     — up to $1.50
 *   Small truck    — up to $7.20
 *   Large truck    — up to $12.00
 */

export interface VehicleRateConfig {
  /** Toll during peak hours */
  peak: number;
  /** Toll during overnight hours */
  overnight: number;
  /** If true, charged at most once per calendar day */
  dailyCap: boolean;
  /** Crossing credit applied when using a tolled tunnel entry (peak only) */
  crossingCredit: number;
}

export interface PerTripRateConfig {
  /** Flat per-trip surcharge, same all hours */
  perTrip: number;
}

export type RateConfig = VehicleRateConfig | PerTripRateConfig;

export function isPerTrip(r: RateConfig): r is PerTripRateConfig {
  return "perTrip" in r;
}

export interface TollPolicy {
  name: string;
  description: string;
  /** Weekday peak window: hour of day (0-23, inclusive start, exclusive end) */
  weekdayPeak: { start: number; end: number };
  /** Weekend peak window */
  weekendPeak: { start: number; end: number };
  rates: Record<VehicleType, RateConfig>;
}

export const MTA_BASELINE: TollPolicy = {
  name: "MTA Baseline (2025)",
  description:
    "Current NYC Congestion Relief Zone toll policy effective January 5, 2025. " +
    "Peak rate for passenger cars is $9. Scheduled to rise to $12 in 2028 and $15 in 2031.",

  // Weekdays: peak 5 AM – 9 PM
  weekdayPeak: { start: 5, end: 21 },
  // Weekends: peak 9 AM – 9 PM
  weekendPeak: { start: 9, end: 21 },

  rates: {
    passenger: {
      peak: 9.0,
      overnight: 2.25,
      dailyCap: true,
      crossingCredit: 3.0,
    },
    motorcycle: {
      peak: 4.5,
      overnight: 1.05,
      dailyCap: true,
      crossingCredit: 1.5,
    },
    small_truck: {
      peak: 14.4,
      overnight: 3.6,
      dailyCap: false,
      crossingCredit: 7.2,
    },
    large_truck: {
      peak: 21.6,
      overnight: 5.4,
      dailyCap: false,
      crossingCredit: 12.0,
    },
    taxi: {
      // Taxi surcharge is per-trip, same all hours
      perTrip: 0.75,
    },
  },
};
