import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const Login = ({ onAuth }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <section className="hidden w-1/2 items-center justify-center bg-ink px-12 text-white lg:flex">
        <div className="max-w-md">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-md bg-coral">
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-4xl font-bold">Car Insurance Management System</h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Manage customers, vehicles, policies, claims, and premium payments from one secure
            operations console.
          </p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-4">
        <form onSubmit={submit} className="panel w-full max-w-md p-8">
          <div className="mb-8">
            <p className="label">Welcome back</p>
            <h2 className="mt-2 text-3xl font-bold text-ink">Sign in</h2>
          </div>

          {error ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

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
