import {
  ArrowRight,
  Compass,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const themes = {
  TECHNOLOGY: {
    background: "from-[#f8e4ef] to-[#f4d7e8]",
    accent: "#7E367A",
  },
  CULTURAL: {
    background: "from-[#ffe7ef] to-[#ffd6e2]",
    accent: "#E37DAC",
  },
  SPORTS: {
    background: "from-[#f4e8f7] to-[#ead7f0]",
    accent: "#B05994",
  },
  LITERARY: {
    background: "from-[#fff0f5] to-[#f8dce8]",
    accent: "#501260",
  },
  MUSIC: {
    background: "from-[#f1e3f5] to-[#e8d2ef]",
    accent: "#7E367A",
  },
  DANCE: {
    background: "from-[#ffe4ee] to-[#f8cddd]",
    accent: "#E37DAC",
  },
  ENTREPRENEURSHIP: {
    background: "from-[#f7e5f1] to-[#ead5e9]",
    accent: "#B05994",
  },
  SOCIAL_SERVICE: {
    background: "from-[#f5e8f3] to-[#eadce9]",
    accent: "#7E367A",
  },
  ACADEMIC: {
    background: "from-[#eee1f2] to-[#e4d1ea]",
    accent: "#501260",
  },
  OTHER: {
    background: "from-[#f5edf6] to-[#e9dfea]",
    accent: "#7E367A",
  },
};

export default function FeaturedClubs({ clubs, loading }) {
  return (
    <section className="app-surface overflow-hidden">
      <div className="flex items-end justify-between border-b border-[#eaddea] px-6 py-5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#b05994]">
            Student communities
          </p>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#28162f]">
            Featured clubs
          </h2>

          <p className="mt-1 text-sm text-[#817487]">
            Explore communities shaped around your interests.
          </p>
        </div>

        <Link
          to="/clubs"
          className="hidden items-center gap-2 text-sm font-bold text-[#7e367a] transition hover:text-[#501260] sm:flex"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="space-y-4 p-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <ClubSkeleton key={index} />
          ))
        ) : clubs.length ? (
          clubs.slice(0, 3).map((club, index) => (
            <ClubPreview
              key={club.id}
              club={club}
              index={index}
            />
          ))
        ) : (
          <EmptyClubs />
        )}
      </div>
    </section>
  );
}

function ClubPreview({ club, index }) {
  const theme = themes[club.category] ?? themes.OTHER;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -3 }}
    >
      <Link
        to={`/clubs/${club.id}`}
        className={`group flex items-center gap-4 rounded-[20px] border border-[#eaddea] bg-gradient-to-br ${theme.background} p-4 shadow-[0_12px_28px_rgba(80,18,96,0.06)] transition hover:border-[#d7bfd7]`}
      >
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-[18px] text-2xl font-black text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, #501260)`,
          }}
        >
          {club.name?.charAt(0)?.toUpperCase() ?? "C"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#7e367a]">
              {formatEnum(club.category)}
            </span>

            {club.joinedByCurrentUser && (
              <span className="flex items-center gap-1 rounded-full bg-[#ffb1c4]/35 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#501260]">
                <Sparkles size={12} />
                Joined
              </span>
            )}
          </div>

          <h3 className="mt-3 truncate text-lg font-extrabold text-[#28162f] transition group-hover:text-[#7e367a]">
            {club.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#817487]">
            {club.description}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#817487]">
            <Users size={14} />
            {club.memberCount ?? 0}{" "}
            {(club.memberCount ?? 0) === 1 ? "member" : "members"}
          </div>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-white/70 text-[#7e367a] transition group-hover:bg-[#7e367a] group-hover:text-white">
          <ArrowRight size={18} />
        </div>
      </Link>
    </motion.article>
  );
}

function EmptyClubs() {
  return (
    <div className="rounded-[20px] border border-dashed border-[#d9bfd8] bg-[#fff8fc] px-6 py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-[#f2dce8] text-[#7e367a]">
        <Compass size={24} />
      </div>

      <h3 className="mt-4 text-lg font-extrabold text-[#28162f]">
        No clubs available
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817487]">
        Student communities will appear here when they are created.
      </p>

      <Link to="/clubs" className="primary-button mt-5">
        Discover clubs
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function ClubSkeleton() {
  return (
    <div className="flex gap-4 rounded-[20px] border border-[#eaddea] bg-white/70 p-4">
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-[18px] bg-[#eaddea]" />

      <div className="flex-1">
        <div className="h-4 w-24 animate-pulse rounded bg-[#eaddea]" />
        <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-[#eaddea]" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#eaddea]" />
      </div>
    </div>
  );
}

function formatEnum(value) {
  return (
    value
      ?.toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") ?? "Club"
  );
}