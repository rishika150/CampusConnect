import {
  Bell,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const pageNames = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Everything happening across your campus.",
  },
  "/clubs": {
    title: "Discover Clubs",
    subtitle: "Find communities built around your interests.",
  },
  "/events": {
    title: "Campus Events",
    subtitle: "Explore upcoming workshops and experiences.",
  },
  "/my-clubs": {
    title: "My Clubs",
    subtitle: "Communities you have joined.",
  },
  "/profile": {
    title: "Your Profile",
    subtitle: "Manage your CampusConnect identity.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Customize your experience.",
  },
};

export default function Topbar({ onMobileMenu }) {
  const location = useLocation();
  const { user } = useAuth();

  const page = pageNames[location.pathname] ?? pageNames["/dashboard"];

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-[#f3f5fb]/85 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-5 sm:px-7 lg:px-9">
        <button
          onClick={onMobileMenu}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-[#181b2e] sm:text-2xl">
            {page.title}
          </h1>
          <p className="hidden truncate text-sm text-[#6d7289] sm:block">
            {page.subtitle}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden xl:block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              placeholder="Search clubs and events"
              className="w-72 rounded-2xl border border-white bg-white/80 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <button
            className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white bg-white/80 text-slate-600 shadow-sm transition hover:text-indigo-600"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-white bg-white/75 py-2 pl-2 pr-4 shadow-sm sm:flex">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "S"}
            </div>

            <div>
              <p className="max-w-32 truncate text-sm font-bold text-slate-800">
                {user?.fullName ?? "Student"}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                <Sparkles size={11} />
                Campus member
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}