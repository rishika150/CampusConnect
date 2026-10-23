import {
  CalendarDays,
  LayoutDashboard,
  Ticket,
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
    label: "My Events",
    icon: Ticket,
    to: "/my-events",
  },
];

export default function MobileNavigation() {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-around rounded-[22px] border border-slate-200 bg-white/95 px-2 py-2 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-xl lg:hidden">
      {items.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) =>
            [
              "flex min-w-16 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition",
              isActive
                ? "bg-slate-100 text-[#172B4D]"
                : "text-slate-600 hover:bg-slate-50",
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