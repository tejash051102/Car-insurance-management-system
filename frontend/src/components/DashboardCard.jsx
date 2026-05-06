const DashboardCard = ({ title, value, icon: Icon, accent = "brand", subtitle }) => {
  const accents = {
    brand: "bg-cyan-50 text-brand",
    coral: "bg-orange-50 text-coral",
    mint: "bg-emerald-50 text-mint",
    slate: "bg-slate-100 text-slate-700"
  };

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">{title}</p>
          <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-md ${accents[accent]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
