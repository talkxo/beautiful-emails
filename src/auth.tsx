import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

export function hasSession(): boolean {
  return typeof document !== 'undefined' && document.cookie.includes('__session=ok');
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
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const raw = await resp.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch (_e) {
        data = null;
      }
      if (!resp.ok) {
        const msg = (data && data.error) || raw || 'Login failed';
        throw new Error(msg);
      }
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


