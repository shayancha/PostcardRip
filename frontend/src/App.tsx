import { useState } from "react";
import Map from "./components/Map";
import type { VehicleType } from "./types";
import "./App.css";

const VEHICLE_LABELS: Record<VehicleType, string> = {
  passenger: "Car / SUV",
  motorcycle: "Motorcycle",
  small_truck: "Small Truck",
  large_truck: "Large Truck / Bus",
  taxi: "Taxi / Rideshare",
};

export default function App() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("passenger");
  const [departureTime, setDepartureTime] = useState<Date>(new Date());

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    setDepartureTime(d);
  };

  const timeValue = `${String(departureTime.getHours()).padStart(2, "0")}:${String(
    departureTime.getMinutes()
  ).padStart(2, "0")}`;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>NYC Congestion Pricing Navigator</h1>
            <p className="header-subtitle">
              Plan your trip and understand your toll costs
            </p>
          </div>
          <div className="header-controls">
            <label className="control-label">
              Vehicle
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              >
                {(Object.keys(VEHICLE_LABELS) as VehicleType[]).map((v) => (
                  <option key={v} value={v}>
                    {VEHICLE_LABELS[v]}
                  </option>
                ))}
              </select>
            </label>
            <label className="control-label">
              Departure
              <input type="time" value={timeValue} onChange={handleTimeChange} />
            </label>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Map vehicleType={vehicleType} departureTime={departureTime} />
      </main>
    </div>
  );
}