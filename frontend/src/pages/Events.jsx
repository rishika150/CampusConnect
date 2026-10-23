import { useEffect, useMemo, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import EventHero from "../components/events/EventHero";
import EventTicket from "../components/events/EventTicket";
import { fetchEvents } from "../services/eventService";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (!active) return;
      setLoading(true);
      setError("");
      try {
        const response = await fetchEvents({
          page, size: 12, search: search.trim(),
          category: category === "ALL" ? undefined : category,
          status: status === "ALL" ? undefined : status,
        });
        if (!active) return;
        setEvents(response?.content ?? []);
        setTotalPages(response?.totalPages ?? 0);
        setTotalEvents(response?.totalElements ?? 0);
      } catch (requestError) {
        if (!active) return;
        setEvents([]);
        setTotalPages(0);
        setTotalEvents(0);
        setError(requestError.response?.data?.message ?? "Unable to load events right now.");
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search, category, status, page]);

  function updateFilters(setter, value) {
    setPage(0);
    setter(value);
  }

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (first, second) =>
          new Date(first.startTime) - new Date(second.startTime),
      ),
    [events],
  );

  return (
    <div className="mx-auto max-w-[1500px]">
      <EventHero
        search={search}
        onSearchChange={(value) => updateFilters(setSearch, value)}
        category={category}
        onCategoryChange={(value) => updateFilters(setCategory, value)}
        status={status}
        onStatusChange={(value) => updateFilters(setStatus, value)}
        totalEvents={totalEvents}
      />

      {error && (
        <div className="mt-5 flex items-center gap-3 rounded-[16px] border border-[#efc9dc] bg-[#fff1f7] px-5 py-4 text-sm font-semibold text-[#7e367a]">
          <X size={18} />
          {error}
        </div>
      )}

      <section className="mt-7 space-y-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <EventSkeleton key={index} />
          ))
        ) : error ? null : sortedEvents.length ? (
          sortedEvents.map((event, index) => (
            <EventTicket
              key={event.id}
              event={event}
              index={index}
              featured={index === 0}
            />
          ))
        ) : (
          <EmptyEvents />
        )}
      </section>
      {!loading && !error && totalPages > 1 && (
        <nav aria-label="Event pages" className="mt-8 flex items-center justify-center gap-4">
          <button type="button" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded-xl border px-4 py-2 disabled:opacity-40">Previous</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button type="button" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl border px-4 py-2 disabled:opacity-40">Next</button>
        </nav>
      )}
    </div>
  );
}

function EmptyEvents() {
  return (
    <div className="app-surface px-6 py-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[#f2dce8] text-[#7e367a]">
        <CalendarDays size={28} />
      </div>

      <h2 className="mt-5 text-2xl font-extrabold text-[#28162f]">
        No events found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817487]">
        Try changing your filters or searching with another title, venue, or
        club name.
      </p>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#eaddea] bg-white/72">
      <div className="h-2 animate-pulse bg-[#d7bfd7]" />

      <div className="grid lg:grid-cols-[130px_1fr_auto]">
        <div className="min-h-[170px] animate-pulse bg-[#eaddea]" />

        <div className="p-6">
          <div className="h-4 w-28 animate-pulse rounded bg-[#eaddea]" />
          <div className="mt-4 h-7 w-2/3 animate-pulse rounded bg-[#eaddea]" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#eaddea]" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[#eaddea]" />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-9 animate-pulse rounded bg-[#eaddea]"
              />
            ))}
          </div>
        </div>

        <div className="hidden w-44 animate-pulse bg-[#f2e7ef] lg:block" />
      </div>
    </div>
  );
}