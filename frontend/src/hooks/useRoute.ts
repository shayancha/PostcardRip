import { useState, useCallback } from "react";
import type { RouteResult } from "../types";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

// Manhattan bounding box (approximate island bounds)
const MANHATTAN_LON_MIN = -74.03;
const MANHATTAN_LON_MAX = -73.90;
const MANHATTAN_LAT_MIN = 40.70;
// 60th Street sits at approximately 40.7637° N — use a small buffer
const STREET_60_LAT = 40.7650;

// Roads explicitly excluded from the CRZ by the 2019 legislation:
//   FDR Drive, West Side Highway / Route 9A, Hugh L. Carey Tunnel connections to West Street
const EXCLUDED_ROAD_PATTERNS = [
  /\bfdr\b/i,
  /fdr\s*drive/i,
  /west\s+side\s+(highway|hwy)/i,
  /joe\s+dimag+io\s+(highway|hwy)/i,
  /route\s*9\s*a\b/i,
  /\bny-?9a\b/i,
  /\b9a\b/i,
  /hugh\s+l\.?\s+carey/i,
  /brooklyn[- ]battery\s+tunnel/i,
  /battery\s+tunnel/i,
];

function isExcludedRoad(name: string): boolean {
  return EXCLUDED_ROAD_PATTERNS.some((re) => re.test(name));
}

/**
 * Returns true if the [lon, lat] coordinate is within Manhattan at or below 60th Street.
 * This is the geographic definition of the Congestion Relief Zone boundary.
 */
function isInCRZBounds(lon: number, lat: number): boolean {
  return (
    lon >= MANHATTAN_LON_MIN &&
    lon <= MANHATTAN_LON_MAX &&
    lat >= MANHATTAN_LAT_MIN &&
    lat <= STREET_60_LAT
  );
}


/**
 * Inspect all route steps returned by the Mapbox Directions API.
 * A route enters the CRZ if any step's intersection lies within Manhattan
 * at or below 60th Street, on a road that is not explicitly excluded
 * by the 2019 CRZ legislation.
 *
 * Returns { entersZone, entryPoint } where entryPoint is the name of the
 * nearest toll collection point to the first CRZ intersection detected.
 */
function detectCRZ(legs: MapboxLeg[]): boolean {
  for (const leg of legs) {
    for (const step of leg.steps ?? []) {
      const roadName: string = step.name ?? "";
      if (isExcludedRoad(roadName)) continue;

      for (const intersection of step.intersections ?? []) {
        const [lon, lat] = intersection.location as [number, number];
        if (isInCRZBounds(lon, lat)) return true;
      }
    }
  }
  return false;
}

interface MapboxIntersection {
  location: [number, number];
}

interface MapboxStep {
  name?: string;
  intersections?: MapboxIntersection[];
}

interface MapboxLeg {
  steps?: MapboxStep[];
}

export function useRoute() {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = useCallback(
    async (origin: [number, number], destination: [number, number]) => {
      setLoading(true);
      setError(null);
      try {
        const url =
          `https://api.mapbox.com/directions/v5/mapbox/driving/` +
          `${origin[0]},${origin[1]};${destination[0]},${destination[1]}` +
          `?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Routing request failed");
        const data = await res.json();
        if (!data.routes?.length) throw new Error("No route found");

        const r = data.routes[0];
        const geometry: GeoJSON.LineString = r.geometry;

        // Detect CRZ entry by inspecting road names and coordinates in route steps
        const entersZone = detectCRZ(r.legs ?? []);

        const result: RouteResult = {
          geometry,
          durationSeconds: r.duration,
          distanceMeters: r.distance,
          entersZone,
        };
        setRoute(result);
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { route, loading, error, fetchRoute };
}
