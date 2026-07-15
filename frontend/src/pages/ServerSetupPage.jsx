import { useState } from 'react';
import { setServer, getServer } from '../lib/api';
import { useLang } from '../lib/i18n.jsx';
import LangSwitch from '../components/LangSwitch.jsx';

export default function ServerSetupPage({ onConnected }) {
  const { t } = useLang();
  const [url, setUrl] = useState(getServer() || 'http://');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function connect(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const clean = url.trim().replace(/\/+$/, '');
    try {
      const res = await fetch(`${clean}/api/health`, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      if (!data.ok) throw new Error('bad response');
      setServer(clean);
      onConnected();
    } catch {
      setError(t('serverFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-hw-navy via-[#12305c] to-hw-blue px-4 py-10">
      <div className="absolute right-4 top-4">
        <LangSwitch dark />
      </div>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-hw-orange shadow-lg shadow-hw-orange/40">
          <svg viewBox="0 0 64 64" className="h-10 w-10">
            <circle cx="32" cy="32" r="18" fill="#fff" />
            <circle cx="32" cy="32" r="8" fill="#ffc906" />
            <circle cx="32" cy="32" r="3" fill="#0b1f3a" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-extrabold italic tracking-tight text-white">
          {t('appTitle1')} <span className="text-hw-yellow">{t('appTitle2')}</span>
        </h1>
      </div>

      <form onSubmit={connect} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-2xl">
        <div>
          <h2 className="text-lg font-bold text-hw-navy">{t('serverSetupTitle')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('serverSetupHint')}</p>
        </div>
        <input
          type="url"
          required
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          placeholder={t('serverPlaceholder')}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-hw-blue focus:ring-2 focus:ring-hw-blue/20"
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-hw-orange py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-hw-orange/30 transition hover:bg-orange-500 disabled:opacity-60"
        >
          {busy ? t('pleaseWait') : t('serverConnect')}
        </button>
      </form>
    </div>
  );
}
