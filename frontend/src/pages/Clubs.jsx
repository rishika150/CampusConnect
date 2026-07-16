import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Compass,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  fetchClubs,
  joinClub,
  leaveClub,
} from "../services/clubService";

const categories = [
  "ALL",
  "TECHNOLOGY",
  "CULTURAL",
  "SPORTS",
  "LITERARY",
  "MUSIC",
  "DANCE",
  "ENTREPRENEURSHIP",
  "SOCIAL_SERVICE",
  "ACADEMIC",
  "OTHER",
];

const categoryStyles = {
  TECHNOLOGY: {
    cover: "from-[#501260] via-[#7e367a] to-[#b05994]",
    soft: "bg-[#f4e1ed]",
  },
  CULTURAL: {
    cover: "from-[#b05994] via-[#e37dac] to-[#ffb1c4]",
    soft: "bg-[#fde5ef]",
  },
  SPORTS: {
    cover: "from-[#7e367a] via-[#b05994] to-[#e37dac]",
    soft: "bg-[#f5e5f1]",
  },
  LITERARY: {
    cover: "from-[#501260] via-[#9a4a8b] to-[#e37dac]",
    soft: "bg-[#f7e6f0]",
  },
  MUSIC: {
    cover: "from-[#6a1e76] via-[#a84c93] to-[#ff8fbd]",
    soft: "bg-[#f5e1ef]",
  },
  DANCE: {
    cover: "from-[#b05994] via-[#e37dac] to-[#ff9eb8]",
    soft: "bg-[#ffe8f0]",
  },
  ENTREPRENEURSHIP: {
    cover: "from-[#501260] via-[#7e367a] to-[#d06ca0]",
    soft: "bg-[#f2e2ed]",
  },
  SOCIAL_SERVICE: {
    cover: "from-[#7e367a] via-[#b05994] to-[#ffb1c4]",
    soft: "bg-[#f8e7f0]",
  },
  ACADEMIC: {
    cover: "from-[#501260] via-[#693073] to-[#b05994]",
    soft: "bg-[#efe1ef]",
  },
  OTHER: {
    cover: "from-[#5f4068] via-[#8d638d] to-[#c58baa]",
    soft: "bg-[#f0e7ef]",
  },
};

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  async function loadClubs() {
    setLoading(true);
    setError("");

    try {
      const response = await fetchClubs({
        size: 30,
        search: search.trim(),
        category: category === "ALL" ? undefined : category,
      });

      setClubs(response?.content ?? []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Unable to load clubs right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClubs();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, category]);

  const joinedCount = useMemo(
    () => clubs.filter((club) => club.joinedByCurrentUser).length,
    [clubs],
  );

  async function handleJoin(clubId) {
    setUpdatingId(clubId);
    setError("");

    try {
      await joinClub(clubId);
      await loadClubs();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Unable to join this club.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleLeave(clubId) {
    setUpdatingId(clubId);
    setError("");

    try {
      await leaveClub(clubId);
      await loadClubs();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Unable to leave this club.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <section className="relative overflow-hidden rounded-[28px] border border-[#eaddea] bg-white/76 px-7 py-8 shadow-[0_20px_55px_rgba(80,18,96,0.09)] backdrop-blur-xl sm:px-9">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#ffb1c4]/35 blur-[75px]" />
        <div className="absolute bottom-[-120px] left-[35%] h-64 w-64 rounded-full bg-[#b05994]/18 blur-[85px]" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ead5e5] bg-white/70 px-4 py-2 text-sm font-bold text-[#7e367a]">
              <Sparkles size={16} />
              Student communities
            </span>

            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.035em] text-[#28162f] sm:text-5xl">
              Find the people who make campus feel like home.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#817487]">
              Explore student-led clubs, meet people who share your interests,
              and become part of communities across campus.
            </p>
            <p className="mt-3 text-sm font-semibold text-[#b05994]">
  {clubs.length} active{" "}
  {clubs.length === 1 ? "community" : "communities"} available
</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              label="Available"
              value={clubs.length}
              icon={Compass}
            />

            <SummaryCard
              label="Joined"
              value={joinedCount}
              icon={Users}
            />
          </div>
        </div>
      </section>

      <section className="app-surface mt-7 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8ca4]"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clubs by name or description"
              className="h-12 w-full rounded-[15px] border border-[#eaddea] bg-[#fffafd] pl-12 pr-4 text-sm text-[#28162f] outline-none transition placeholder:text-[#a397a8] focus:border-[#b05994] focus:ring-4 focus:ring-[#e37dac]/15"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7e367a]"
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-12 w-full appearance-none rounded-[15px] border border-[#eaddea] bg-[#fffafd] pl-11 pr-4 text-sm font-bold text-[#501260] outline-none focus:border-[#b05994] focus:ring-4 focus:ring-[#e37dac]/15"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL"
                    ? "All categories"
                    : formatEnum(item)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-5 flex items-center gap-3 rounded-[16px] border border-[#efc9dc] bg-[#fff1f7] px-5 py-4 text-sm font-semibold text-[#7e367a]">
          <X size={18} />
          {error}
        </div>
      )}

      <section className="mt-7">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ClubSkeleton key={index} />
            ))}
          </div>
        ) : clubs.length ? (
          <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            {clubs.map((club, index) => (
              <ClubPoster
                key={club.id}
                club={club}
                index={index}
                updating={updatingId === club.id}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            ))}
          </div>
        ) : (
          <EmptyClubs />
        )}
      </section>
    </div>
  );
}

