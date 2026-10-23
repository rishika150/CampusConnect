import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Users, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchEventById, fetchMyEventRegistrations, registerForEvent, cancelEventRegistration } from "../services/eventService";

function formatDate(value) {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not specified"
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function EventDetails() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const userName = user?.fullName ?? "";
  const userEmail = user?.email ?? "";
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registrationReady, setRegistrationReady] = useState(false);
  const [registrationBusy, setRegistrationBusy] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setEvent(null);
    setRegistered(false);
    setRegistrationReady(false);
    setRegistrationMessage("");

    fetchMyEventRegistrations()
      .then((items) => { if (active) { setRegistered(items.some((item) => String(item.eventId) === String(eventId))); setRegistrationReady(true); } })
      .catch(() => { if (active) setRegistrationMessage("Registration status could not be loaded. Refresh before registering."); });

    fetchEventById(eventId, controller.signal)
      .then((data) => { if (active) setEvent(data); })
      .catch((err) => {
        if (active) setError(
          err.response?.status === 404
            ? "This event could not be found."
            : "Unable to load event details. Please try again."
        );
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; controller.abort(); };
  }, [eventId, retryKey]);

  const externalForm = Boolean(event?.registrationFormUrl);
  const registrationClosed = Boolean(event && (
    ["COMPLETED", "CANCELLED"].includes(event.status) ||
    new Date(event.registrationDeadline) <= new Date()
  ));
  const googleFormUrl = (() => {
    if (!externalForm) return null;
    try {
      const url = new URL(event.registrationFormUrl);
      if (url.protocol !== "https:" || !["forms.gle", "docs.google.com"].includes(url.hostname)) return null;
      if (url.hostname === "docs.google.com" && url.pathname.startsWith("/forms/")) {
        // Entry IDs are supplied by the organizer, never guessed.
        const rawName = event.formNameEntryId;
        const rawEmail = event.formEmailEntryId;
        if (rawName && /^entry\\.[0-9]+$/.test(rawName)) url.searchParams.set(rawName, userName);
        if (rawEmail && /^entry\\.[0-9]+$/.test(rawEmail)) url.searchParams.set(rawEmail, userEmail);
      }
      return url.href;
    } catch { return null; }
  })();

  async function changeRegistration() {
    if (registrationBusy || !registrationReady || !event) return;
    setRegistrationBusy(true);
    setRegistrationMessage("");
    try {
      if (registered) await cancelEventRegistration(event.id);
      else await registerForEvent(event.id);
      setRegistered(!registered);
      try { setEvent(await fetchEventById(event.id)); } catch { /* Registration already succeeded. */ }
      setRegistrationMessage(registered ? "Your registration was cancelled." : "You're registered for this event.");
    } catch (err) {
      setRegistrationMessage(err.response?.data?.message || "Unable to change registration. Please try again.");
    } finally {
      setRegistrationBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 pb-12">
      <Link to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7e367a] hover:underline">
        <ArrowLeft size={17} /> Back to events
      </Link>
      {loading ? (
        <div role="status" className="rounded-3xl bg-white p-10 text-slate-600">Loading event details…</div>
      ) : error ? (
        <div role="alert" className="rounded-3xl border border-rose-200 bg-white p-10">
          <h1 className="text-2xl font-bold text-[#28162f]">Event unavailable</h1>
          <p className="mt-3 text-slate-600">{error}</p>
          <button type="button" onClick={() => setRetryKey(key => key + 1)} className="mt-5 mr-4 rounded-xl bg-[#7e367a] px-4 py-2 font-semibold text-white">Retry</button>
          <Link to="/events" className="mt-5 inline-block font-semibold text-[#7e367a] underline">Browse events</Link>
        </div>
      ) : event ? (
        <article className="overflow-hidden rounded-3xl border border-[#eaddea] bg-white shadow-sm">
          {event.bannerUrl && (
            <img src={event.bannerUrl} alt={event.title} className="max-h-80 w-full object-cover" />
          )}
          <div className="space-y-7 p-6 md:p-10">
            <div>
              <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-[#7e367a]">
                <span className="rounded-full bg-[#f4e3ed] px-3 py-1">{event.category?.replaceAll("_", " ") || "Event"}</span>
                <span className="rounded-full bg-[#f4e3ed] px-3 py-1">{event.status || "Scheduled"}</span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold text-[#28162f] md:text-4xl">{event.title}</h1>
              <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">{event.description}</p>
            </div>
            <div className="grid gap-4 rounded-2xl bg-[#fbf5f9] p-5 text-sm text-slate-700 md:grid-cols-2">
              <Info icon={CalendarDays} label="Starts" value={formatDate(event.startTime)} />
              <Info icon={Clock3} label="Ends" value={formatDate(event.endTime)} />
              <Info icon={MapPin} label="Venue" value={event.venue || "To be announced"} />
              <Info icon={Building2} label="Organized by" value={event.clubName || "CampusConnect"} />
              <Info icon={Users} label="Capacity" value={String(event.capacity)} />
              <Info icon={CalendarDays} label="Registration deadline" value={formatDate(event.registrationDeadline)} />
            </div>
            <section className="rounded-xl border border-[#eaddea] bg-[#fbf5f9] p-5">
              <h2 className="text-lg font-bold text-[#28162f]">Your registration</h2>
              {registrationClosed ? (
                <p className="mt-3 font-semibold text-slate-600">Registration closed</p>
              ) : externalForm ? (
                googleFormUrl ? <>
                  <a href={googleFormUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-[#172B4D] px-5 py-3 font-semibold text-white">Register via Google Forms ↗</a>
                  <p className="mt-2 text-sm text-slate-600">Registration is managed by the organizer. Opening this form does not reserve a seat in CampusConnect.</p>
                </> : <p role="alert" className="mt-3 text-rose-700">Registration link is invalid. Contact the organizer.</p>
              ) : <>
                <p className="mt-1 text-sm text-slate-600">{registered ? "You have a seat reserved." : "Reserve a seat through CampusConnect."}</p>
                <button type="button" disabled={registrationBusy || !registrationReady || (!registered && (event.availableSeats <= 0 || event.status !== "UPCOMING"))}
                  onClick={changeRegistration} className="mt-4 rounded-xl bg-[#172B4D] px-5 py-3 font-semibold text-white disabled:opacity-50">
                  {registrationBusy ? "Processing…" : registered ? "Cancel registration" : "Register for event"}
                </button>
              </>}
              {registrationMessage && <p role="status" className="mt-3 text-sm text-slate-700">{registrationMessage}</p>}
              {!registrationReady && <button type="button" onClick={() => setRetryKey(key => key + 1)} className="mt-3 block text-sm font-semibold text-[#7e367a] underline">Retry registration status</button>}
            </section>
          </div>
        </article>
      ) : null}
    </main>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={19} className="mt-0.5 shrink-0 text-[#7e367a]" aria-hidden="true" />
      <div><p className="font-semibold text-[#7e367a]">{label}</p><p className="mt-1">{value}</p></div>
    </div>
  );
}
