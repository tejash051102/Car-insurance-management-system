import { AlertTriangle, Download, Fingerprint, LockKeyhole, Search, ShieldAlert, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Pagination from "../components/Pagination.jsx";
import { getItems, getMeta } from "../utils/apiData.js";
import { downloadReport } from "../utils/download.js";

const severityStyles = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700"
};

const SecurityDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState("");

  const loadSecurity = async (page = 1, term = search) => {
    setError("");
    try {
      const [summaryResponse, eventsResponse] = await Promise.all([
        api.get("/security/summary", { params: { days: 7 } }),
        api.get("/security/events", { params: { page, limit: 10, ...(term ? { search: term } : {}) } })
      ]);
      setSummary(summaryResponse.data);
      setEvents(getItems(eventsResponse.data));
      setMeta(getMeta(eventsResponse.data));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSecurity();
  }, []);

  const cards = [
    { label: "Security events", value: summary?.totalEvents || 0, icon: ShieldAlert },
    { label: "Failed logins", value: summary?.failedLogins || 0, icon: AlertTriangle },
    { label: "Locked accounts", value: summary?.lockedAccounts || 0, icon: LockKeyhole },
    { label: "High risk events", value: summary?.criticalEvents || 0, icon: Fingerprint }
  ];

  const maxFailures = Math.max(...(summary?.dailyFailures || []).map((item) => item.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Cyber threat monitoring</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Security Dashboard</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              loadSecurity(1, search);
            }}
          >
            <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search event, IP, email" />
            <button className="btn-secondary" type="submit" aria-label="Search security events">
              <Search size={16} />
            </button>
          </form>
          <button className="btn-secondary" type="button" onClick={() => downloadReport("/security/report", "security-report.pdf")}>
            <Download size={16} />
            Report
          </button>
        </div>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-ink">{card.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-50 text-brand">
                <card.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel p-5">
          <h3 className="text-lg font-bold text-ink">Failed Login Trend</h3>
          <div className="mt-5 flex h-44 items-end gap-3">
            {(summary?.dailyFailures || []).map((item) => (
              <div key={item._id} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-red-400" style={{ height: `${Math.max((item.count / maxFailures) * 150, 12)}px` }} />
                <span className="text-xs text-slate-500">{item._id.slice(5)}</span>
              </div>
            ))}
            {!summary?.dailyFailures?.length ? <p className="w-full text-center text-sm text-slate-500">No failed login activity in the last 7 days.</p> : null}
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="text-lg font-bold text-ink">Top Source IPs</h3>
          <div className="mt-4 space-y-3">
            {(summary?.topIps || []).map((ip) => (
              <div key={ip._id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">
                  <Wifi size={16} className="shrink-0 text-brand" />
                  <span className="truncate">{ip._id}</span>
                </span>
                <span className="text-xs text-slate-500">{ip.count} events / {ip.failed} failed</span>
              </div>
            ))}
            {!summary?.topIps?.length ? <p className="text-sm text-slate-500">No IP activity captured yet.</p> : null}
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-bold text-ink">Security Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{event.type}</p>
                    <p className="max-w-md truncate text-xs text-slate-500">{event.message}</p>
                  </td>
                  <td className="px-4 py-3">{event.email || event.user?.email || "N/A"}</td>
                  <td className="px-4 py-3">{event.ipAddress || "N/A"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${severityStyles[event.severity] || severityStyles.low}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{event.createdAt?.slice(0, 19).replace("T", " ")}</td>
                </tr>
              ))}
              {!events.length ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    No security events found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={(page) => loadSecurity(page, search)} />
      </section>
    </div>
  );
};

export default SecurityDashboard;
