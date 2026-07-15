import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    appTitle1: 'HOT WHEELS',
    appTitle2: 'COLLECTION',
    tagline: 'Track every casting. Own the garage.',
    headerSubtitle: 'Mainline catalog & garage tracker',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    displayName: 'Display name (optional)',
    email: 'Email address',
    password: 'Password',
    passwordMin: 'Password (min. 8 characters)',
    rememberMe: 'Remember me on this device',
    pleaseWait: 'Please wait…',
    privateNote: 'Your collection is private to your account.',
    signOut: 'Sign out',
    welcomeBack: 'Welcome back',
    statsOwn: 'You own {owned} of {total} castings in {year} — {all} across all years.',
    pctCollected: 'of {year} collected',
    searchPlaceholder: 'Search by name, series or collector # (e.g. 42)',
    allSeries: 'All series',
    ownedOnly: 'Owned only',
    noMatch: 'No cars match your filters.',
    dismiss: 'dismiss',
    iOwnThis: 'I own this',
    inMyGarage: 'In my garage',
    details: 'Details →',
    inGarageRemove: '✓ In my garage — tap to remove',
    addToGarage: 'Add to my garage',
    condition: 'Condition',
    conditionNames: { Mint: 'Mint', Good: 'Good', Fair: 'Fair', Poor: 'Poor', Damaged: 'Damaged' },
    photoOfYourCar: 'Photo of your car',
    replacePhoto: 'Replace photo',
    uploadPhoto: 'Upload a photo',
    remove: 'Remove',
    photoHint: 'JPG, PNG, WEBP or HEIC — max 8 MB.',
    noPhoto: 'No photo yet',
    notes: 'Notes',
    notesPlaceholder: 'Wheel variation, where you found it, condition details…',
    saveNotes: 'Save notes',
    addPhoto: 'Add photo',
    imageSearch: 'Search with a photo',
    readingImage: 'Reading text from the photo…',
    noImageMatch: 'No matching car found. Try a sharper photo of the card text.',
    tryAnotherPhoto: 'Try another photo',
    serverSetupTitle: 'Connect to your server',
    serverSetupHint: 'Enter the address of your Hot Wheels server.',
    serverPlaceholder: 'http://YOUR_SERVER_IP:3000',
    serverConnect: 'Connect',
    serverFailed: 'Could not reach the server at this address.',
    downloadApk: 'Download the Android app (.apk)',
    // server error messages
    serverErrors: {},
  },
  tr: {
    appTitle1: 'HOT WHEELS',
    appTitle2: 'KOLEKSİYONU',
    tagline: 'Her modeli takip et. Garajın senin olsun.',
    headerSubtitle: 'Ana seri kataloğu ve garaj takibi',
    signIn: 'Giriş Yap',
    createAccount: 'Hesap Oluştur',
    displayName: 'Görünen ad (isteğe bağlı)',
    email: 'E-posta adresi',
    password: 'Şifre',
    passwordMin: 'Şifre (en az 8 karakter)',
    rememberMe: 'Bu cihazda beni hatırla',
    pleaseWait: 'Lütfen bekleyin…',
    privateNote: 'Koleksiyonunuz hesabınıza özeldir.',
    signOut: 'Çıkış',
    welcomeBack: 'Tekrar hoş geldin',
    statsOwn: '{year} yılındaki {total} modelden {owned} tanesine sahipsin — tüm yıllarda toplam {all}.',
    pctCollected: '{year} tamamlanma oranı',
    searchPlaceholder: 'İsim, seri veya koleksiyon numarası ara (örn. 42)',
    allSeries: 'Tüm seriler',
    ownedOnly: 'Sadece sahip olduklarım',
    noMatch: 'Filtrelerinize uyan araba yok.',
    dismiss: 'kapat',
    iOwnThis: 'Buna sahibim',
    inMyGarage: 'Garajımda',
    details: 'Detaylar →',
    inGarageRemove: '✓ Garajımda — çıkarmak için dokun',
    addToGarage: 'Garajıma ekle',
    condition: 'Durum',
    conditionNames: { Mint: 'Sıfır Ayarında', Good: 'İyi', Fair: 'Orta', Poor: 'Kötü', Damaged: 'Hasarlı' },
    photoOfYourCar: 'Arabanın fotoğrafı',
    replacePhoto: 'Fotoğrafı değiştir',
    uploadPhoto: 'Fotoğraf yükle',
    remove: 'Kaldır',
    photoHint: 'JPG, PNG, WEBP veya HEIC — en fazla 8 MB.',
    noPhoto: 'Henüz fotoğraf yok',
    notes: 'Notlar',
    notesPlaceholder: 'Jant farkı, nerede bulduğun, durum detayları…',
    saveNotes: 'Notları kaydet',
    addPhoto: 'Fotoğraf ekle',
    imageSearch: 'Fotoğrafla ara',
    readingImage: 'Fotoğraftaki yazı okunuyor…',
    noImageMatch: 'Eşleşen araba bulunamadı. Kart yazısının daha net bir fotoğrafını deneyin.',
    tryAnotherPhoto: 'Başka fotoğraf dene',
    serverSetupTitle: 'Sunucuna bağlan',
    serverSetupHint: 'Hot Wheels sunucunun adresini gir.',
    serverPlaceholder: 'http://SUNUCU_IP:3000',
    serverConnect: 'Bağlan',
    serverFailed: 'Bu adresteki sunucuya ulaşılamadı.',
    downloadApk: 'Android uygulamasını indir (.apk)',
    serverErrors: {
      'Enter a valid email address.': 'Geçerli bir e-posta adresi girin.',
      'Password must be at least 8 characters.': 'Şifre en az 8 karakter olmalıdır.',
      'An account with this email already exists.': 'Bu e-posta ile bir hesap zaten var.',
      'Incorrect email or password.': 'E-posta veya şifre hatalı.',
      'Too many attempts, try again later.': 'Çok fazla deneme yapıldı, daha sonra tekrar deneyin.',
      'Authentication required': 'Giriş yapmanız gerekiyor',
      'Invalid or expired session': 'Oturumunuzun süresi doldu',
      'Car not found.': 'Araba bulunamadı.',
      'No photo uploaded.': 'Fotoğraf yüklenmedi.',
      'Only JPG, PNG, WEBP or HEIC images are allowed.':
        'Sadece JPG, PNG, WEBP veya HEIC görselleri yüklenebilir.',
      'Internal server error': 'Sunucu hatası, lütfen tekrar deneyin.',
    },
  },
};

const LANG_KEY = 'hw_lang';

function detectLang() {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && translations[saved]) return saved;
  return (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  const setLang = useCallback((l) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  }, []);

  const t = useCallback(
    (key, params) => {
      let str = translations[lang][key] ?? translations.en[key] ?? key;
      if (typeof str === 'string' && params) {
        for (const [k, v] of Object.entries(params)) str = str.replaceAll(`{${k}}`, v);
      }
      return str;
    },
    [lang]
  );

  // Translate error messages coming from the API
  const tError = useCallback(
    (message) => translations[lang].serverErrors[message] || message,
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t, tError }}>{children}</LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
