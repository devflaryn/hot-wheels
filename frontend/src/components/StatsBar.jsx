import { useLang } from '../lib/i18n.jsx';

export default function StatsBar({ user, year, totalInYear, ownedInYear, ownedTotal }) {
  const { t } = useLang();
  const pct = totalInYear ? Math.round((ownedInYear / totalInYear) * 100) : 0;

  return (
    <section className="mb-6 rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-hw-navy">
            {t('welcomeBack')}
            {user?.displayName ? `, ${user.displayName}` : ''}!
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {t('statsOwn', { owned: ownedInYear, total: totalInYear, year, all: ownedTotal })}
          </p>
        </div>
        <div className="text-right">
          <span className="font-display text-3xl font-extrabold text-hw-orange">{pct}%</span>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {t('pctCollected', { year })}
          </p>
        </div>
      </div>
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-hw-orange to-hw-yellow transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}
