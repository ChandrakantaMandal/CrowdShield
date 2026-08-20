import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import ProtectedRoute from "./ProtectedRoute";
import ErrorBoundary from "./ErrorBoundary";

const Login = lazy(() => import("../features/auth/pages/Login"));

const ResetPassword = lazy(
  () => import("../features/auth/pages/ResetPassword"),
);

const DashboardLayout = lazy(
  () => import("../features/admin/layout/DashboardLayout"),
);

const Dashboard = lazy(() => import("../features/admin/pages/Dashboard"));
const Heatmap = lazy(() => import("../features/admin/pages/Heatmap"));
const Cameras = lazy(() => import("../features/admin/pages/Cameras"));
const FloorPlans = lazy(() => import("../features/admin/pages/FloorPlans"));
const ExitGuidance = lazy(() => import("../features/admin/pages/ExitGuidance"));
const Alerts = lazy(() => import("../features/admin/pages/Alerts"));
const Settings = lazy(() => import("../features/admin/pages/Settings"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0B1220] text-slate-900 dark:text-white">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Dashboard />} />
  <Route path="heatmap" element={<Heatmap />} />
  <Route path="cameras" element={<Cameras />} />
  <Route path="floor-plans" element={<FloorPlans />} />
  <Route path="exit-guidance" element={<ExitGuidance />} />
  <Route path="alerts" element={<Alerts />} />
  <Route path="settings" element={<Settings />} />
</Route>
        </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
