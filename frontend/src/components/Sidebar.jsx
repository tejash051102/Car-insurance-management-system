import {
  BadgeIndianRupee,
  ClipboardCheck,
  FileText,
  Gauge,
  History,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
  Car,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { canManageRecords, isAdmin } from "../utils/auth.js";

const items = [
  { label: "Dashboard", to: "/", icon: Gauge },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Vehicles", to: "/vehicles", icon: Car },
  { label: "Policies", to: "/policies", icon: ShieldCheck },
  { label: "Claims", to: "/claims", icon: ClipboardCheck },
  { label: "Payments", to: "/payments", icon: BadgeIndianRupee },
  { label: "Users", to: "/users", icon: UserCog, adminOnly: true },
  { label: "Security", to: "/security", icon: ShieldAlert, managerOnly: true },
  { label: "Activity", to: "/activities", icon: History, managerOnly: true }
];

const SidebarContent = ({ onClose }) => (
  <>
    <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/15 text-white shadow-sm">
          <FileText size={22} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Insurance</p>
          <p className="text-xs text-cyan-100">Management System</p>
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
      {items.filter((item) => (!item.managerOnly || canManageRecords()) && (!item.adminOnly || isAdmin())).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-white text-brand shadow-sm"
                : "text-cyan-50 hover:bg-white/10 hover:text-white"
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
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-cyan-900/20 bg-brand transition-transform duration-200 lg:z-30 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  );
};

export default Sidebar;
