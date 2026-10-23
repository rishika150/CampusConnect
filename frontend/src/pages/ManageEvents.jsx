import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchClubs, fetchMyClubs } from "../services/ClubService";
import { createClub, createEvent } from "../services/managementService";
import ManageExistingEvents from "../components/events/ManageExistingEvents";
import ManageClubRoles from "../components/events/ManageClubRoles";
import ImportEventsCsv from "../components/events/ImportEventsCsv";

const eventCategories = ["WORKSHOP", "HACKATHON", "SEMINAR", "TECH_TALK", "CULTURAL", "SPORTS", "NETWORKING", "OTHER"];
const clubCategories = ["TECHNOLOGY", "CULTURAL", "SPORTS", "LITERARY", "MUSIC", "DANCE", "ENTREPRENEURSHIP", "SOCIAL_SERVICE", "ACADEMIC", "OTHER"];
const inputStyle = "w-full rounded-xl border border-[#eaddea] bg-white px-4 py-3 text-[#28162f] outline-none focus:border-[#7e367a]";
const initialEvent = { clubId: "", title: "", description: "", venue: "", startTime: "", endTime: "", registrationDeadline: "", capacity: 50, category: "WORKSHOP", bannerUrl: "" };
const initialClub = { name: "", description: "", category: "TECHNOLOGY", logoUrl: "", contactEmail: "" };

function toInstant(value) {
  const result = new Date(value);
  if (Number.isNaN(result.getTime())) throw new Error("Enter valid dates and times.");
  return result.toISOString();
}

async function fetchAllClubs() {
  const first = await fetchClubs({ page: 0, size: 50 });
  const totalPages = first.totalPages ?? 1;
  const all = [...(first.content ?? [])];
  for (let page = 1; page < totalPages; page += 1) {
    const next = await fetchClubs({ page, size: 50 });
    all.push(...(next.content ?? []));
  }
  return all;
}

