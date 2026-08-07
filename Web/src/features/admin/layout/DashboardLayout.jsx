import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import useSidebarStore from "../../../store/useSidebarStore";

export default function DashboardLayout() {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const close = useSidebarStore((s) => s.close);
  const { pathname } = useLocation();

  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#0B1220] text-slate-900 dark:text-white overflow-hidden">
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0B1220]">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}
