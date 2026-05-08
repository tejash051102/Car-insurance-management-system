import { ShieldPlus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const Register = ({ onAuth }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "agent"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verification, setVerification] = useState(null);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setVerification(null);
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", form);
      if (data.isEmailVerified && data.token) {
        onAuth(data);
        return;
      }
      setVerification(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="auth-card max-w-xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-50 text-brand shadow-sm">
            <ShieldPlus size={26} />
          </div>
          <div>
            <p className="label">Company access</p>
            <h1 className="text-3xl font-bold text-ink">Create an account</h1>
            <p className="mt-1 text-sm text-slate-500">Set up a secure workspace profile.</p>
          </div>
        </div>
        <div className="mb-5 flex items-center gap-2 rounded-md border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm text-brand">
          <Sparkles size={16} />
          Choose the correct role to unlock matching dashboard actions.
        </div>

        {verification ? (
          <div className="mb-5 rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <p className="font-semibold">Check your email to verify this account.</p>
            <p className="mt-1 text-emerald-700">
              We sent a verification link to {verification.email}. You can sign in after the email is verified.
            </p>
            {verification.verificationUrl ? (
              <a className="mt-3 inline-block font-semibold underline" href={verification.verificationUrl}>
                Verify email now
              </a>
            ) : null}
          </div>
        ) : null}

        {error ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input className="field mt-1" id="name" name="name" value={form.name} onChange={updateField} required />
          </div>
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
            <input className="field mt-1" id="password" name="password" type="password" value={form.password} onChange={updateField} required minLength={6} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="role">
              Role
            </label>
            <select className="field mt-1" id="role" name="role" value={form.role} onChange={updateField}>
              <option value="agent">Agent</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button className="btn-primary mt-6 w-full" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link className="font-semibold text-brand hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
