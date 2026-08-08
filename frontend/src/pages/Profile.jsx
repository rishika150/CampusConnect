import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fetchMyClubs } from "../services/ClubService";
import { fetchUpcomingEvents } from "../services/eventService";

export default function Profile() {
  const { user } = useAuth();

  const [joinedClubs, setJoinedClubs] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfileSummary() {
      const results = await Promise.allSettled([
        fetchMyClubs(),
        fetchUpcomingEvents({ size: 10 }),
      ]);

      if (!active) return;

      const [clubsResult, eventsResult] = results;

      if (clubsResult.status === "fulfilled") {
        setJoinedClubs(clubsResult.value?.length ?? 0);
      }

      if (eventsResult.status === "fulfilled") {
        setUpcomingEvents(eventsResult.value?.content?.length ?? 0);
      }

      setLoading(false);
    }

    loadProfileSummary();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1300px]">
      <section className="relative overflow-hidden rounded-[28px] border border-[#eaddea] bg-white/80 px-7 py-8 shadow-[0_20px_55px_rgba(80,18,96,0.09)] backdrop-blur-xl sm:px-9">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#ffb1c4]/35 blur-[75px]" />
        <div className="absolute -bottom-28 left-[28%] h-64 w-64 rounded-full bg-[#b05994]/16 blur-[90px]" />

        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="grid h-28 w-28 shrink-0 place-items-center rounded-[28px] bg-[linear-gradient(135deg,#501260,#7e367a,#e37dac)] text-5xl font-black text-white shadow-[0_20px_45px_rgba(80,18,96,0.25)]"
          >
            {user?.fullName?.charAt(0)?.toUpperCase() ?? "S"}
          </motion.div>

          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ead5e5] bg-white/75 px-4 py-2 text-sm font-bold text-[#7e367a]">
              <Sparkles size={16} />
              CampusConnect profile
            </span>

            <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-[#28162f] sm:text-5xl">
              {user?.fullName ?? "Student"}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-[#817487]">
              <Mail size={17} />
              {user?.email ?? "Email not available"}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f2dce8] px-4 py-2 text-sm font-extrabold text-[#7e367a]">
              <ShieldCheck size={17} />
              {formatEnum(user?.role ?? "STUDENT")}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-5 md:grid-cols-3">
        <ProfileStat
          icon={Users}
          label="Joined clubs"
          value={loading ? "—" : joinedClubs}
          description="Campus communities"
          tone="from-[#f8e4ef] to-[#f1d9ea]"
        />

        <ProfileStat
          icon={CalendarDays}
          label="Upcoming events"
          value={loading ? "—" : upcomingEvents}
          description="Experiences available"
          tone="from-[#f1e4f6] to-[#ead8f0]"
        />

        <ProfileStat
          icon={CheckCircle2}
          label="Account status"
          value="Active"
          description="Authenticated member"
          tone="from-[#ffe7ef] to-[#f8dce8]"
          compact
        />
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[1fr_0.72fr]">
        <article className="app-surface p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[15px] bg-[#f2dce8] text-[#7e367a]">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[#28162f]">
                Personal information
              </h2>
              <p className="text-sm text-[#817487]">
                Details associated with your CampusConnect account.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <InformationField
              label="Full name"
              value={user?.fullName ?? "Not available"}
            />

            <InformationField
              label="Email address"
              value={user?.email ?? "Not available"}
            />

            <InformationField
              label="Account role"
              value={formatEnum(user?.role ?? "STUDENT")}
            />

            <InformationField
              label="Member status"
              value="Active"
            />
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(145deg,#501260,#7e367a,#b05994)] p-7 text-white shadow-[0_22px_50px_rgba(80,18,96,0.25)]">
          <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full border-[28px] border-white/10" />
          <div className="absolute -bottom-16 left-4 h-40 w-40 rounded-full bg-[#ffb1c4]/18 blur-2xl" />

          <div className="relative">
            <ShieldCheck size={34} className="text-[#ffb1c4]" />

            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-white/55">
              Account security
            </p>

            <h2 className="mt-3 text-2xl font-extrabold">
              Your account is protected.
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/70">
              CampusConnect uses JWT authentication and protected routes to
              secure your profile and campus activity.
            </p>

            <div className="mt-7 rounded-[16px] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={17} className="text-[#ffb1c4]" />
                Authentication active
              </p>

              <p className="mt-2 text-xs leading-5 text-white/55">
                Sign out when using a shared device.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function ProfileStat({
  icon: Icon,
  label,
  value,
  description,
  tone,
  compact = false,
}) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className={`rounded-[22px] border border-[#eaddea] bg-gradient-to-br ${tone} p-5 shadow-[0_14px_32px_rgba(80,18,96,0.07)]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#817487]">{label}</p>

          <p
            className={`mt-3 font-black tracking-tight text-[#28162f] ${
              compact ? "text-3xl" : "text-5xl"
            }`}
          >
            {value}
          </p>

          <p className="mt-2 text-sm text-[#817487]">
            {description}
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-[15px] bg-[linear-gradient(135deg,#7e367a,#e37dac)] text-white shadow-lg">
          <Icon size={21} />
        </div>
      </div>
    </motion.article>
  );
}

function InformationField({ label, value }) {
  return (
    <div className="rounded-[16px] border border-[#eee2ee] bg-[#fffafd] px-5 py-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#a092a7]">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-[#501260]">
        {value}
      </p>
    </div>
  );
}

function formatEnum(value) {
  return (
    value
      ?.toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ") ?? ""
  );
}
