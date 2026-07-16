import {
  CalendarDays,
  LayoutDashboard,
  UserRound,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  {
    label: "Home",
    icon: LayoutDashboard,
    to: "/dashboard",
  },
  {
    label: "Clubs",
    icon: Users,
    to: "/clubs",
  },
  {
    label: "Events",
    icon: CalendarDays,
    to: "/events",
  },
  {
    label: "Profile",
    icon: UserRound,
    to: "/profile",
  },
];

export default function MobileNavigation() {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-around rounded-[22px] border border-white/80 bg-[#171a3a]/95 px-2 py-2 text-white shadow-2xl shadow-indigo-950/30 backdrop-blur-xl lg:hidden">
      {items.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) =>
            [
              "flex min-w-16 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition",
              isActive
                ? "bg-indigo-500 text-white"
                : "text-indigo-200 hover:bg-white/10",
            ].join(" ")
          }
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}