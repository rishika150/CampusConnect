import {
  ArrowRight,
  LogOut,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const themes = {
  TECHNOLOGY: {
    cover: "from-indigo-500 via-violet-500 to-purple-500",
    badge: "bg-indigo-100 text-indigo-700",
  },
  CULTURAL: {
    cover: "from-rose-400 via-pink-500 to-fuchsia-500",
    badge: "bg-rose-100 text-rose-700",
  },
  SPORTS: {
    cover: "from-emerald-400 via-teal-500 to-cyan-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  LITERARY: {
    cover: "from-amber-400 via-orange-500 to-rose-400",
    badge: "bg-amber-100 text-amber-700",
  },
  MUSIC: {
    cover: "from-violet-500 via-purple-500 to-fuchsia-500",
    badge: "bg-violet-100 text-violet-700",
  },
  DANCE: {
    cover: "from-pink-400 via-rose-500 to-orange-400",
    badge: "bg-pink-100 text-pink-700",
  },
  ENTREPRENEURSHIP: {
    cover: "from-sky-400 via-blue-500 to-indigo-500",
    badge: "bg-sky-100 text-sky-700",
  },
  SOCIAL_SERVICE: {
    cover: "from-teal-400 via-emerald-500 to-green-500",
    badge: "bg-teal-100 text-teal-700",
  },
  ACADEMIC: {
    cover: "from-blue-500 via-indigo-500 to-violet-500",
    badge: "bg-blue-100 text-blue-700",
  },
  OTHER: {
    cover: "from-slate-500 via-slate-600 to-indigo-600",
    badge: "bg-slate-100 text-slate-700",
  },
};

export default function ClubCard({
  club,
  onJoin,
  onLeave,
  updating = false,
}) {
  const theme = themes[club.category] ?? themes.OTHER;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-[26px] border border-white/80 bg-white/80 shadow-[0_14px_38px_rgba(36,42,89,0.08)] backdrop-blur-xl"
    >
      <div
        className={`relative h-28 overflow-hidden bg-gradient-to-br ${theme.cover}`}
      >
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[22px] border-white/10" />
        <div className="absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          {club.active ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="relative px-5 pb-5">
        <div className="-mt-9 flex items-end justify-between gap-3">
          <div
            className={`grid h-[72px] w-[72px] place-items-center rounded-[22px] border-4 border-white bg-gradient-to-br ${theme.cover} text-2xl font-bold text-white shadow-lg`}
          >
            {club.name?.charAt(0)?.toUpperCase() ?? "C"}
          </div>

          <span
            className={`mb-1 rounded-full px-3 py-1.5 text-xs font-bold ${theme.badge}`}
          >
            {formatEnum(club.category)}
          </span>
        </div>

        <h2 className="mt-4 truncate text-xl font-bold tracking-tight text-slate-950">
          {club.name}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
          {club.description}
        </p>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#f5f6fc] px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Users size={17} className="text-indigo-500" />
            {club.memberCount ?? 0}{" "}
            {(club.memberCount ?? 0) === 1 ? "member" : "members"}
          </div>

          {club.joinedByCurrentUser && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <Sparkles size={14} />
              Joined
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          {club.joinedByCurrentUser ? (
            <button
              disabled={updating}
              onClick={() => onLeave(club.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
            >
              <LogOut size={17} />
              {updating ? "Leaving…" : "Leave"}
            </button>
          ) : (
            <button
              disabled={updating}
              onClick={() => onJoin(club.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              <UserPlus size={17} />
              {updating ? "Joining…" : "Join club"}
            </button>
          )}

          <Link
            to={`/clubs/${club.id}`}
            aria-label={`View ${club.name}`}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function formatEnum(value) {
  return value
    ?.toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}