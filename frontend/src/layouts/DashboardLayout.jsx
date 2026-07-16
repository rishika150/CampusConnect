import { Outlet } from "react-router-dom";
import MobileNavigation from "../components/MobileNavigation";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <Sidebar />

      <div className="min-h-screen lg:pl-[258px]">
        <Topbar />

        <main className="px-5 pb-28 pt-7 sm:px-7 lg:px-9 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}