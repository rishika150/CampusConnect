import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function UpcomingEvents({ events, loading }) {
  return (
    <section className="app-surface overflow-hidden">
      <div className="flex items-end justify-between border-b border-[#eaddea] px-6 py-5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#b05994]">
            Campus calendar
          </p>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#28162f]">
            Upcoming events
          </h2>

          <p className="mt-1 text-sm text-[#817487]">
            Workshops, talks, competitions, and campus experiences.
          </p>
        </div>

        <Link
          to="/events"
          className="hidden items-center gap-2 text-sm font-bold text-[#7e367a] transition hover:text-[#501260] sm:flex"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="space-y-4 p-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <EventSkeleton key={index} />
          ))
        ) : events.length ? (
          events.slice(0, 4).map((event, index) => (
            <EventTicket
              key={event.id}
              event={event}
              featured={index === 0}
            />
          ))
        ) : (
          <EmptyEvents />
        )}
      </div>
    </section>
  );
}

function EventTicket({ event, featured }) {
  const start = new Date(event.startTime);
  const seats = event.availableSeats ?? event.capacity ?? 0;

  return (
    <motion.article
      whileHover={{ x: 4 }}
      transition={{ duration: 0.18 }}
    >
      <Link
        to={`/events/${event.id}`}
        className={[
          "group grid overflow-hidden rounded-[20px] border transition",
          "sm:grid-cols-[92px_1fr_auto]",
          featured
            ? "border-[#d9bfd8] bg-[linear-gradient(115deg,#fff7fb,#f7edf8)] shadow-[0_14px_30px_rgba(80,18,96,0.08)]"
            : "border-[#eaddea] bg-white/72 hover:border-[#d9bfd8] hover:bg-[#fff8fc]",
        ].join(" ")}
      >
        <div
          className={[
            "grid min-h-[112px] place-items-center border-b border-dashed border-[#d9bfd8] p-4 text-center",
            "sm:border-b-0 sm:border-r",
            featured
              ? "bg-[linear-gradient(160deg,#501260,#7e367a)] text-white"
              : "bg-[#f8edf4] text-[#501260]",
          ].join(" ")}
        >
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em]">
              {start.toLocaleDateString("en-US", {
                month: "short",
              })}
            </p>

            <p className="mt-1 text-4xl font-black leading-none">
              {start.getDate()}
            </p>

            <p className="mt-2 text-[11px] font-bold uppercase opacity-70">
              {start.toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </p>
          </div>
        </div>

        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#f2dce8] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#7e367a]">
              {formatEnum(event.category)}
            </span>

            {featured && (
              <span className="rounded-full bg-[#ffb1c4]/45 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#501260]">
                Next up
              </span>
            )}
          </div>

          <h3 className="mt-3 truncate text-lg font-extrabold text-[#28162f] transition group-hover:text-[#7e367a]">
            {event.title}
          </h3>

          <p className="mt-1 truncate text-sm font-semibold text-[#8a7d92]">
            {event.clubName}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#817487]">
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} />
              {start.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {event.venue}
            </span>

            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {seats} seats left
            </span>
          </div>
        </div>

        <div className="hidden items-center px-5 sm:flex">
          <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#f2e1ed] text-[#7e367a] transition group-hover:bg-[#7e367a] group-hover:text-white">
            <ArrowRight size={18} />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function EmptyEvents() {
  return (
    <div className="rounded-[20px] border border-dashed border-[#d9bfd8] bg-[#fff8fc] px-6 py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-[#f2dce8] text-[#7e367a]">
        <CalendarDays size={24} />
      </div>

      <h3 className="mt-4 text-lg font-extrabold text-[#28162f]">
        No upcoming events
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817487]">
        New workshops and campus experiences will appear here when they are
        published.
      </p>

      <Link to="/events" className="primary-button mt-5">
        Explore events
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="grid overflow-hidden rounded-[20px] border border-[#eaddea] bg-white/70 sm:grid-cols-[92px_1fr]">
      <div className="min-h-[112px] animate-pulse bg-[#eaddea]" />

      <div className="p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-[#eaddea]" />
        <div className="mt-4 h-6 w-2/3 animate-pulse rounded bg-[#eaddea]" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[#eaddea]" />
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
      .join(" ") ?? "Event"
  );
}