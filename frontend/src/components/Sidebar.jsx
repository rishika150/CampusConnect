import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        to: "/dashboard",
      },
    ],
  },
  {
    section: "Campus",
    items: [
      {
        label: "Discover Clubs",
        icon: Compass,
        to: "/clubs",
      },
      {
        label: "Events",
        icon: CalendarDays,
        to: "/events",
      },
      {
        label: "My Clubs",
        icon: Users,
        to: "/my-clubs",
      },
    ],
  },
  {
    section: "Account",
    items: [
      {
        label: "Profile",
        icon: UserRound,
        to: "/profile",
      },
      {
        label: "Settings",
        icon: Settings,
        to: "/settings",
      },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden lg:flex",
        "bg-[linear-gradient(180deg,#171A3A_0%,#1E2147_55%,#252A59_100%)]",
        "text-white shadow-2xl shadow-indigo-950/20 transition-all duration-300",
        collapsed ? "w-[88px]" : "w-[272px]",
      ].join(" ")}
    >
      <div className="flex h-20 items-center border-b border-white/10 px-5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 font-bold shadow-lg shadow-indigo-950/30">
          C
        </div>

        {!collapsed && (
          <div className="ml-3 min-w-0">
            <p className="truncate text-lg font-bold">CampusConnect</p>
            <p className="text-xs text-indigo-200">Student community</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {navigation.map((group) => (
          <div key={group.section} className="mb-7">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300/70">
                {group.section}
              </p>
            )}

            <div className="space-y-1.5">
              {group.items.map(({ label, icon: Icon, to }) => (
                <NavLink
                  key={label}
                  to={to}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    [
                      "group relative flex min-h-12 items-center rounded-2xl px-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-950/25"
                        : "text-indigo-100/75 hover:bg-white/10 hover:text-white",
                      collapsed ? "justify-center" : "gap-3",
                    ].join(" ")
                  }
                >
                  <Icon size={20} className="shrink-0" />

                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div
          className={[
            "rounded-2xl bg-white/8 p-3",
            collapsed ? "flex justify-center" : "",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center",
              collapsed ? "justify-center" : "gap-3",
            ].join(" ")}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "S"}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {user?.fullName ?? "Student"}
                </p>
                <p className="truncate text-xs text-indigo-200">
                  {formatRole(user?.role)}
                </p>
              </div>
            )}

            {!collapsed && (
              <button
                onClick={logout}
                className="rounded-xl p-2 text-indigo-200 transition hover:bg-rose-500/20 hover:text-rose-200"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onToggle}
          className="mt-3 flex w-full items-center justify-center rounded-xl py-2 text-indigo-200 transition hover:bg-white/10 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight size={19} />
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <ChevronLeft size={17} />
              Collapse sidebar
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

function formatRole(role) {
  return (
    role
      ?.toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") ?? "Student"
  );
}