import { useEffect, useRef, useState } from 'react';
import { api, assetUrl } from '../lib/api';
import { carImageUrl } from '../lib/carImage';
import { useLang } from '../lib/i18n.jsx';

const CONDITIONS = ['Mint', 'Good', 'Fair', 'Poor', 'Damaged'];
const MAX_PHOTOS = 12;

export default function CarModal({ car, item, onClose, onChange, onError }) {
  const { t } = useLang();
  const owned = !!item?.owned;
  const photos = item?.photos || [];
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState(item?.notes || '');
  const [activePhoto, setActivePhoto] = useState(0);
  const [showUserPhoto, setShowUserPhoto] = useState(false);
  const fileRef = useRef(null);
  const catalogImage = carImageUrl(car);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    if (activePhoto >= photos.length) setActivePhoto(Math.max(0, photos.length - 1));
  }, [photos.length, activePhoto]);

  async function run(fn) {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const toggleOwned = () =>
    run(async () => {
      if (owned) {
        await api.unOwn(car.id);
        onChange(null);
      } else {
        const { item } = await api.setOwnership(car.id, { owned: true });
        onChange(item);
      }
    });

  const setCondition = (condition) =>
    run(async () => {
      const { item } = await api.setOwnership(car.id, { owned: true, condition });
      onChange(item);
    });

  const saveNotes = () =>
    run(async () => {
      const { item } = await api.setOwnership(car.id, { owned: true, notes });
      onChange(item);
    });

  const uploadPhotos = (files) =>
    run(async () => {
      let latest = item;
      for (const file of files) {
        const { item: updated } = await api.uploadPhoto(car.id, file);
        latest = updated;
      }
      onChange(latest);
      setActivePhoto((latest?.photos?.length || 1) - 1);
      setShowUserPhoto(true);
    });

  const removePhoto = (photoId) =>
    run(async () => {
      const { item: updated } = await api.deletePhoto(car.id, photoId);
      onChange(updated);
    });

  const userPhoto = photos[activePhoto] ? assetUrl(photos[activePhoto].url) : null;
  // Catalog artwork is the main cover; the user's own photo sits in a small
  // corner square, and tapping it swaps the two.
  const coverIsUserPhoto = userPhoto && (showUserPhoto || !catalogImage);
  const cover = coverIsUserPhoto ? userPhoto : catalogImage;
  const cornerImage = catalogImage && userPhoto ? (coverIsUserPhoto ? catalogImage : userPhoto) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-hw-navy/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover photo area */}
        <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          {cover ? (
            <img
              src={cover}
              alt={car.name}
              className={`h-full w-full ${coverIsUserPhoto ? 'object-cover' : 'object-contain p-3'}`}
            />
          ) : (
            <div className="text-center text-slate-400">
              <svg viewBox="0 0 24 24" className="mx-auto h-16 w-16" fill="currentColor">
                <path d="M18.9 6.4a2 2 0 0 0-1.8-1.1H6.9a2 2 0 0 0-1.8 1.1L3 10v7a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-7l-2.1-3.6ZM6.5 13.5A1.5 1.5 0 1 1 8 12a1.5 1.5 0 0 1-1.5 1.5Zm11 0A1.5 1.5 0 1 1 19 12a1.5 1.5 0 0 1-1.5 1.5ZM5.3 9.5l1.4-2.7a.5.5 0 0 1 .4-.3h9.8a.5.5 0 0 1 .4.3l1.4 2.7Z" />
              </svg>
              <p className="text-xs">{t('noPhoto')}</p>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow transition hover:bg-white"
            aria-label="Close"
          >
            ✕
          </button>
          <span className="absolute left-3 top-3 rounded-full bg-hw-navy px-3 py-1 text-xs font-bold text-white shadow">
            {car.year} · #{car.collectorNumber}
          </span>
          {photos.length > 1 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white">
              {activePhoto + 1}/{photos.length}
            </span>
          )}
          {cornerImage && (
            <button
              onClick={() => setShowUserPhoto((v) => !v)}
              className="absolute bottom-3 right-3 h-16 w-16 overflow-hidden rounded-xl border-2 border-white bg-white shadow-lg transition hover:scale-105"
              aria-label={t('photoOfYourCar')}
            >
              <img
                src={cornerImage}
                alt=""
                className={`h-full w-full ${coverIsUserPhoto ? 'object-contain' : 'object-cover'}`}
              />
            </button>
          )}
        </div>

        <div className="space-y-5 p-6">
          <div>
            <h2 className="text-xl font-bold text-hw-navy">{car.name}</h2>
            <p className="text-sm text-slate-500">
              {car.series}
              {car.seriesPosition ? ` · ${car.seriesPosition}` : ''}
            </p>
          </div>

          {/* Own toggle */}
          <button
            onClick={toggleOwned}
            disabled={busy}
            className={`w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wide transition disabled:opacity-60 ${
              owned
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-hw-orange text-white shadow-lg shadow-hw-orange/30 hover:bg-orange-500'
            }`}
          >
            {owned ? t('inGarageRemove') : t('addToGarage')}
          </button>

          {owned && (
            <>
              {/* Condition */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('condition')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCondition(c)}
                      disabled={busy}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        item?.condition === c
                          ? 'bg-hw-blue text-white shadow'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t('conditionNames')[c]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo gallery */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('photoOfYourCar')}{' '}
                  <span className="normal-case text-slate-300">
                    ({photos.length}/{MAX_PHOTOS})
                  </span>
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) uploadPhotos(files);
                    e.target.value = '';
                  }}
                />
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((p, i) => (
                    <div
                      key={p.id}
                      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 ${
                        i === activePhoto ? 'border-hw-orange' : 'border-transparent'
                      }`}
                      onClick={() => {
                        setActivePhoto(i);
                        setShowUserPhoto(true);
                      }}
                    >
                      <img
                        src={assetUrl(p.url)}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(p.id);
                        }}
                        disabled={busy}
                        aria-label={t('remove')}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={busy}
                      className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-2xl font-light text-slate-400 transition hover:border-hw-blue hover:text-hw-blue disabled:opacity-60"
                      aria-label={t('addPhoto')}
                    >
                      +
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{t('photoHint')}</p>
              </div>

              {/* Notes */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('notes')}
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder={t('notesPlaceholder')}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-hw-blue focus:ring-2 focus:ring-hw-blue/20"
                />
                <button
                  onClick={saveNotes}
                  disabled={busy || notes === (item?.notes || '')}
                  className="mt-1 rounded-full bg-hw-navy px-5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-40"
                >
                  {t('saveNotes')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
