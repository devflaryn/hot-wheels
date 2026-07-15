import { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { getServer, isNativeApp } from './lib/api';
import AuthPage from './pages/AuthPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ServerSetupPage from './pages/ServerSetupPage.jsx';

export default function App() {
  const { user, loading } = useAuth();
  // The Android app talks to a remote server: ask for its address first.
  const [needsServer, setNeedsServer] = useState(isNativeApp() && !getServer());

  if (needsServer) {
    return <ServerSetupPage onConnected={() => setNeedsServer(false)} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-hw-orange border-t-transparent" />
      </div>
    );
  }

  return user ? <CatalogPage /> : <AuthPage />;
}
