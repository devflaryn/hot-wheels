import { assetUrl } from '../lib/api';
import { carImageUrl, classImageUrl } from '../lib/carImage';
import { useLang } from '../lib/i18n.jsx';
import cardBg from '../../assets/background_card.svg';

export default function CarCard({ car, item, onToggle, onOpen }) {
  const { t } = useLang();
  const owned = !!item?.owned;
  const catalogImage = carImageUrl(car);
  const classImage = classImageUrl(car);
  const photo = assetUrl(item?.photos?.[0]?.url);
  const photoCount = item?.photos?.length || 0;

  return (
    <div
      className="group relative cursor-pointer transition hover:-translate-y-0.5"
      onClick={onOpen}
    >
      {/* Blister-card artwork. The frame is the background_card.svg template;
          the collector number, series position and class art are drawn into
          its reserved spots in viewBox coordinates so they scale with it. */}
      <div className="relative" style={{ aspectRatio: '312 / 192' }}>
        <svg viewBox="0 0 312 192" className={`h-full w-full ${owned ? '' : 'grayscale'}`}>
          <image href={cardBg} width="312" height="192" />
          {classImage && (
            <image
              href={classImage}
              x="231"
              y="99"
              width="106"
              height="106"
              preserveAspectRatio="xMaxYMax meet"
            />
          )}
          <text x="306" y="64" textAnchor="end" fill="#68ADB7" fontSize="9" fontWeight="700">
            {Number(car.collectorNumber) || car.collectorNumber}/250
          </text>
          {car.seriesPosition && (
            <text x="298" y="108" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
              {car.seriesPosition}
            </text>
          )}
        </svg>

        {/* Car artwork centered at the bottom, spilling a little past the edge */}
        {catalogImage ? (
          <img
            src={catalogImage}
            alt={car.name}
            className={`absolute -bottom-[8%] left-[38%] z-10 max-h-[90%] w-[72%] -translate-x-1/2 object-contain object-bottom drop-shadow-xl transition duration-300 group-hover:scale-105 ${owned ? '' : 'grayscale group-hover:grayscale-0'}`}
            loading="lazy"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="absolute bottom-[8%] left-1/2 h-14 w-14 -translate-x-1/2 text-white/30"
            fill="currentColor"
          >
            <path d="M18.9 6.4a2 2 0 0 0-1.8-1.1H6.9a2 2 0 0 0-1.8 1.1L3 10v7a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-7l-2.1-3.6ZM6.5 13.5A1.5 1.5 0 1 1 8 12a1.5 1.5 0 0 1-1.5 1.5Zm11 0A1.5 1.5 0 1 1 19 12a1.5 1.5 0 0 1-1.5 1.5ZM5.3 9.5l1.4-2.7a.5.5 0 0 1 .4-.3h9.8a.5.5 0 0 1 .4.3l1.4 2.7Z" />
          </svg>
        )}

        {/* In-garage toggle, top-left corner */}
        <label
          className={`absolute left-2 top-2 z-20 flex cursor-pointer select-none items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold shadow ${owned ? '' : 'grayscale'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={owned}
            onChange={onToggle}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-hw-orange"
          />
          <span className={owned ? 'text-hw-orange' : 'text-slate-500'}>
            {owned ? t('inMyGarage') : t('iOwnThis')}
          </span>
        </label>

        {/* User photo hangs half in / half out of the bottom-right corner */}
        {photo && (
          <span className={`absolute bottom-0 right-3 z-20 h-14 w-14 translate-y-1/2 overflow-hidden rounded-lg border-2 border-white bg-white shadow-md ${owned ? '' : 'grayscale'}`}>
            <img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" />
            {photoCount > 1 && (
              <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/60 px-1 text-[9px] font-semibold text-white">
                {photoCount}
              </span>
            )}
          </span>
        )}

        {item?.condition && (
          <span className={`absolute bottom-2 left-2 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-hw-navy shadow ${owned ? '' : 'grayscale'}`}>
            {t('conditionNames')[item.condition] || item.condition}
          </span>
        )}
      </div>

      {/* Name only — transparent, no card chrome */}
      <h3 className="line-clamp-2 px-1 pb-1 pt-4 text-sm font-semibold leading-snug text-slate-900">
        {car.baseName || car.name}
        {car.variantCount > 1 && (
          <span className="font-normal text-slate-500">
            {' '}
            ({t('hasColors', { n: car.variantCount })})
          </span>
        )}
      </h3>
    </div>
  );
}
