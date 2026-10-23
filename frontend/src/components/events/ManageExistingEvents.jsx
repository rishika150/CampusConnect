import { useEffect, useState } from "react";
import { fetchEvents } from "../../services/eventService";
import { updateEvent, removeEvent } from "../../services/managementService";

function localDate(value) {
  if (!value) return "";
  const d = new Date(value);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}
const css = "w-full rounded-xl border border-[#eaddea] bg-white px-3 py-2 text-sm";

export default function ManageExistingEvents({ clubs, refreshKey = 0 }) {
  const [clubId, setClubId] = useState("");
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const effectiveClubId = clubs.some(c => String(c.id) === clubId) ? clubId : String(clubs[0]?.id ?? "");

  useEffect(() => { setPage(0); setEditing(null); }, [effectiveClubId]);

  useEffect(() => {
    if (!effectiveClubId) { setEvents([]); return; }
    let active = true;
    setError("");
    setLoading(true);
    fetchEvents({ clubId: Number(effectiveClubId), page, size: 10 })
      .then(data => { if (active) { setEvents(data.content || []); setTotalPages(data.totalPages ?? 0); } })
      .catch(() => { if (active) { setEvents([]); setError("Could not load events for this club."); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [effectiveClubId, page, refreshKey, reloadKey]);

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = {
        title: editing.title, description: editing.description, venue: editing.venue,
        clubId: Number(effectiveClubId), category: editing.category,
        capacity: Number(editing.capacity), bannerUrl: editing.bannerUrl || null,
        startTime: new Date(editing.startTime).toISOString(),
        endTime: new Date(editing.endTime).toISOString(),
        registrationDeadline: new Date(editing.registrationDeadline).toISOString(),
      };
      if (!(payload.registrationDeadline < payload.startTime && payload.startTime < payload.endTime))
        throw new Error("Registration must close before the event starts, and the event must end after it starts.");
      await updateEvent(editing.id, payload);
      setEditing(null);
      setMessage("Event updated successfully.");
      setReloadKey(key => key + 1);
    } catch (err) { setError(err.response?.data?.message || err.message || "Unable to update event."); }
    finally { setBusy(false); }
  }

  async function cancel(event) {
    if (!window.confirm(`Cancel "${event.title}"? This will remove it from public listings.`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await removeEvent(event.id);
      setEditing(null);
      setMessage("Event cancelled.");
      setReloadKey(key => key + 1);
    } catch (err) { setError(err.response?.data?.message || "Unable to cancel event."); }
    finally { setBusy(false); }
  }

  return <section className="rounded-3xl border border-[#eaddea] bg-white p-6 md:p-8">
    <h2 className="text-xl font-bold text-[#28162f]">Manage published events</h2>
    <label className="mt-4 block text-sm font-semibold">Club
      <select className={css + " mt-2"} value={effectiveClubId} onChange={e => setClubId(e.target.value)}>
        {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </label>
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-emerald-700">{message}</p>}
    <div className="mt-5 space-y-3">
      {loading && <p role="status" className="text-slate-600">Loading events…</p>}
      {!loading && !error && events.length === 0 && <p className="text-slate-600">No events found for this club.</p>}
      {!loading && !error && events.map(ev => <div key={ev.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eaddea] p-4">
        <div><p className="font-semibold text-[#28162f]">{ev.title}</p><p className="text-xs text-slate-600">{new Date(ev.startTime).toLocaleString("en-IN")}</p></div>
        <div className="flex gap-2">
          <button disabled={busy} className="rounded-lg bg-[#f4e3ed] px-3 py-2 text-sm font-semibold text-[#501260]" onClick={() => setEditing({ ...ev, startTime: localDate(ev.startTime), endTime: localDate(ev.endTime), registrationDeadline: localDate(ev.registrationDeadline) })}>Edit</button>
          <button disabled={busy} className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700" onClick={() => cancel(ev)}>Cancel</button>
        </div>
      </div>)}
    </div>
    <div className="mt-4 flex items-center gap-3 text-sm">
      <button type="button" disabled={page === 0 || busy || loading} onClick={() => setPage(p => p-1)} className="disabled:opacity-40">Previous</button>
      <span>Page {page+1} of {Math.max(totalPages,1)}</span>
      <button type="button" disabled={page+1 >= totalPages || busy || loading} onClick={() => setPage(p => p+1)} className="disabled:opacity-40">Next</button>
    </div>
    {editing && <form onSubmit={save} className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-2">
      <h3 className="font-bold sm:col-span-2">Edit {editing.title}</h3>
      {["title","venue","bannerUrl"].map(key => <label key={key} className="text-sm">{key}<input className={css} minLength={key === "title" || key === "venue" ? 3 : undefined} maxLength={key === "title" ? 120 : key === "venue" ? 250 : 500} value={editing[key] || ""} onChange={e=>setEditing({...editing,[key]:e.target.value})} required={key !== "bannerUrl"}/></label>)}
      <label className="text-sm">Category<select className={css} value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value})}>{["WORKSHOP","HACKATHON","SEMINAR","TECH_TALK","CULTURAL","SPORTS","NETWORKING","OTHER"].map(v=><option key={v}>{v}</option>)}</select></label>
      {["startTime","endTime","registrationDeadline"].map(key=><label key={key} className="text-sm">{key}<input type="datetime-local" required className={css} value={editing[key]} onChange={e=>setEditing({...editing,[key]:e.target.value})}/></label>)}
      <label className="text-sm">Capacity<input type="number" min="1" max="100000" required className={css} value={editing.capacity} onChange={e=>setEditing({...editing,capacity:e.target.value})}/></label>
      <label className="text-sm sm:col-span-2">Description<textarea minLength={20} maxLength={3000} required rows={4} className={css} value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})}/></label>
      <button disabled={busy} className="rounded-xl bg-[#7e367a] px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
      <button type="button" className="rounded-xl border px-4 py-3" onClick={()=>setEditing(null)}>Discard</button>
    </form>}
  </section>;
}