export default function ManageEvents() {
  const { user } = useAuth();
  const admin = user?.role === "UNIVERSITY_ADMIN";
  const [clubs, setClubs] = useState([]);
  const [eventForm, setEventForm] = useState(initialEvent);
  const [clubForm, setClubForm] = useState(initialClub);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refreshClubs() {
    const [allClubs, memberships] = await Promise.all([
      admin ? fetchAllClubs() : Promise.resolve([]),
      fetchMyClubs(),
    ]);
    const allowed = admin
      ? allClubs
      : memberships.filter((m) => ["COORDINATOR", "ADMIN"].includes(m.membershipRole)).map((m) => m.club);
    setClubs(allowed);
    setEventForm((current) => ({ ...current, clubId: allowed.some((c) => String(c.id) === String(current.clubId)) ? current.clubId : String(allowed[0]?.id ?? "") }));
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [all, memberships] = await Promise.all([
          admin ? fetchAllClubs() : Promise.resolve([]),
          fetchMyClubs(),
        ]);
        if (!active) return;
        const allowed = admin ? all : memberships.filter((m) => ["COORDINATOR", "ADMIN"].includes(m.membershipRole)).map((m) => m.club);
        setClubs(allowed);
        setEventForm((current) => ({ ...current, clubId: String(allowed[0]?.id ?? "") }));
      } catch {
        if (active) setError("Unable to load your club permissions.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [admin]);

  async function saveEvent(e) {
    e.preventDefault();
    setError(""); setNotice(""); setSaving(true);
    try {
      const payload = { ...eventForm, clubId: Number(eventForm.clubId), capacity: Number(eventForm.capacity),
        startTime: toInstant(eventForm.startTime), endTime: toInstant(eventForm.endTime),
        registrationDeadline: toInstant(eventForm.registrationDeadline),
        bannerUrl: eventForm.bannerUrl.trim() || null };
      if (!(payload.registrationDeadline < payload.startTime && payload.startTime < payload.endTime))
        throw new Error("Registration must close before the event begins, and its end must follow its start.");
      const saved = await createEvent(payload);
      setNotice("Event created successfully.");
      setRefreshKey(key => key + 1);
      setEventForm({ ...initialEvent, clubId: String(saved.clubId) });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to create event.");
    } finally { setSaving(false); }
  }

  async function saveClub(e) {
    e.preventDefault();
    setError(""); setNotice(""); setSaving(true);
    try {
      await createClub(clubForm);
      setClubForm(initialClub);
      await refreshClubs();
      setNotice("Club created successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create club.");
    } finally { setSaving(false); }
  }

  if (!admin && !loading && clubs.length === 0)
    return <div className="rounded-3xl bg-white p-8"><h1 className="text-2xl font-bold">Event management</h1><p className="mt-3">Only assigned club coordinators or university administrators can manage events.</p><Link className="mt-4 inline-block text-[#7e367a] underline" to="/events">Browse events</Link></div>;

  return <div className="mx-auto max-w-4xl space-y-7 pb-10">
    <header><p className="text-sm font-bold uppercase tracking-widest text-[#7e367a]">Coordinator workspace</p>
      <h1 className="mt-2 text-3xl font-extrabold text-[#28162f]">Manage campus events</h1>
      <p className="mt-2 text-slate-600">Publish events for clubs you have permission to manage.</p></header>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{notice}</p>}
    {loading ? <p>Loading permissions…</p> : <>
      <section className="rounded-3xl border border-[#eaddea] bg-white p-6 md:p-8">
        <h2 className="text-xl font-bold text-[#28162f]">Create event</h2>
        {clubs.length === 0 ? <p className="mt-3">Create a club before publishing an event.</p> :
        <form onSubmit={saveEvent} className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Organizing club"><select required className={inputStyle} value={eventForm.clubId} onChange={e => setEventForm({...eventForm,clubId:e.target.value})}>{clubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}</select></Field>
          <Field label="Category"><select className={inputStyle} value={eventForm.category} onChange={e => setEventForm({...eventForm,category:e.target.value})}>{eventCategories.map(category=><option key={category}>{category}</option>)}</select></Field>
          <Field label="Title"><input required minLength={3} maxLength={120} className={inputStyle} value={eventForm.title} onChange={e=>setEventForm({...eventForm,title:e.target.value})}/></Field>
          <Field label="Venue"><input required minLength={3} maxLength={250} className={inputStyle} value={eventForm.venue} onChange={e=>setEventForm({...eventForm,venue:e.target.value})}/></Field>
          <Field label="Starts"><input required type="datetime-local" className={inputStyle} value={eventForm.startTime} onChange={e=>setEventForm({...eventForm,startTime:e.target.value})}/></Field>
          <Field label="Ends"><input required type="datetime-local" className={inputStyle} value={eventForm.endTime} onChange={e=>setEventForm({...eventForm,endTime:e.target.value})}/></Field>
          <Field label="Registration closes"><input required type="datetime-local" className={inputStyle} value={eventForm.registrationDeadline} onChange={e=>setEventForm({...eventForm,registrationDeadline:e.target.value})}/></Field>
          <Field label="Capacity"><input required type="number" min="1" max="100000" className={inputStyle} value={eventForm.capacity} onChange={e=>setEventForm({...eventForm,capacity:e.target.value})}/></Field>
          <Field label="Banner URL (optional)"><input type="url" className={inputStyle} value={eventForm.bannerUrl} onChange={e=>setEventForm({...eventForm,bannerUrl:e.target.value})}/></Field>
          <div className="md:col-span-2"><Field label="Description"><textarea required minLength={20} maxLength={3000} rows={5} className={inputStyle} value={eventForm.description} onChange={e=>setEventForm({...eventForm,description:e.target.value})}/></Field></div>
          <button disabled={saving} className="rounded-xl bg-[#7e367a] px-6 py-3 font-bold text-white disabled:opacity-50 md:col-span-2">{saving ? "Publishing…" : "Publish event"}</button>
        </form>}
      </section>
      {clubs.length > 0 && <ManageExistingEvents clubs={clubs} refreshKey={refreshKey} />}
      {admin && clubs.length > 0 && <ManageClubRoles clubs={clubs} />}
      {admin && <ImportEventsCsv />}
      {admin && <section className="rounded-3xl border border-[#eaddea] bg-white p-6 md:p-8">
        <h2 className="text-xl font-bold text-[#28162f]">Create club</h2>
        <form onSubmit={saveClub} className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Club name"><input required minLength={2} maxLength={120} className={inputStyle} value={clubForm.name} onChange={e=>setClubForm({...clubForm,name:e.target.value})}/></Field>
          <Field label="Category"><select className={inputStyle} value={clubForm.category} onChange={e=>setClubForm({...clubForm,category:e.target.value})}>{clubCategories.map(category=><option key={category}>{category}</option>)}</select></Field>
          <Field label="Contact email"><input required type="email" className={inputStyle} value={clubForm.contactEmail} onChange={e=>setClubForm({...clubForm,contactEmail:e.target.value})}/></Field>
          <Field label="Logo URL (optional)"><input type="url" className={inputStyle} value={clubForm.logoUrl} onChange={e=>setClubForm({...clubForm,logoUrl:e.target.value})}/></Field>
          <div className="md:col-span-2"><Field label="Description"><textarea required minLength={20} maxLength={2000} rows={4} className={inputStyle} value={clubForm.description} onChange={e=>setClubForm({...clubForm,description:e.target.value})}/></Field></div>
          <button disabled={saving} className="rounded-xl bg-[#7e367a] px-6 py-3 font-bold text-white disabled:opacity-50 md:col-span-2">{saving ? "Saving…" : "Create club"}</button>
        </form>
      </section>}
    </>}
  </div>;
}
function Field({label,children}) {return <label className="block space-y-2"><span className="block text-sm font-semibold text-[#501260]">{label}</span>{children}</label>;}
