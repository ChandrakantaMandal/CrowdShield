
import StatsCards from "../components/StatsCards";
import CrowdMap from "../components/CrowdMap";
import CameraFeed from "../components/CameraFeed";
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

        {/* Right Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <CameraFeed />
          <Alerts />
        </div>
      </div>
    </div>
  );
}
