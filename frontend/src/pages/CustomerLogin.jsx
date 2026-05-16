import { BadgeIndianRupee, ClipboardCheck, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import heroImage from "../assets/hero.png";
import AnimatedAuthBackground from "../components/AnimatedAuthBackground.jsx";
import { saveCustomerUser } from "../utils/authStorage.js";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/customer-portal/login", form);
      saveCustomerUser(data);
      navigate("/customer-portal", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden text-white">
      <AnimatedAuthBackground />

      <section className="relative z-10 hidden w-[52%] flex-col justify-center overflow-hidden border-r border-white/10 px-14 py-16 lg:flex">
        <img
          src={heroImage}
          alt="Customer insurance portal"
          className="pointer-events-none absolute bottom-10 right-8 w-56 opacity-80 drop-shadow-[0_28px_60px_rgba(14,165,233,0.28)] xl:w-72"
        />
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/15 shadow-lg shadow-cyan-950/30">
          <ShieldCheck size={26} className="text-cyan-300" strokeWidth={1.6} />
        </div>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Customer self service</p>
        <h1 className="max-w-md text-5xl font-bold leading-tight text-white">
          Insurance
          <br />
          Customer
          <br />
          Portal
        </h1>
        <p className="mt-6 max-w-sm text-sm leading-7 text-white/50">
          View policies, track claims, download receipts, and submit new claim requests from one secure portal.
        </p>

        <div className="mt-12 grid max-w-md grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
            <ClipboardCheck size={21} className="mb-3 text-orange-300" />
            <p className="text-lg font-bold text-white">Claims</p>
            <p className="mt-1 text-xs text-white/40">Track status</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
            <BadgeIndianRupee size={21} className="mb-3 text-emerald-300" />
            <p className="text-lg font-bold text-white">Receipts</p>
            <p className="mt-1 text-xs text-white/40">Download PDFs</p>
          </div>
        </div>
      </section>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <form
          onSubmit={submit}
          className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/[0.04] p-9 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/15">
              <ShieldCheck size={22} className="text-cyan-300" strokeWidth={1.6} />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-cyan-300">Welcome back</p>
              <h2 className="text-2xl font-bold text-white">Customer sign in</h2>
            </div>
          </div>

          <p className="mb-7 text-sm leading-6 text-white/40">Access your policies, claims, premium payments, and reports.</p>

          {error ? (
            <div className="mb-5 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/50" htmlFor="customer-email">
                Email address
              </label>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:bg-cyan-400/10"
                id="customer-email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/50" htmlFor="customer-password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:bg-cyan-400/10"
                  id="customer-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={updateField}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/20"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
                </button>
              </div>
            </div>
          </div>

          <button className="btn-primary mt-7 w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <Link className="mt-5 block text-center text-sm font-semibold text-cyan-300 hover:underline" to="/login">
            Staff sign in
          </Link>
        </form>
      </main>
    </div>
  );
};

export default CustomerLogin;
