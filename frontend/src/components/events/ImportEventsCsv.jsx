import { useState } from "react";
import api from "../../api/axios";

export default function ImportEventsCsv() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await api.post("/admin/import/events/csv", body, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to import this CSV.");
    } finally { setBusy(false); }
  }
  return <section className="rounded-3xl border border-[#eaddea] bg-white p-6 md:p-8">
    <h2 className="text-xl font-bold text-[#28162f]">Bulk import events</h2>
    <p className="mt-2 text-sm text-slate-600">Upload a UTF-8 CSV with clubId, title, description, venue, startTime, endTime, registrationDeadline, capacity and category. Use ISO UTC timestamps (e.g. 2026-12-01T10:00:00Z). Maximum 1 MB.</p>
    <form onSubmit={submit} className="mt-4 flex flex-wrap items-center gap-3">
      <input type="file" accept=".csv,text/csv" required onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm" />
      <button type="submit" disabled={!file || busy} className="rounded-xl bg-[#7e367a] px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Importing…" : "Import CSV"}</button>
    </form>
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    {result && <div role="status" className="mt-4 text-sm">
      <p className="font-semibold">Imported: {result.imported}; failed: {result.failed}</p>
      {result.errors?.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5">{result.errors.map((text, i) => <li key={i}>{text}</li>)}</ul>}
    </div>}
    <p className="mt-3 text-xs text-slate-500">Review source data before uploading. Re-importing the same CSV may create duplicate events until external-ID deduplication is added.</p>
  </section>;
}
