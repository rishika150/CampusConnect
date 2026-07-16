import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  LogOut,
  UserRound,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const groups = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        to: "/dashboard",
      },
    ],
  },
  {
    label: "Campus",
    items: [
      {
        name: "Discover Clubs",
        icon: Compass,
        to: "/clubs",
      },
      {
        name: "Events",
        icon: CalendarDays,
        to: "/events",
      },
      {
        name: "My Clubs",
        icon: Users,
        to: "/my-clubs",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        name: "Profile",
        icon: UserRound,
        to: "/profile",
      },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] flex-col overflow-hidden bg-[linear-gradient(180deg,#35103f_0%,#501260_52%,#2a1235_100%)] text-white shadow-[18px_0_45px_rgba(80,18,96,0.14)] lg:flex">
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[linear-gradient(135deg,#e37dac,#ffb1c4)] font-black text-[#501260] shadow-lg shadow-black/10">
          C
        </div>

        <div className="ml-3 min-w-0">
          <p className="truncate text-[17px] font-extrabold tracking-tight">
            CampusConnect
          </p>
          <p className="text-xs text-white/55">Student network</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {groups.map((group) => (
          <div key={group.label} className="mb-7">
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
              {group.label}
            </p>

            <div className="space-y-1.5">
              {group.items.map(({ name, icon: Icon, to }) => (
                <NavLink
                  key={name}
                  to={to}
                  className={({ isActive }) =>
                    [
                      "group relative flex min-h-11 items-center gap-3 rounded-[13px] px-3 text-sm font-semibold transition duration-200",
                      isActive
                        ? "bg-[linear-gradient(90deg,#7e367a,#e37dac)] text-white shadow-[0_10px_22px_rgba(0,0,0,0.16)]"
                        : "text-white/68 hover:bg-white/8 hover:text-white",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-1 h-7 w-1 rounded-full bg-[#ffb1c4]" />
                      )}

                      <Icon
                        size={19}
                        className="shrink-0 transition group-hover:scale-105"
                      />

                      <span>{name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-[16px] border border-white/10 bg-white/[0.07] p-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[linear-gradient(135deg,#e37dac,#ffb1c4)] font-extrabold text-[#501260]">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "S"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {user?.fullName ?? "Student"}
              </p>
              <p className="truncate text-xs text-white/50">
                {formatRole(user?.role)}
              </p>
            </div>

            <button
              onClick={logout}
              className="grid h-9 w-9 place-items-center rounded-[10px] text-white/55 transition hover:bg-[#ffb1c4]/15 hover:text-[#ffb1c4]"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
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