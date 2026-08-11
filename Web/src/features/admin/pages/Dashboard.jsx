
import StatsCards from "../components/StatsCards";
import CrowdMap from "../components/CrowdMap";
import CameraFeed from "../components/CameraFeed";
import TelemetryPanel from "../components/TelemetryPanel";
import Alerts from "../components/Alerts";

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-8">
      <StatsCards />

      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Map */}
        <div className="col-span-12 lg:col-span-8">
          <CrowdMap />
        </div>

        {/* Camera Feed */}
        <div className="col-span-12 lg:col-span-4">
          <CameraFeed />
        </div>
      </div>

      {/* Alerts + Telemetry (below the map) */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-12 lg:col-span-6">
          <Alerts />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <TelemetryPanel />
        </div>
      </div>
    </div>
  );
}
