import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
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
    <div className="auth-shell items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="auth-card max-w-md">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-50 text-brand shadow-sm">
            <ShieldCheck size={25} />
          </div>
          <div>
            <p className="label">Customer portal</p>
            <h1 className="text-3xl font-bold text-ink">Customer sign in</h1>
          </div>
        </div>

        {error ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="customer-email">
              Email address
            </label>
            <input className="field mt-1" id="customer-email" name="email" type="email" value={form.email} onChange={updateField} required />
          </div>

          <div>
            <label className="label" htmlFor="customer-password">
              Password
            </label>
            <div className="relative mt-1">
              <input
                className="field pr-12"
                id="customer-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/20 hover:text-cyan-200"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
              </button>
            </div>
          </div>
        </div>

        <button className="btn-primary mt-6 w-full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <Link className="mt-5 block text-center text-sm font-semibold text-brand hover:underline" to="/login">
          Staff sign in
        </Link>
      </form>
    </div>
  );
};

export default CustomerLogin;
