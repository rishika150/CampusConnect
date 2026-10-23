import {
  CalendarDays,
  Settings2,
  Compass,
  LayoutDashboard,
  LogOut,
  UserRound,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMyClubs } from "../services/ClubService";
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
        name: "My Events",
        icon: CalendarDays,
        to: "/my-events",
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
  const [isClubManager, setIsClubManager] = useState(false);
  useEffect(() => {
    let active = true;
    if (user?.role === "UNIVERSITY_ADMIN") return undefined;
    fetchMyClubs().then(memberships => {
      if (active) setIsClubManager(memberships.some(m => ["COORDINATOR", "ADMIN"].includes(m.membershipRole)));
    }).catch(() => { if (active) setIsClubManager(false); });
    return () => { active = false; };
  }, [user?.id, user?.role]);
  const canManage = user?.role === "UNIVERSITY_ADMIN" || isClubManager;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 lg:flex">
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#172B4D] font-black text-white">
          C
        </div>

        <div className="ml-3 min-w-0">
          <p className="truncate text-[17px] font-extrabold tracking-tight">
            CampusConnect
          </p>
          <p className="text-xs text-slate-500">Student network</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {groups.map((group) => (
          <div key={group.label} className="mb-7">
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
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
                        ? "bg-slate-100 text-[#172B4D]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#172B4D]",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-1 h-7 w-1 rounded-full bg-[#47658A]" />
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
        {canManage && <NavLink to="/manage-events" className={({isActive}) => ["mx-3 mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold",isActive ? "bg-slate-100 text-[#172B4D]" : "text-slate-600 hover:bg-slate-50"].join(" ")}><Settings2 size={19} />Manage events</NavLink>}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-[16px] border border-white/10 bg-slate-50 p-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-slate-200 font-extrabold text-[#172B4D]">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "S"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {user?.fullName ?? "Student"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {formatRole(user?.role)}
              </p>
            </div>

            <button
              onClick={logout}
              className="grid h-9 w-9 place-items-center rounded-[10px] text-slate-500 transition hover:bg-slate-200 hover:text-[#172B4D]"
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