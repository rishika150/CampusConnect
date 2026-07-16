import { useState } from "react";
import { ArrowRight, CalendarDays, Eye, EyeOff, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      });

      navigate(location.state?.from ?? "/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f8ff]">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-xl font-bold text-slate-950"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              C
            </span>
            CampusConnect
          </Link>

          <div className="mt-16 max-w-xl">
            <span className="inline-flex rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
              Your campus, beautifully connected
            </span>

            <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-slate-950">
              Discover communities that make university life memorable.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Find student clubs, explore upcoming events, and build meaningful
              connections across campus.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Feature
                icon={Users}
                title="Find your community"
                description="Explore clubs built around your interests."
              />

              <Feature
                icon={CalendarDays}
                title="Never miss an event"
                description="Discover workshops, talks, and campus experiences."
              />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-lg"
        >
          <div className="rounded-[32px] border border-white/80 bg-white/90 p-7 shadow-2xl shadow-indigo-100/70 backdrop-blur-xl sm:p-10">
            <div className="lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-3 font-bold text-slate-950"
              >
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white">
                  C
                </span>
                CampusConnect
              </Link>
            </div>

            <h2 className="mt-8 text-3xl font-bold tracking-tight text-slate-950 lg:mt-0">
              Welcome back
            </h2>

            <p className="mt-2 text-slate-500">
              Sign in to continue exploring your campus.
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  University email
                </span>

                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@university.edu"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </span>

                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </label>

              <button
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in"}
                {!submitting && <ArrowRight size={19} />}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              New to CampusConnect?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Create an account
              </Link>
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-indigo-100/50 backdrop-blur">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon size={21} />
      </div>

      <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}