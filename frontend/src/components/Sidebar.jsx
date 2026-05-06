import {
  BadgeIndianRupee,
  ClipboardCheck,
  FileText,
  Gauge,
  ShieldCheck,
  Users,
  Car
} from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { label: "Dashboard", to: "/", icon: Gauge },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Vehicles", to: "/vehicles", icon: Car },
  { label: "Policies", to: "/policies", icon: ShieldCheck },
  { label: "Claims", to: "/claims", icon: ClipboardCheck },
  { label: "Payments", to: "/payments", icon: BadgeIndianRupee }
];

const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white">
          <FileText size={22} />
        </div>
        <div>
          <p className="text-sm font-bold text-ink">AutoSure</p>
          <p className="text-xs text-slate-500">Insurance Management</p>
        </div>
      </div>
      <nav className="space-y-1 px-3 py-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-cyan-50 text-brand"
                  : "text-slate-600 hover:bg-slate-100 hover:text-ink"
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
