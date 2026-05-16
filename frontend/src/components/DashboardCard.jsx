const DashboardCard = ({ title, value, icon: Icon, accent = "brand", subtitle }) => {
  const accents = {
    brand: "bg-cyan-400/10 text-cyan-300 ring-cyan-300/20",
    coral: "bg-orange-400/10 text-orange-300 ring-orange-300/20",
    mint: "bg-emerald-400/10 text-emerald-300 ring-emerald-300/20",
    slate: "bg-indigo-400/10 text-indigo-300 ring-indigo-300/20"
  };

  return (
    <div className="panel p-5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">{title}</p>
          <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-md shadow-sm ring-1 ${accents[accent]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
