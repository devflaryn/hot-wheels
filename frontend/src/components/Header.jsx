import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../lib/i18n.jsx';
import LangSwitch from './LangSwitch.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useLang();

  return (
    <header className="sticky top-0 z-30 mb-6 bg-hw-navy shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 64 64" className="h-9 w-9">
            <circle cx="32" cy="32" r="30" fill="#f7681e" />
            <circle cx="32" cy="32" r="18" fill="#fff" />
            <circle cx="32" cy="32" r="8" fill="#ffc906" />
            <circle cx="32" cy="32" r="3" fill="#0b1f3a" />
          </svg>
          <div className="leading-tight">
            <p className="font-display text-lg font-extrabold italic tracking-tight text-white">
              {t('appTitle1')} <span className="text-hw-yellow">{t('appTitle2')}</span>
            </p>
            <p className="hidden text-[11px] text-blue-200 sm:block">{t('headerSubtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-[200px] truncate text-sm text-blue-100 sm:block">
            {user?.displayName || user?.email}
          </span>
          <LangSwitch dark />
          <button
            onClick={logout}
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {t('signOut')}
          </button>
        </div>
      </div>
    </header>
  );
}
