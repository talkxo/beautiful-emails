import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

function App(): JSX.Element {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ name: string; url?: string; error?: string }[]>([]);

  const tooMany = useMemo(() => files.length > 5, [files]);
  const invalidSizes = useMemo(
    () => files.filter((f) => f.size > 500 * 1024).map((f) => f.name),
    [files]
  );

  async function uploadAll(): Promise<void> {
    setBusy(true);
    setResults([]);
    try {
      const selected = files.slice(0, 5);
      const uploads = selected.map(async (file) => {
        if (file.size > 500 * 1024) {
          return { name: file.name, error: 'Exceeds 500KB' };
        }
        const safe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
        const resp = await fetch(`/api/upload?filename=${encodeURIComponent(safe)}`, {
          method: 'POST',
          headers: { 'content-type': 'application/octet-stream' },
          body: file,
        });
        const data = await resp.json();
        if (!resp.ok) {
          return { name: file.name, error: data?.error || 'Upload failed' };
        }
        return { name: file.name, url: data.url };
      });
      const settled = await Promise.all(uploads);
      setResults(settled);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h2 style={{ margin: 0 }}>Image Direct Link</h2>
      <p style={{ color: '#666' }}>Upload up to 5 images at a time. Max 500KB each.</p>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        disabled={busy}
      />
      {tooMany && (
        <div style={{ color: 'crimson', marginTop: 8 }}>You selected more than 5 files; only the first 5 will upload.</div>
      )}
      {invalidSizes.length > 0 && (
        <div style={{ color: 'crimson', marginTop: 8 }}>
          Files over 500KB: {invalidSizes.join(', ')}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button onClick={uploadAll} disabled={busy || files.length === 0}>Upload</button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {results.map((r) => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ minWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
              {r.url ? (
                <>
                  <a href={r.url} target="_blank" rel="noreferrer">{r.url}</a>
                  <button onClick={() => navigator.clipboard.writeText(r.url!)}>Copy</button>
                </>
              ) : (
                <span style={{ color: 'crimson' }}>{r.error}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);


