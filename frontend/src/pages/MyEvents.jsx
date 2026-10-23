import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Ticket, X } from "lucide-react";
import { fetchMyEventRegistrations, cancelEventRegistration } from "../services/eventService";

export default function MyEvents() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchMyEventRegistrations()
      .then((data) => { if (active) setRegistrations(data); })
      .catch(() => { if (active) { setRegistrations([]); setError("Could not load your event registrations."); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  async function cancel(eventId) {
    if (busy !== null) return;
    setBusy(eventId);
    setError("");
    try {
      await cancelEventRegistration(eventId);
      setRegistrations((current) => current.filter((r) => r.eventId !== eventId));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel registration.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#7e367a]">Your campus calendar</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#28162f]">My Events</h1>
        <p className="mt-2 text-slate-600">Manage the events you have registered for.</p>
      </header>
      {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>}
      {!loading && error && <button type="button" onClick={() => setRefreshKey(key => key + 1)} className="mb-5 rounded-xl border border-[#eaddea] bg-white px-4 py-2 font-semibold">Retry loading registrations</button>}
      {loading ? (
        <div role="status" className="rounded-2xl bg-white p-8 text-slate-600">Loading registrations…</div>
      ) : error && registrations.length === 0 ? null : registrations.length === 0 ? (
        <div className="rounded-3xl border border-[#eaddea] bg-white p-10 text-center">
          <CalendarDays className="mx-auto text-[#7e367a]" size={36} />
          <h2 className="mt-4 text-xl font-bold text-[#28162f]">No registered events yet</h2>
          <p className="mt-2 text-slate-600">Explore upcoming activities and reserve a seat.</p>
          <Link to="/events" className="mt-5 inline-block rounded-xl bg-[#7e367a] px-5 py-3 font-bold text-white">Explore events</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {registrations.map((registration) => (
            <article key={registration.registrationId} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#eaddea] bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Ticket className="mt-1 text-[#7e367a]" size={22} />
                <div>
                  <Link to={`/events/${registration.eventId}`} className="text-lg font-bold text-[#28162f] hover:text-[#7e367a]">{registration.eventTitle}</Link>
                  <p className="mt-1 text-sm text-slate-600">Registered {new Date(registration.registeredAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
              </div>
              <button type="button" onClick={() => cancel(registration.eventId)} disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50">
                <X size={16} /> {busy === registration.eventId ? "Cancelling…" : "Cancel registration"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
