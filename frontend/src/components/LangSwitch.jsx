import { useLang } from '../lib/i18n.jsx';

export default function LangSwitch({ dark = false }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={`flex overflow-hidden rounded-full border text-xs font-bold ${
        dark ? 'border-white/25' : 'border-slate-200 bg-white shadow-sm'
      }`}
    >
      {['en', 'tr'].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 uppercase transition ${
            lang === l
              ? 'bg-hw-orange text-white'
              : dark
                ? 'text-blue-100 hover:bg-white/10'
                : 'text-slate-500 hover:bg-slate-50'
          }`}
          aria-pressed={lang === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
