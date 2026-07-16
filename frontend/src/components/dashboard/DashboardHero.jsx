import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Compass,
  MapPin,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function DashboardHero({ user, event }) {
  const firstName = user?.fullName?.split(" ")[0] ?? "Student";

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#eaddea] bg-white/75 px-7 py-8 shadow-[0_20px_55px_rgba(80,18,96,0.10)] backdrop-blur-xl sm:px-9 lg:min-h-[390px]">
      <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[#ffb1c4]/30 blur-[90px]" />
      <div className="absolute right-[20%] top-4 h-72 w-72 rounded-full bg-[#b05994]/18 blur-[95px]" />
      <div className="absolute -bottom-28 right-10 h-72 w-72 rounded-full bg-[#7e367a]/14 blur-[100px]" />

      <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-[#e6d5e7] bg-white/70 px-4 py-2 text-sm font-bold text-[#7e367a]">
            {getGreeting()}
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-[-0.045em] text-[#28162f] sm:text-6xl">
            Your campus,
            <br />
            at a glance.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-[#766b7d]">
            Welcome back, {firstName}. Discover clubs, events, and communities
            designed to make campus life more meaningful.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/clubs" className="primary-button">
              <Compass size={18} />
              Discover clubs
            </Link>

            <Link to="/events" className="secondary-button">
              <CalendarDays size={18} />
              Explore events
            </Link>
          </div>
        </div>

        <div className="relative hidden min-h-[300px] lg:block">
          <div className="absolute right-4 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffb1c4,#e37dac_42%,#7e367a_76%,#501260)] opacity-90 blur-[1px]" />

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-0 top-9 w-[68%] rounded-[22px] border border-white/60 bg-white/78 p-5 shadow-[0_22px_45px_rgba(80,18,96,0.15)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#f8e6f0] px-3 py-1 text-xs font-bold text-[#7e367a]">
                Campus activity
              </span>

              <CalendarDays size={20} className="text-[#b05994]" />
            </div>

            <h3 className="mt-4 text-lg font-extrabold text-[#28162f]">
              Communities worth joining
            </h3>

            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#f6d6e5] text-[#7e367a]">
                <Users size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#28162f]">
                  Student clubs
                </p>
                <p className="text-xs text-[#87798d]">
                  Learn, create, and connect
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 right-0 w-[78%] rounded-[22px] bg-[linear-gradient(135deg,#501260,#7e367a,#b05994)] p-5 text-white shadow-[0_25px_50px_rgba(80,18,96,0.28)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
              Next event
            </p>

            {event ? (
              <>
                <h3 className="mt-3 text-xl font-extrabold">
                  {event.title}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-white/75">
                  <p className="flex items-center gap-2">
                    <Clock3 size={15} />
                    {formatDate(event.startTime)}
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin size={15} />
                    {event.venue}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="mt-3 text-xl font-extrabold">
                  Discover your next experience
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/70">
                  New campus events will appear here.
                </p>
              </>
            )}

            <Link
              to="/events"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#ffb1c4]"
            >
              View events
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}