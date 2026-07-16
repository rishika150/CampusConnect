import {
  CalendarDays,
  LogOut,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 font-bold text-white">
              C
            </span>

            <span className="font-bold text-slate-950">
              CampusConnect
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[32px] bg-gradient-to-r from-indigo-600 to-purple-500 p-8 text-white shadow-xl shadow-indigo-200">
          <div className="flex items-center gap-2 text-indigo-100">
            <Sparkles size={19} />
            Student dashboard
          </div>

          <h1 className="mt-4 text-4xl font-bold">
            Welcome, {user?.fullName?.split(" ")[0] ?? "Student"}!
          </h1>

          <p className="mt-3 max-w-2xl text-indigo-100">
            Discover upcoming events, explore student clubs, and make the most
            of university life.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <DashboardCard
            icon={Users}
            label="Explore clubs"
            value="Find your community"
          />

          <DashboardCard
            icon={CalendarDays}
            label="Upcoming events"
            value="Discover experiences"
          />

          <DashboardCard
            icon={Sparkles}
            label="Your role"
            value={user?.role ?? "STUDENT"}
          />
        </div>
      </section>
    </main>
  );
}

function DashboardCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/60">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon size={22} />
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-950">
        {value}
      </p>
    </article>
  );
}