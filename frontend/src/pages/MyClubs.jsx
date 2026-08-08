import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Search,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchMyClubs, leaveClub } from "../services/ClubService";

const themes = {
  TECHNOLOGY: "from-[#501260] via-[#7e367a] to-[#b05994]",
  CULTURAL: "from-[#b05994] via-[#e37dac] to-[#ffb1c4]",
  SPORTS: "from-[#7e367a] via-[#b05994] to-[#e37dac]",
  LITERARY: "from-[#501260] via-[#9a4a8b] to-[#e37dac]",
  MUSIC: "from-[#6a1e76] via-[#a84c93] to-[#ff8fbd]",
  DANCE: "from-[#b05994] via-[#e37dac] to-[#ff9eb8]",
  ENTREPRENEURSHIP: "from-[#501260] via-[#7e367a] to-[#d06ca0]",
  SOCIAL_SERVICE: "from-[#7e367a] via-[#b05994] to-[#ffb1c4]",
  ACADEMIC: "from-[#501260] via-[#693073] to-[#b05994]",
  OTHER: "from-[#5f4068] via-[#8d638d] to-[#c58baa]",
};

export default function MyClubs() {
  const [memberships, setMemberships] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [leavingId, setLeavingId] = useState(null);
  const [error, setError] = useState("");

  async function loadMemberships() {
    setLoading(true);
    setError("");

    try {
      const response = await fetchMyClubs();
      setMemberships(response ?? []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Unable to load your clubs.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemberships();
  }, []);

  const filteredMemberships = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return memberships;

    return memberships.filter(({ club }) =>
      [club?.name, club?.description, club?.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [memberships, search]);

  async function handleLeave(clubId) {
    setLeavingId(clubId);
    setError("");

    try {
      await leaveClub(clubId);
      setMemberships((current) =>
        current.filter((membership) => membership.club.id !== clubId),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Unable to leave this club.",
      );
    } finally {
      setLeavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <section className="relative overflow-hidden rounded-[28px] border border-[#eaddea] bg-white/78 px-7 py-8 shadow-[0_20px_55px_rgba(80,18,96,0.09)] backdrop-blur-xl sm:px-9">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#ffb1c4]/35 blur-[75px]" />
        <div className="absolute -bottom-28 left-[30%] h-64 w-64 rounded-full bg-[#b05994]/16 blur-[90px]" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ead5e5] bg-white/75 px-4 py-2 text-sm font-bold text-[#7e367a]">
              <CheckCircle2 size={16} />
              Your communities
            </span>

            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[#28162f] sm:text-5xl">
              The clubs you belong to, all in one place.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#817487]">
              Stay connected with your communities, review your memberships,
              and continue exploring campus life.
            </p>
          </div>

          <div className="rounded-[20px] border border-[#eaddea] bg-white/80 px-6 py-5 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a8da0]">
              Joined clubs
            </p>

            <div className="mt-2 flex items-center gap-3">
              <Users size={24} className="text-[#b05994]" />
              <span className="text-4xl font-black text-[#28162f]">
                {loading ? "—" : memberships.length}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-7">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8ca4]"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your clubs"
            className="h-12 w-full rounded-[15px] border border-[#eaddea] bg-white/88 pl-12 pr-4 text-sm text-[#28162f] outline-none transition placeholder:text-[#a397a8] focus:border-[#b05994] focus:ring-4 focus:ring-[#e37dac]/15"
          />
        </div>
      </section>

      {error && (
        <div className="mt-5 rounded-[16px] border border-[#efc9dc] bg-[#fff1f7] px-5 py-4 text-sm font-semibold text-[#7e367a]">
          {error}
        </div>
      )}

      <section className="mt-7">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <MembershipSkeleton key={index} />
            ))}
          </div>
        ) : filteredMemberships.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredMemberships.map((membership, index) => (
              <MembershipCard
                key={membership.id}
                membership={membership}
                index={index}
                leaving={leavingId === membership.club.id}
                onLeave={handleLeave}
              />
            ))}
          </div>
        ) : (
          <EmptyMemberships hasSearch={Boolean(search.trim())} />
        )}
      </section>
    </div>
  );
}

function MembershipCard({
  membership,
  index,
  leaving,
  onLeave,
}) {
  const { club } = membership;
  const theme = themes[club.category] ?? themes.OTHER;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="overflow-hidden rounded-[24px] border border-[#eaddea] bg-white/84 shadow-[0_16px_40px_rgba(80,18,96,0.08)] backdrop-blur-xl"
    >
      <div
        className={`relative h-32 overflow-hidden bg-gradient-to-br ${theme}`}
      >
        <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full border-[24px] border-white/12" />

        <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
          {formatEnum(club.category)}
        </span>

        <h2 className="absolute bottom-5 left-5 right-5 truncate text-3xl font-black tracking-tight text-white">
          {club.name}
        </h2>
      </div>

      <div className="p-5">
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-[#817487]">
          {club.description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MembershipDetail
            label="Role"
            value={formatEnum(membership.membershipRole ?? "MEMBER")}
          />

          <MembershipDetail
            label="Joined"
            value={formatDate(membership.joinedAt)}
          />
        </div>

        <div className="mt-5 flex items-center justify-between rounded-[16px] bg-[#f7e8f1] px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-bold text-[#654b69]">
            <Users size={17} />
            {club.memberCount ?? 0} members
          </span>

          <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#7e367a]">
            <CheckCircle2 size={15} />
            Active
          </span>
        </div>

        <div className="mt-5 flex gap-3">
          <Link
            to={`/clubs/${club.id}`}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#501260,#7e367a,#b05994)] text-sm font-extrabold text-white shadow-[0_12px_25px_rgba(80,18,96,0.2)] transition hover:-translate-y-0.5"
          >
            View community
            <ArrowRight size={17} />
          </Link>

          <button
            disabled={leaving}
            onClick={() => onLeave(club.id)}
            className="h-12 rounded-[14px] border border-[#e7bfd3] bg-[#fff2f7] px-5 text-sm font-extrabold text-[#b05994] transition hover:bg-[#fde3ee] disabled:opacity-60"
          >
            {leaving ? "Leaving..." : "Leave"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function MembershipDetail({ label, value }) {
  return (
    <div className="rounded-[14px] bg-[#fff8fc] px-4 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#a092a7]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-[#501260]">
        {value}
      </p>
    </div>
  );
}

function EmptyMemberships({ hasSearch }) {
  return (
    <div className="app-surface px-6 py-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[#f2dce8] text-[#7e367a]">
        <Compass size={28} />
      </div>

      <h2 className="mt-5 text-2xl font-extrabold text-[#28162f]">
        {hasSearch ? "No matching clubs" : "You have not joined a club yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817487]">
        {hasSearch
          ? "Try searching with another club name or category."
          : "Discover communities based on technology, culture, sports, music, and more."}
      </p>

      {!hasSearch && (
        <Link to="/clubs" className="primary-button mt-5">
          Discover clubs
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}

function MembershipSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#eaddea] bg-white/72">
      <div className="h-32 animate-pulse bg-[#eaddea]" />

      <div className="p-5">
        <div className="h-4 w-full animate-pulse rounded bg-[#eaddea]" />
        <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-[#eaddea]" />
        <div className="mt-5 h-14 w-full animate-pulse rounded-[14px] bg-[#eaddea]" />
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") ?? ""
  );
}

function formatDate(value) {
  if (!value) return "Recently";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
