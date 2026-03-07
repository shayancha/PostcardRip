export type VehicleType = "passenger" | "motorcycle" | "small_truck" | "large_truck" | "taxi";

export interface RouteResult {
  geometry: GeoJSON.LineString;
  durationSeconds: number;
  distanceMeters: number;
  entersZone: boolean;
}

export interface TripDetails {
  origin: string;
  destination: string;
  originCoords: [number, number];
  destinationCoords: [number, number];
  vehicleType: VehicleType;
  departureTime: Date;
  route: RouteResult | null;
}
