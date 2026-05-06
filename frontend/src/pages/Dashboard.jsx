import {
  BadgeIndianRupee,
  ClipboardCheck,
  FileCheck2,
  ShieldCheck,
  Users,
  Car
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import DashboardCard from "../components/DashboardCard.jsx";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get("/dashboard");
        setStats(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadStats();
  }, []);

  const totals = stats?.totals || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Overview</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Insurance Operations Dashboard</h2>
        </div>
        <p className="text-sm text-slate-500">Live figures from policies, claims, and payments.</p>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Customers" value={totals.customers || 0} icon={Users} accent="brand" />
        <DashboardCard title="Vehicles" value={totals.vehicles || 0} icon={Car} accent="mint" />
        <DashboardCard title="Active Policies" value={totals.activePolicies || 0} icon={ShieldCheck} accent="coral" />
        <DashboardCard title="Revenue" value={formatCurrency(totals.revenue)} icon={BadgeIndianRupee} accent="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileCheck2 size={20} className="text-brand" />
            <h3 className="text-lg font-bold text-ink">Recent Policies</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Policy</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Vehicle</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentPolicies || []).map((policy) => (
                  <tr key={policy._id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-semibold text-ink">{policy.policyNumber}</td>
                    <td className="px-3 py-3">{policy.customer?.fullName || "N/A"}</td>
                    <td className="px-3 py-3">{policy.vehicle?.registrationNumber || "N/A"}</td>
                    <td className="px-3 py-3 capitalize">{policy.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-coral" />
            <h3 className="text-lg font-bold text-ink">Recent Claims</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Claim</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentClaims || []).map((claim) => (
                  <tr key={claim._id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-semibold text-ink">{claim.claimNumber}</td>
                    <td className="px-3 py-3">{claim.customer?.fullName || "N/A"}</td>
                    <td className="px-3 py-3">{formatCurrency(claim.claimAmount)}</td>
                    <td className="px-3 py-3 capitalize">{claim.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
