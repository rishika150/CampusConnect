import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function ComingSoon({ title }) {
  return (
    <div className="mx-auto max-w-3xl rounded-[28px] border border-white bg-white/80 p-10 text-center shadow-[0_15px_45px_rgba(36,42,89,0.07)]">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-indigo-100 text-2xl">
        ✨
      </div>

      <h2 className="mt-5 text-3xl font-bold text-[#181b2e]">
        {title}
      </h2>

      <p className="mt-3 text-slate-500">
        This CampusConnect experience is being prepared next.
      </p>
    </div>
  );
}

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f5fb] px-6 py-8">
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-300/35 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-violet-300/35 blur-3xl" />

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3 font-bold text-[#181b2e]">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-200">
            C
          </span>
          CampusConnect
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="rounded-xl px-4 py-2 font-semibold text-slate-600 transition hover:text-indigo-600"
          >
            Sign in
          </a>

          <a
            href="/register"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            Join now
          </a>
        </div>
      </nav>

      <section className="relative mx-auto flex min-h-[80vh] max-w-7xl items-center">
        <div className="max-w-4xl">
          <span className="inline-flex rounded-full border border-indigo-100 bg-white/75 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm backdrop-blur">
            Built for modern university communities
          </span>

          <h1 className="mt-7 text-5xl font-bold leading-[1.06] tracking-tight text-[#181b2e] sm:text-6xl">
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
              className="rounded-2xl border border-white bg-white/80 px-7 py-3.5 font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-indigo-200 hover:text-indigo-700"
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
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route
                path="/clubs"
                element={<ComingSoon title="Discover Clubs" />}
              />

              <Route
                path="/clubs/:clubId"
                element={<ComingSoon title="Club Details" />}
              />

              <Route
                path="/my-clubs"
                element={<ComingSoon title="My Clubs" />}
              />

              <Route
                path="/events"
                element={<ComingSoon title="Campus Events" />}
              />

              <Route
                path="/events/:eventId"
                element={<ComingSoon title="Event Details" />}
              />

              <Route
                path="/profile"
                element={<ComingSoon title="Your Profile" />}
              />

              <Route
                path="/settings"
                element={<ComingSoon title="Settings" />}
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}