function ClubPoster({
  club,
  index,
  updating,
  onJoin,
  onLeave,
}) {
  const theme =
    categoryStyles[club.category] ?? categoryStyles.OTHER;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-[24px] border border-[#eaddea] bg-white/84 shadow-[0_16px_40px_rgba(80,18,96,0.08)] backdrop-blur-xl"
    >
      <div
        className={`relative h-48 overflow-hidden bg-gradient-to-br ${theme.cover}`}
      >
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[24px] border-white/12" />
        <div className="absolute -bottom-14 left-8 h-36 w-36 rounded-full bg-white/12 blur-2xl" />

        <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
          {formatEnum(club.category)}
        </span>

        <div className="absolute bottom-5 left-5 right-5">
          <p className="truncate text-3xl font-black tracking-[-0.04em] text-white">
            {club.name}
          </p>
        </div>
      </div>

      <div className="p-5">
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-[#817487]">
          {club.description}
        </p>

        <div
          className={`mt-5 flex items-center justify-between rounded-[16px] ${theme.soft} px-4 py-3`}
        >
          <span className="flex items-center gap-2 text-sm font-bold text-[#654b69]">
            <Users size={17} />

            {club.memberCount ?? 0}{" "}
            {(club.memberCount ?? 0) === 1
              ? "member"
              : "members"}
          </span>

          {club.joinedByCurrentUser && (
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#7e367a]">
              <Check size={15} />
              Joined
            </span>
          )}
        </div>

        <button
          disabled={updating}
          onClick={() =>
            club.joinedByCurrentUser
              ? onLeave(club.id)
              : onJoin(club.id)
          }
          className={[
            "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-sm font-extrabold transition disabled:opacity-60",
            club.joinedByCurrentUser
              ? "border border-[#e7bfd3] bg-[#fff2f7] text-[#b05994] hover:bg-[#fde3ee]"
              : "bg-[linear-gradient(135deg,#501260,#7e367a,#b05994)] text-white shadow-[0_12px_25px_rgba(80,18,96,0.22)] hover:-translate-y-0.5",
          ].join(" ")}
        >
          {club.joinedByCurrentUser ? (
            <>
              <X size={17} />
              {updating ? "Leaving..." : "Leave club"}
            </>
          ) : (
            <>
              <UserPlus size={17} />
              {updating ? "Joining..." : "Join Community"}
            </>
          )}
        </button>
      </div>
    </motion.article>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="min-w-32 rounded-[18px] border border-[#eaddea] bg-white/74 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#9a8da0]">
            {label}
          </p>

          <p className="mt-1 text-3xl font-black text-[#28162f]">
            {value}
          </p>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#f2dce8] text-[#7e367a]">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function EmptyClubs() {
  return (
    <div className="app-surface px-6 py-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[#f2dce8] text-[#7e367a]">
        <Compass size={28} />
      </div>

      <h2 className="mt-5 text-2xl font-extrabold text-[#28162f]">
        No clubs found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817487]">
        Try changing the category or searching with a different term.
      </p>
    </div>
  );
}

function ClubSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#eaddea] bg-white/70">
      <div className="h-48 animate-pulse bg-[#eaddea]" />

      <div className="p-5">
        <div className="h-4 w-full animate-pulse rounded bg-[#eaddea]" />
        <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-[#eaddea]" />
        <div className="mt-5 h-12 w-full animate-pulse rounded-[16px] bg-[#eaddea]" />
        <div className="mt-5 h-12 w-full animate-pulse rounded-[14px] bg-[#eaddea]" />
      </div>
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
      .join(" ") ?? "Club"
  );
}