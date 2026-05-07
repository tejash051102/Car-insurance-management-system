import {
  BadgeIndianRupee,
  ClipboardCheck,
  FileText,
  Gauge,
  ShieldCheck,
  Users,
  Car,
  X
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

const SidebarContent = ({ onClose }) => (
  <>
    <div className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white">
          <FileText size={22} />
        </div>
        <div>
          <p className="text-sm font-bold text-ink">Insurance</p>
          <p className="text-xs text-slate-500">Management System</p>
        </div>
      </div>
      <button
        className="btn-secondary h-9 w-9 px-0 lg:hidden"
        type="button"
        onClick={onClose}
        aria-label="Close navigation"
      >
        <X size={16} />
      </button>
    </div>
    <nav className="space-y-1 px-3 py-5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClose}
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
  </>
);

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform duration-200 lg:z-30 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  );
};

export default Sidebar;
