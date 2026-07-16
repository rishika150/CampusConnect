import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function WelcomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-8 py-16">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-12 shadow-xl">

        <span className="rounded-full bg-indigo-100 px-4 py-2 text-indigo-700 font-semibold">
          CampusConnect
        </span>

        <h1 className="mt-6 text-5xl font-bold text-slate-900">
          Discover Clubs.
          <br />
          Join Events.
          <br />
          Build Your Campus Community.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          CampusConnect helps students discover university clubs, participate in
          events, and collaborate through a secure platform powered by Spring
          Boot and React.
        </p>

        <div className="mt-10 flex gap-4">
          <button className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">
            Explore Clubs
          </button>

          <button className="rounded-xl border border-slate-300 px-6 py-3 font-semibold">
            View Events
          </button>
        </div>

      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}