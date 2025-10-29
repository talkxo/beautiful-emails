import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

export function hasSession(): boolean {
  return typeof window !== 'undefined' && window.localStorage.getItem('auth_ok') === '1';
}

export function mountLogin(rootElement: HTMLElement): void {
  const root = createRoot(rootElement);
  root.render(<Login />);
}

function Login(): JSX.Element {
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const enc = new TextEncoder();
      const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(key));
      const bytes = Array.from(new Uint8Array(hashBuf));
      const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
      const MASTER_HASH = (import.meta as any).env?.VITE_MASTER_HASH || '';
      if (!MASTER_HASH) throw new Error('App not configured');
      if (hex !== MASTER_HASH) throw new Error('Invalid key');
      window.localStorage.setItem('auth_ok', '1');
      location.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '20vh auto 0', padding: 24, border: '1px solid #eee', borderRadius: 8, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h3 style={{ margin: 0 }}>Sign in</h3>
      <p style={{ color: '#666' }}>Enter master key to access the app.</p>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Master key"
        style={{ width: '100%', padding: '10px 12px', marginTop: 8 }}
        disabled={busy}
      />
      {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={submit} disabled={busy || !key}>Sign in</button>
      </div>
    </div>
  );
}


