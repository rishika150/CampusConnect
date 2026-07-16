import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f9ff] px-6 py-10">
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3 font-bold text-slate-950">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white">
            C
          </span>
          CampusConnect
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:text-indigo-600"
          >
            Sign in
          </a>

          <a
            href="/register"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
          >
            Join now
          </a>
        </div>
      </nav>

      <section className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center">
        <div className="max-w-4xl">
          <span className="inline-flex rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
            Built for modern university communities
          </span>

          <h1 className="mt-7 text-6xl font-bold leading-[1.05] tracking-tight text-slate-950">
            Discover clubs.
            <br />
            Join meaningful events.
            <br />
            Build your campus story.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            CampusConnect brings student communities, university events, and
            opportunities together in one beautifully organized platform.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="/register"
              className="rounded-2xl bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Create your account
            </a>

            <a
              href="/login"
              className="rounded-2xl border border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
            >
              Sign in
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}