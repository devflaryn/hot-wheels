import { useRef, useState } from 'react';
import { api } from '../lib/api';
import { useLang } from '../lib/i18n.jsx';
import { recognizeText, matchCars } from '../lib/imageSearch';

let allCarsCache = null;

export default function ImageSearch({ onPick, onError }) {
  const { t } = useLang();
  const fileRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | reading | results
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState([]);
  const [ocrText, setOcrText] = useState('');

  async function handleFile(file) {
    setState('reading');
    setProgress(0);
    setMatches([]);
    try {
      if (!allCarsCache) {
        const { cars } = await api.allCars();
        allCarsCache = cars;
      }
      const text = await recognizeText(file, setProgress);
      setOcrText(text.replace(/\s+/g, ' ').trim().slice(0, 160));
      setMatches(matchCars(text, allCarsCache));
      setState('results');
    } catch (e) {
      setState('idle');
      onError(e.message);
    }
  }

  return (
    <>
      {/* On phones `capture` opens the camera; on desktop it's a file picker */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        title={t('imageSearch')}
        aria-label={t('imageSearch')}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-hw-blue hover:text-hw-blue"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.8 7 8 5.2A1.5 1.5 0 0 1 9.3 4.4h5.4A1.5 1.5 0 0 1 16 5.2L17.2 7H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.8Z"
          />
          <circle cx="12" cy="13" r="3.2" />
        </svg>
      </button>

      {state !== 'idle' && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-hw-navy/60 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setState('idle')}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-hw-navy">{t('imageSearch')}</h3>
              <button
                onClick={() => setState('idle')}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {state === 'reading' ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-hw-orange border-t-transparent" />
                <p className="text-sm font-medium text-slate-600">{t('readingImage')}</p>
                <div className="mx-auto mt-3 h-2 w-48 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-hw-orange transition-all"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                {ocrText && (
                  <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
                    “{ocrText}”
                  </p>
                )}
                {matches.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">{t('noImageMatch')}</p>
                ) : (
                  <ul className="max-h-80 space-y-2 overflow-y-auto">
                    {matches.map(({ car, score }) => (
                      <li key={car.id}>
                        <button
                          onClick={() => {
                            setState('idle');
                            onPick(car);
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-hw-blue hover:bg-blue-50/50"
                        >
                          <span>
                            <span className="block text-sm font-semibold text-slate-900">
                              {car.name}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {car.year} · #{car.collectorNumber} · {car.series}
                            </span>
                          </span>
                          <span className="shrink-0 rounded-full bg-hw-navy px-2 py-0.5 text-[11px] font-bold text-white">
                            {Math.min(99, Math.round(score * 100))}%
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="mt-4 w-full rounded-xl border-2 border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-hw-blue hover:text-hw-blue"
                >
                  {t('tryAnotherPhoto')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
