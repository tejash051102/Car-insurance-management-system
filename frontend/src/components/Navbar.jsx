import { LogOut, Menu, UserCircle } from "lucide-react";

const Navbar = ({ user, onLogout, onMenuClick }) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button
          className="btn-secondary h-10 w-10 px-0 lg:hidden"
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Insurance Management</p>
          <h1 className="text-lg font-bold text-ink">System</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
          <UserCircle size={18} className="text-brand" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink">{user?.name || "Agent"}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role || "agent"}</p>
          </div>
        </div>
        <button onClick={onLogout} className="btn-secondary" type="button">
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
