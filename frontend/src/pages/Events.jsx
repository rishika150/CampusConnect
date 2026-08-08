import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, X } from "lucide-react";
import EventHero from "../components/events/EventHero";
import EventTicket from "../components/events/EventTicket";
import {
  cancelEventRegistration,
  fetchEvents,
  fetchMyEventRegistrations,
  registerForEvent,
} from "../services/eventService";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionEventId, setActionEventId] = useState(null);
  const [registeredEventIds, setRegisteredEventIds] = useState(
    new Set(),
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [response, registrations] = await Promise.all([
        fetchEvents({
          page: 0,
          size: 30,
          search: search.trim(),
          category: category === "ALL" ? undefined : category,
          status: status === "ALL" ? undefined : status,
        }),
        fetchMyEventRegistrations(),
      ]);

      setEvents(response?.content ?? []);
      setRegisteredEventIds(
        new Set(
          (registrations ?? []).map(
            (registration) => registration.eventId,
          ),
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Unable to load events right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadEvents]);

  async function handleRegistration(event) {
    const isRegistered = registeredEventIds.has(event.id);

    setActionEventId(event.id);
    setError("");
    setSuccess("");

    try {
      if (isRegistered) {
        await cancelEventRegistration(event.id);
        setSuccess(`Registration cancelled for ${event.title}.`);
      } else {
        await registerForEvent(event.id);
        setSuccess(`You are registered for ${event.title}.`);
      }

      await loadEvents();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Unable to update your registration right now.",
      );
    } finally {
      setActionEventId(null);
    }
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
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        totalEvents={events.length}
      />

      {error && (
        <div className="mt-5 flex items-center gap-3 rounded-[16px] border border-[#efc9dc] bg-[#fff1f7] px-5 py-4 text-sm font-semibold text-[#7e367a]">
          <X size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 flex items-center gap-3 rounded-[16px] border border-[#b9dfcc] bg-[#effbf4] px-5 py-4 text-sm font-semibold text-[#246c4a]">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <section className="mt-7 space-y-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <EventSkeleton key={index} />
          ))
        ) : sortedEvents.length ? (
          sortedEvents.map((event, index) => (
            <EventTicket
              key={event.id}
              event={event}
              index={index}
              featured={index === 0}
              registered={registeredEventIds.has(event.id)}
              actionLoading={actionEventId === event.id}
              onRegistrationChange={() =>
                handleRegistration(event)
              }
            />
          ))
        ) : (
          <EmptyEvents />
        )}
      </section>
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
