import {
  ArrowRight,
  CalendarDays,
  Compass,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMyClubs } from "../services/clubService";
import { fetchUpcomingEvents } from "../services/eventService";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] ?? "Student";

  const [joinedClubs, setJoinedClubs] = useState([]);
const [upcomingEvents, setUpcomingEvents] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadDashboardStats() {
    try {
      const [clubs, eventsPage] = await Promise.all([
        fetchMyClubs(),
        fetchUpcomingEvents({ size: 5 }),
      ]);

      setJoinedClubs(clubs ?? []);
      setUpcomingEvents(eventsPage?.content ?? []);
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    } finally {
      setLoading(false);
    }
  }

  loadDashboardStats();
}, []);

  return (
    <div className="relative mx-auto max-w-[1500px]">
      <div className="pointer-events-none fixed right-10 top-28 -z-10 h-72 w-72 rounded-full bg-violet-300/20 blur-[100px]" />
      <div className="pointer-events-none fixed bottom-10 left-1/3 -z-10 h-72 w-72 rounded-full bg-sky-300/15 blur-[100px]" />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#444bd4] via-[#6954e6] to-[#a55bd5] px-8 py-10 text-white shadow-[0_28px_70px_rgba(77,67,190,0.3)] lg:min-h-[340px]"
      >
        <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full border-[48px] border-white/[0.06]" />
        <div className="absolute -bottom-40 left-[38%] h-80 w-80 rounded-full bg-sky-300/25 blur-[90px]" />
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-[80px]" />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-50 backdrop-blur">
              <Sparkles size={16} />
              {getGreeting()}
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
              Welcome back,
              <br />
              {firstName}.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-indigo-100">
              Discover communities that inspire you, explore meaningful events,
              and make every week on campus count.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/events"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-indigo-700 shadow-xl shadow-indigo-950/20 transition hover:-translate-y-1"
              >
                Explore events
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/clubs"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-bold backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
              >
                <Compass size={17} />
                Discover clubs
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-[250px] lg:block">
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [2, 1, 2] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-0 top-0 w-[88%] rounded-[28px] border border-white/20 bg-white/[0.14] p-5 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-200">
                    Campus activity
                  </p>
                  <p className="mt-1 font-bold">
                    Experiences worth joining
                  </p>
                </div>

                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-300/20 text-sky-100">
                  <CalendarDays size={21} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniFeature
                  icon={CalendarDays}
                  title="Events"
                  description="Workshops and campus experiences"
                />

                <MiniFeature
                  icon={Users}
                  title="Clubs"
                  description="Communities built around you"
                />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0], rotate: [-3, -2, -3] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-0 left-0 w-[67%] rounded-[24px] border border-white/20 bg-[#171a3a]/45 p-5 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-400 font-bold">
                  C
                </div>

                <div>
                  <p className="text-xs text-indigo-200">
                    Your campus network
                  </p>
                  <p className="font-bold">Learn. Create. Connect.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="mt-7 grid gap-4 md:grid-cols-3">
        <QuickCard
          icon={Compass}
          title="Discover clubs"
          description="Find a community that matches your interests."
          link="/clubs"
          tone="indigo"
        />

        <QuickCard
          icon={CalendarDays}
          title="Explore events"
          description="See workshops, talks, and campus experiences."
          link="/events"
          tone="sky"
        />

        <QuickCard
          icon={Users}
          title="My clubs"
          description="Manage the communities you have joined."
          link="/my-clubs"
          tone="violet"
        />
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Joined clubs"
          value={loading ? "..." : joinedClubs.length}
          detail="Your campus communities"
          tone="indigo"
        />

        <StatCard
          icon={CalendarDays}
          label="Upcoming events"
          value={loading ? "..." : upcomingEvents.length}
          detail="Next campus experience"
          tone="sky"
        />

        <StatCard
          icon={Zap}
          label="Participation"
          value={
  loading
    ? "..."
    : joinedClubs.length + upcomingEvents.length
}
          detail="Active campus connections"
          tone="emerald"
        />

        <StatCard
  icon={Sparkles}
  label="Your role"
  value={formatRole(user?.role)}
  detail="CampusConnect access"
  tone="amber"
  compact
/>
      </section>
    </div>
  );
}

function MiniFeature({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <Icon size={18} className="text-sky-200" />
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-indigo-200">
        {description}
      </p>
    </div>
  );
}

function QuickCard({
  icon: Icon,
  title,
  description,
  link,
  tone,
}) {
  const tones = {
    indigo: "bg-indigo-100 text-indigo-600",
    sky: "bg-sky-100 text-sky-600",
    violet: "bg-violet-100 text-violet-600",
  };

  return (
    <Link
      to={link}
      className="group flex items-center gap-4 rounded-[22px] border border-white/80 bg-white/70 p-5 shadow-[0_10px_30px_rgba(36,42,89,0.05)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(79,70,229,0.12)]"
    >
      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tones[tone]}`}
      >
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <ArrowRight
        size={18}
        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
      />
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  compact = false,
}) {
  const themes = {
    indigo: {
      card: "from-indigo-50 to-violet-100",
      icon: "from-indigo-500 to-violet-500",
    },
    sky: {
      card: "from-sky-50 to-blue-100",
      icon: "from-sky-500 to-blue-500",
    },
    emerald: {
      card: "from-emerald-50 to-teal-100",
      icon: "from-emerald-500 to-teal-500",
    },
    amber: {
      card: "from-amber-50 to-orange-100",
      icon: "from-amber-500 to-orange-500",
    },
  };

  const selected = themes[tone];

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-[24px] border border-white/80 bg-gradient-to-br ${selected.card} p-5 shadow-[0_12px_34px_rgba(36,42,89,0.06)]`}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/35 blur-xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-600">
            {label}
          </p>

          <p
            className={`mt-2 truncate font-bold tracking-tight text-[#181b2e] ${
              compact ? "text-xl" : "text-4xl"
            }`}
          >
            {value}
          </p>

          <p className="mt-2 text-xs font-medium text-slate-500">
            {detail}
          </p>
        </div>

        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${selected.icon} text-white shadow-lg`}
        >
          <Icon size={21} />
        </div>
      </div>
    </motion.article>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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