import { useEffect, useState } from 'react';
import { isNativeApp } from '../lib/api';
import { useLang } from '../lib/i18n.jsx';

// Web-only link to download the Android app. Renders nothing inside the APK
// itself, and nothing while the APK file is missing on the server.
export default function ApkDownloadLink({ className, short }) {
  const { t } = useLang();
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (isNativeApp()) return;
    fetch('/HotWheelsCollection.apk', { method: 'HEAD' })
      .then((res) => setAvailable(res.ok))
      .catch(() => {});
  }, []);

  if (!available) return null;
  return (
    <a href="/HotWheelsCollection.apk" download className={className}>
      {t(short ? 'downloadApkShort' : 'downloadApk')}
    </a>
  );
}
