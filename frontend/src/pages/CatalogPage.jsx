import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../lib/i18n.jsx';
import Header from '../components/Header.jsx';
import StatsBar from '../components/StatsBar.jsx';
import CarCard from '../components/CarCard.jsx';
import CarModal from '../components/CarModal.jsx';
import ImageSearch from '../components/ImageSearch.jsx';

export default function CatalogPage() {
  const { user } = useAuth();
  const { t, tError } = useLang();
  const [years, setYears] = useState([]);
  const [year, setYear] = useState(null);
  const [cars, setCars] = useState([]);
  const [collection, setCollection] = useState({}); // carId -> item
  const [search, setSearch] = useState('');
  const [series, setSeries] = useState('all');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.years(), api.collection()])
      .then(([y, c]) => {
        setYears(y.years);
        if (y.years.length) setYear(y.years[0].year);
        const map = {};
        for (const item of c.items) map[item.carId] = item;
        setCollection(map);
      })
      .catch((e) => setError(tError(e.message)));
  }, []);

  useEffect(() => {
    if (!year) return;
    setLoading(true);
    api
      .cars(year)
      .then(({ cars }) => setCars(cars))
      .catch((e) => setError(tError(e.message)))
      .finally(() => setLoading(false));
    setSeries('all');
  }, [year]);

  const seriesList = useMemo(() => {
    const set = new Set(cars.map((c) => c.series));
    return ['all', ...[...set].sort((a, b) => a.localeCompare(b))];
  }, [cars]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cars.filter((c) => {
      if (series !== 'all' && c.series !== series) return false;
      if (ownedOnly && !collection[c.id]?.owned) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.series.toLowerCase().includes(q) ||
        c.collectorNumber.includes(q) ||
        String(Number(c.collectorNumber)) === q.replace(/^0+/, '')
      );
    });
  }, [cars, search, series, ownedOnly, collection]);

  const ownedInYear = useMemo(
    () => cars.filter((c) => collection[c.id]?.owned).length,
    [cars, collection]
  );
  const ownedTotal = useMemo(
    () => Object.values(collection).filter((i) => i.owned).length,
    [collection]
  );

  function updateItem(carId, item) {
    setCollection((prev) => {
      const next = { ...prev };
      if (item) next[carId] = item;
      else delete next[carId];
      return next;
    });
  }

  async function toggleOwned(car) {
    const current = collection[car.id];
    // Optimistic update: flip the tick immediately, then confirm with the API.
    if (current?.owned) {
      updateItem(car.id, null);
      try {
        await api.unOwn(car.id);
      } catch (e) {
        updateItem(car.id, current);
        setError(tError(e.message));
      }
    } else {
      updateItem(car.id, { carId: car.id, owned: true });
      try {
        const { item } = await api.setOwnership(car.id, { owned: true });
        updateItem(car.id, item);
      } catch (e) {
        updateItem(car.id, current || null);
        setError(tError(e.message));
      }
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <StatsBar
          user={user}
          year={year}
          totalInYear={cars.length}
          ownedInYear={ownedInYear}
          ownedTotal={ownedTotal}
        />

        {/* Year tabs */}
        <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {years.map((y) => (
            <button
              key={y.year}
              onClick={() => setYear(y.year)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${
                year === y.year
                  ? 'bg-hw-navy text-white shadow'
                  : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'
              }`}
            >
              {y.year}
              <span className="ml-1.5 text-xs opacity-60">{y.total}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-hw-blue focus:ring-2 focus:ring-hw-blue/20"
            />
          </div>
          <ImageSearch
            onPick={(car) => {
              setYear(car.year);
              setSeries('all');
              setSearch(car.name);
              setOwnedOnly(false);
            }}
            onError={(msg) => setError(tError(msg))}
          />
          <select
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-hw-blue"
          >
            {seriesList.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? t('allSeries') : s}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOwnedOnly((v) => !v)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
              ownedOnly
                ? 'bg-hw-orange text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t('ownedOnly')}
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}{' '}
            <button className="underline" onClick={() => setError('')}>
              {t('dismiss')}
            </button>
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-hw-orange border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white py-20 text-center text-slate-500 shadow-card">
            {t('noMatch')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                item={collection[car.id]}
                onToggle={() => toggleOwned(car)}
                onOpen={() => setSelected(car)}
              />
            ))}
          </div>
        )}
      </main>

      {selected && (
        <CarModal
          car={selected}
          item={collection[selected.id]}
          onClose={() => setSelected(null)}
          onChange={(item) => updateItem(selected.id, item)}
          onError={(msg) => setError(tError(msg))}
        />
      )}
    </div>
  );
}
