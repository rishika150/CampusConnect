import { useState } from "react";
import { Outlet } from "react-router-dom";
import MobileNavigation from "../components/MobileNavigation";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f5fb]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <div
        className={[
          "min-h-screen transition-all duration-300",
          collapsed ? "lg:pl-[88px]" : "lg:pl-[272px]",
        ].join(" ")}
      >
        <Topbar />

        <main className="px-5 pb-28 pt-7 sm:px-7 lg:px-9 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}