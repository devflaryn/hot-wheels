import { assetUrl } from '../lib/api';
import { useLang } from '../lib/i18n.jsx';

export default function CarCard({ car, item, onToggle, onOpen }) {
  const { t } = useLang();
  const owned = !!item?.owned;
  const photo = assetUrl(item?.photos?.[0]?.url);
  const photoCount = item?.photos?.length || 0;

  return (
    <div
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg ${
        owned ? 'ring-2 ring-hw-orange/70' : ''
      }`}
      onClick={onOpen}
    >
      {/* Photo / placeholder */}
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {photo ? (
          <img
            src={photo}
            alt={car.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <svg viewBox="0 0 24 24" className="h-14 w-14 text-slate-300" fill="currentColor">
            <path d="M18.9 6.4a2 2 0 0 0-1.8-1.1H6.9a2 2 0 0 0-1.8 1.1L3 10v7a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-7l-2.1-3.6ZM6.5 13.5A1.5 1.5 0 1 1 8 12a1.5 1.5 0 0 1-1.5 1.5Zm11 0A1.5 1.5 0 1 1 19 12a1.5 1.5 0 0 1-1.5 1.5ZM5.3 9.5l1.4-2.7a.5.5 0 0 1 .4-.3h9.8a.5.5 0 0 1 .4.3l1.4 2.7Z" />
          </svg>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-hw-navy px-2.5 py-1 text-xs font-bold text-white shadow">
          #{car.collectorNumber}
        </span>
        {photoCount > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
            📷 {photoCount}
          </span>
        )}
        {item?.condition && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-hw-navy shadow">
            {t('conditionNames')[item.condition] || item.condition}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {car.name}
        </h3>
        <p className="text-xs text-slate-500">
          {car.series}
          {car.seriesPosition ? ` · ${car.seriesPosition}` : ''}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <label
            className="flex cursor-pointer select-none items-center gap-2 text-xs font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={owned}
              onChange={onToggle}
              className="h-5 w-5 cursor-pointer rounded border-slate-300 accent-hw-orange"
            />
            <span className={owned ? 'text-hw-orange' : 'text-slate-400'}>
              {owned ? t('inMyGarage') : t('iOwnThis')}
            </span>
          </label>
          <span className="text-xs font-medium text-hw-blue opacity-0 transition group-hover:opacity-100">
            {t('details')}
          </span>
        </div>
      </div>
    </div>
  );
}
