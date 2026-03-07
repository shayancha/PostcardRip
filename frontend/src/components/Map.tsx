import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { useRoute } from "../hooks/useRoute";
import type { VehicleType } from "../types";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
mapboxgl.accessToken = MAPBOX_TOKEN;

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}

interface Props {
  vehicleType: VehicleType;
  departureTime: Date;
  onRouteChange?: (entersZone: boolean) => void;
}

export default function Map({ vehicleType: _vehicleType, departureTime: _departureTime, onRouteChange }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const originMarker = useRef<mapboxgl.Marker | null>(null);
  const destMarker = useRef<mapboxgl.Marker | null>(null);

  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  const { route, loading, error, fetchRoute } = useRoute();

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-73.98, 40.75],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      const m = map.current!;

      // Route source (empty until a route is fetched)
      m.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });

      m.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#2563eb",
          "line-width": 5,
          "line-opacity": 0.9,
        },
      });
    });
  }, []);

  // Update route on map whenever route state changes
  useEffect(() => {
    if (!map.current || !route) return;
    const m = map.current;

    const updateLayers = () => {
      const routeSource = m.getSource("route") as mapboxgl.GeoJSONSource | undefined;
      if (!routeSource) return;

      routeSource.setData({
        type: "Feature",
        properties: {},
        geometry: route.geometry,
      });

      // Fit map to route
      const coords = route.geometry.coordinates as [number, number][];
      if (coords.length) {
        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        m.fitBounds(bounds, { padding: 80 });
      }
    };

    if (m.isStyleLoaded()) {
      updateLayers();
    } else {
      m.once("load", updateLayers);
    }

    if (onRouteChange) {
      onRouteChange(route.entersZone);
    }
  }, [route, onRouteChange]);

  // Fetch route when both coords are set
  useEffect(() => {
    if (originCoords && destCoords) {
      fetchRoute(originCoords, destCoords);
    }
  }, [originCoords, destCoords, fetchRoute]);

  // Set up geocoders in DOM (imperative, Mapbox Geocoder doesn't have a React wrapper)
  useEffect(() => {
    const originEl = document.getElementById("geocoder-origin");
    const destEl = document.getElementById("geocoder-dest");
    if (!originEl || !destEl || originEl.childElementCount > 0) return;

    const originGeocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl as never,
      placeholder: "Origin address",
      countries: "us",
      proximity: { longitude: -73.98, latitude: 40.75 },
    });

    const destGeocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl as never,
      placeholder: "Destination address",
      countries: "us",
      proximity: { longitude: -73.98, latitude: 40.75 },
    });

    originGeocoder.addTo("#geocoder-origin");
    destGeocoder.addTo("#geocoder-dest");

    originGeocoder.on("result", (e) => {
      const coords = e.result.center as [number, number];
      setOriginCoords(coords);
      if (originMarker.current) originMarker.current.remove();
      originMarker.current = new mapboxgl.Marker({ color: "#16a34a" })
        .setLngLat(coords)
        .addTo(map.current!);
    });

    destGeocoder.on("result", (e) => {
      const coords = e.result.center as [number, number];
      setDestCoords(coords);
      if (destMarker.current) destMarker.current.remove();
      destMarker.current = new mapboxgl.Marker({ color: "#dc2626" })
        .setLngLat(coords)
        .addTo(map.current!);
    });

    originGeocoder.on("clear", () => {
      setOriginCoords(null);
      if (originMarker.current) { originMarker.current.remove(); originMarker.current = null; }
    });

    destGeocoder.on("clear", () => {
      setDestCoords(null);
      if (destMarker.current) { destMarker.current.remove(); destMarker.current = null; }
    });
  }, []);

  return (
    <div className="map-wrapper">
      {/* Search panel */}
      <div className="search-panel">
        <div className="search-row">
          <span className="dot dot-green" />
          <div id="geocoder-origin" className="geocoder-container" />
        </div>
        <div className="search-row">
          <span className="dot dot-red" />
          <div id="geocoder-dest" className="geocoder-container" />
        </div>

        {/* Route summary */}
        {loading && <div className="route-summary loading">Calculating route…</div>}
        {error && <div className="route-summary error">{error}</div>}
        {route && !loading && (
          <div className="route-summary">
            <div className="summary-row">
              <span>{formatDuration(route.durationSeconds)}</span>
              <span>{formatDistance(route.distanceMeters)}</span>
            </div>
            {route.entersZone ? (
              <div className="zone-badge zone-badge--enters">
                Enters Congestion Relief Zone
              </div>
            ) : (
              <div className="zone-badge zone-badge--clear">
                Does not enter Congestion Relief Zone
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map container */}
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}