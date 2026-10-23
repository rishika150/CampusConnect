import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const pages = {
  "/dashboard": ["Dashboard", "Your campus, at a glance."],
  "/clubs": ["Discover Clubs", "Explore campus communities."],
  "/my-clubs": ["My Clubs", "Communities you belong to."],
  "/events": ["Events", "Find upcoming activities on campus."],
  "/my-events": ["My Events", "Your event registrations."],
  "/manage-events": ["Manage Events", "Organize and maintain campus events."],
  "/profile": ["Profile", "Your student account."],
};

export default function Topbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [title, subtitle] = pathname.startsWith("/events/")
    ? ["Event Details", "Event information and registration."]
    : (pages[pathname] ?? ["CampusConnect", "Your campus community."]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-20 items-center justify-between gap-4 px-5 py-3 sm:px-7 lg:px-9">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-[#172B4D] sm:text-[28px]">{title}</h1>
          <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 sm:pr-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#172B4D] text-sm font-bold text-white">{user?.fullName?.charAt(0)?.toUpperCase() ?? "S"}</span>
          <div className="hidden max-w-40 sm:block">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.fullName ?? "Student"}</p>
            <p className="text-xs text-slate-500">{user?.role === "UNIVERSITY_ADMIN" ? "University administrator" : "Campus member"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
