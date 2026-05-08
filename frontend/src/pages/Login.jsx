import { BadgeIndianRupee, Car, ClipboardCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const Login = ({ onAuth }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setVerificationUrl("");
    setVerificationMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!form.email) {
      setError("Enter your email address first");
      return;
    }

    setResending(true);
    setError("");
    setVerificationMessage("");
    setVerificationUrl("");

    try {
      const { data } = await api.post("/auth/resend-verification", { email: form.email });
      setVerificationMessage(data.message || "Verification email sent");
      setVerificationUrl(data.verificationUrl || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const needsVerification = error.toLowerCase().includes("verify your email");

  return (
    <div className="auth-shell">
      <section className="relative hidden w-1/2 items-center justify-center px-12 text-white lg:flex">
        <div className="max-w-lg">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-md bg-white/15 text-white shadow-soft backdrop-blur">
            <ShieldCheck size={30} />
          </div>
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-100">Secure operations console</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight">Insurance Management System</h1>
          <p className="mt-5 text-base leading-7 text-slate-200">
            Manage customers, vehicles, policies, claims, and premium payments from one secure
            operations console.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="metric-tile">
              <Car size={20} className="mb-3 text-cyan-200" />
              <p className="text-xl font-bold">360°</p>
              <p className="text-xs text-slate-200">Policy view</p>
            </div>
            <div className="metric-tile">
              <ClipboardCheck size={20} className="mb-3 text-orange-200" />
              <p className="text-xl font-bold">Fast</p>
              <p className="text-xs text-slate-200">Claim flow</p>
            </div>
            <div className="metric-tile">
              <BadgeIndianRupee size={20} className="mb-3 text-emerald-200" />
              <p className="text-xl font-bold">Live</p>
              <p className="text-xs text-slate-200">Payments</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex flex-1 items-center justify-center px-4 py-10">
        <form onSubmit={submit} className="auth-card">
          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-cyan-50 text-brand shadow-sm">
              <ShieldCheck size={25} />
            </div>
            <div>
              <p className="label">Welcome back</p>
              <h2 className="mt-2 text-3xl font-bold text-ink">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">Access your policies, claims, payments, and reports.</p>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              <p>{error}</p>
              {needsVerification ? (
                <button className="mt-3 font-semibold text-red-800 underline" type="button" onClick={resendVerification} disabled={resending}>
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              ) : null}
            </div>
          ) : null}

          {verificationMessage ? (
            <div className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <p>{verificationMessage}</p>
              {verificationUrl ? (
                <a className="mt-2 inline-block font-semibold text-emerald-800 underline" href={verificationUrl}>
                  Verify email now
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input className="field mt-1" id="email" name="email" type="email" value={form.email} onChange={updateField} required />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input className="field mt-1" id="password" name="password" type="password" value={form.password} onChange={updateField} required />
            </div>
          </div>

          <button className="btn-primary mt-6 w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            New company user?{" "}
            <Link className="font-semibold text-brand hover:underline" to="/register">
              Create account
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default Login;
