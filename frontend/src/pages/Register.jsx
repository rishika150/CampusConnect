import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
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
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Unable to create your account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f8ff]">
      <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-lg"
        >
          <div className="rounded-[32px] border border-white/80 bg-white/90 p-7 shadow-2xl shadow-indigo-100/70 backdrop-blur-xl sm:p-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3 font-bold text-slate-950"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white">
                C
              </span>
              CampusConnect
            </Link>

            <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-950">
              Join your campus community
            </h1>

            <p className="mt-2 text-slate-500">
              Create an account and start discovering opportunities.
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Field
                label="Full name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Rishika Sharan"
                autoComplete="name"
              />

              <Field
                label="University email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@university.edu"
                autoComplete="email"
              />

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
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
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
                {submitting ? "Creating account…" : "Create account"}
                {!submitting && <ArrowRight size={19} />}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >
          <div className="rounded-[36px] bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 p-10 text-white shadow-2xl shadow-indigo-200">
            <GraduationCap size={54} />

            <h2 className="mt-8 text-4xl font-bold leading-tight">
              Everything happening on campus, in one beautiful space.
            </h2>

            <div className="mt-10 space-y-5">
              <Benefit text="Discover clubs aligned with your interests" />
              <Benefit text="Register for workshops and university events" />
              <Benefit text="Track activities through one student dashboard" />
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        required
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </label>
  );
}

function Benefit({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
      <CheckCircle2 size={21} className="shrink-0" />
      <span className="font-medium">{text}</span>
    </div>
  );
}