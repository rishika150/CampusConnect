import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ManageClubRoles({ clubs }) {
  const [clubId, setClubId] = useState("");
  const selected = clubs.some(c => String(c.id) === clubId) ? clubId : String(clubs[0]?.id ?? "");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    setMembers([]); setError("");
    api.get(`/clubs/${selected}/members`)
      .then(r => { if (active) setMembers(r.data.data); })
      .catch(() => { if (active) setError("Unable to fetch club members."); });
    return () => { active = false; };
  }, [selected]);

  async function assign(userId, role) {
    setBusy(userId); setError(""); setNotice("");
    try {
      await api.put(`/clubs/${selected}/members/${userId}/role`, { role });
      setMembers(current => current.map(m => m.userId === userId ? { ...m, role } : m));
      setNotice("Membership role updated.");
    } catch (e) { setError(e.response?.data?.message || "Unable to update role."); }
    finally { setBusy(null); }
  }
  return <section className="rounded-3xl border border-[#eaddea] bg-white p-6 md:p-8">
    <h2 className="text-xl font-bold text-[#28162f]">Assign club coordinators</h2>
    <p className="mt-2 text-sm text-slate-600">Students must join a club before you can assign them a management role.</p>
    <label className="mt-4 block text-sm font-semibold">Select club
      <select value={selected} onChange={e=>setClubId(e.target.value)} className="mt-2 w-full rounded-xl border p-3">{clubs.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select>
    </label>
    {error && <p role="alert" className="mt-3 text-rose-700">{error}</p>}
    {notice && <p role="status" className="mt-3 text-emerald-700">{notice}</p>}
    <div className="mt-4 space-y-3">
      {members.length === 0 && <p className="text-sm text-slate-600">No club members found.</p>}
      {members.map(member=><div key={member.userId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
        <div><strong>{member.fullName}</strong><p className="text-xs text-slate-600">{member.email}</p></div>
        <label className="text-xs">Role
          <select aria-label={`Role for ${member.fullName}`} disabled={busy !== null} value={member.role} onChange={e=>assign(member.userId,e.target.value)} className="ml-2 rounded-lg border p-2 text-sm">
            {["MEMBER","COORDINATOR","ADMIN"].map(role=><option key={role}>{role}</option>)}
          </select>
        </label>
      </div>)}
    </div>
  </section>;
}
