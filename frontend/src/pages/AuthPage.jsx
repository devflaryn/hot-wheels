import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../lib/i18n.jsx';
import LangSwitch from '../components/LangSwitch.jsx';
import { isNativeApp } from '../lib/api';

export default function AuthPage() {
  const { login, register } = useAuth();
  const { t, tError } = useLang();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [apkAvailable, setApkAvailable] = useState(false);

  // Offer the Android app for download on the website (not inside the app itself)
  useEffect(() => {
    if (isNativeApp()) return;
    fetch('/HotWheelsCollection.apk', { method: 'HEAD' })
      .then((res) => setApkAvailable(res.ok))
      .catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password, remember);
      } else {
        await register(email, password, displayName, remember);
      }
    } catch (err) {
      setError(tError(err.message));
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-hw-blue focus:ring-2 focus:ring-hw-blue/20';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-hw-navy via-[#12305c] to-hw-blue px-4 py-10">
      <div className="absolute right-4 top-4">
        <LangSwitch dark />
      </div>

      <div className="mb-8 text-center">
        <img
          src="/logo-transparent.png"
          alt="Hot Wheels Catalog"
          className="mx-auto mb-4 h-24 w-24 object-contain drop-shadow-lg"
        />
        <h1 className="font-display text-3xl font-extrabold italic tracking-tight text-white">
          {t('appTitle1')} <span className="text-hw-yellow">{t('appTitle2')}</span>
        </h1>
        <p className="mt-1 text-sm text-blue-200">{t('tagline')}</p>
      </div>

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
          {['login', 'register'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError('');
              }}
              className={`rounded-lg py-2 transition ${
                mode === m ? 'bg-white text-hw-navy shadow' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'login' ? t('signIn') : t('createAccount')}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              className={inputCls}
              placeholder={t('displayName')}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
            />
          )}
          <input
            className={inputCls}
            type="email"
            required
            placeholder={t('email')}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={inputCls}
            type="password"
            required
            minLength={8}
            placeholder={mode === 'register' ? t('passwordMin') : t('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-hw-orange"
            />
            {t('rememberMe')}
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-hw-orange py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-hw-orange/30 transition hover:bg-orange-500 active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? t('pleaseWait') : mode === 'login' ? t('signIn') : t('createAccount')}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-blue-300">{t('privateNote')}</p>
      {apkAvailable && (
        <a href="/HotWheelsCollection.apk" download className="mt-2 text-xs text-blue-300 underline">
          {t('downloadApk')}
        </a>
      )}
    </div>
  );
}
