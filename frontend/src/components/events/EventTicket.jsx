import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const categoryThemes = {
  WORKSHOP: {
    strip: "from-[#501260] to-[#7e367a]",
    badge: "bg-[#f3ddea] text-[#7e367a]",
  },
  SEMINAR: {
    strip: "from-[#7e367a] to-[#b05994]",
    badge: "bg-[#f2e2ed] text-[#7e367a]",
  },
  HACKATHON: {
    strip: "from-[#501260] via-[#7e367a] to-[#e37dac]",
    badge: "bg-[#ffdee9] text-[#8a2f69]",
  },
  CULTURAL: {
    strip: "from-[#b05994] to-[#e37dac]",
    badge: "bg-[#ffe2ed] text-[#a03a72]",
  },
  SPORTS: {
    strip: "from-[#7e367a] to-[#d36fa3]",
    badge: "bg-[#f4e4ef] text-[#7e367a]",
  },
  NETWORKING: {
    strip: "from-[#6c2874] to-[#b05994]",
    badge: "bg-[#f0ddea] text-[#6c2874]",
  },
  OTHER: {
    strip: "from-[#6f526f] to-[#b183a3]",
    badge: "bg-[#f0e7ef] text-[#6f526f]",
  },
};

export default function EventTicket({
  event,
  index = 0,
  featured = false,
}) {
  const theme =
    categoryThemes[event.category] ?? categoryThemes.OTHER;

  const start = new Date(event.startTime);
  const availableSeats =
    event.availableSeats ??
    Math.max(
      0,
      (event.capacity ?? 0) - (event.registeredCount ?? 0),
    );

  const almostFull =
    event.capacity > 0 &&
    availableSeats > 0 &&
    availableSeats <= Math.max(5, event.capacity * 0.15);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className={[
        "group relative overflow-hidden rounded-[24px] border bg-white/86 shadow-[0_18px_42px_rgba(80,18,96,0.08)] backdrop-blur-xl",
        featured
          ? "border-[#d8b7d4]"
          : "border-[#eaddea]",
      ].join(" ")}
    >
      <div
        className={`h-2 bg-gradient-to-r ${theme.strip}`}
      />

      <div className="grid lg:grid-cols-[130px_1fr_auto]">
        <div
          className={[
            "relative grid min-h-[170px] place-items-center border-b border-dashed border-[#dfcadd] p-5 text-center",
            "lg:border-b-0 lg:border-r",
            featured
              ? "bg-[linear-gradient(160deg,#501260,#7e367a)] text-white"
              : "bg-[#f9edf4] text-[#501260]",
          ].join(" ")}
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-75">
              {start.toLocaleDateString("en-US", {
                month: "short",
              })}
            </p>

            <p className="mt-2 text-5xl font-black leading-none">
              {start.getDate()}
            </p>

            <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] opacity-70">
              {start.toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </p>
          </div>

          <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[var(--background)] lg:-right-3 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0" />
        </div>

        <div className="min-w-0 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] ${theme.badge}`}
            >
              {formatEnum(event.category)}
            </span>

            <span className="rounded-full bg-[#f8edf4] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#7e367a]">
              {formatEnum(event.status ?? "UPCOMING")}
            </span>

            {almostFull && (
              <span className="rounded-full bg-[#ffe1e8] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#b33b67]">
                Almost full
              </span>
            )}

            {featured && (
              <span className="rounded-full bg-[#ffb1c4]/45 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#501260]">
                Featured
              </span>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#28162f] transition group-hover:text-[#7e367a]">
            {event.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#817487]">
            {event.description}
          </p>

          <div className="mt-5 grid gap-3 text-sm text-[#716477] sm:grid-cols-2">
            <MetaItem
              icon={Clock3}
              text={start.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />

            <MetaItem
              icon={MapPin}
              text={event.venue || "Venue to be announced"}
            />

            <MetaItem
              icon={Building2}
              text={event.clubName || "CampusConnect"}
            />

            <MetaItem
              icon={Users}
              text={`${availableSeats} seats available`}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9a8da0]">
              <CalendarDays size={14} />

              Registration closes{" "}
              {formatDate(event.registrationDeadline)}
            </div>
          </div>
        </div>

        <div className="flex items-center border-t border-[#eaddea] p-5 lg:border-l lg:border-t-0">
          <Link
            to={`/events/${event.id}`}
            className="flex h-12 min-w-36 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#501260,#7e367a,#b05994)] px-5 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(80,18,96,0.2)] transition hover:-translate-y-0.5"
          >
            View details
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function MetaItem({ icon: Icon, text }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#f4e3ed] text-[#7e367a]">
        <Icon size={15} />
      </div>

      <span className="truncate font-semibold">{text}</span>
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
      .join(" ") ?? "Event"
  );
}

function formatDate(value) {
  if (!value) return "soon";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}