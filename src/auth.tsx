import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';

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
    <Box display="grid" alignItems="start" justifyContent="center" minHeight="100vh" sx={{ backgroundColor: '#f6f7f8', pt: { xs: 8, sm: 14 } }}>
      <Card sx={{ width: 400, maxWidth: '90vw' }} elevation={1}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Sign in</Typography>
            <Typography variant="body2" color="text.secondary">
              Enter master key to access the app.
            </Typography>
            <TextField
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Master key"
              size="small"
              fullWidth
              disabled={busy}
              autoFocus
            />
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: -0.5 }}>
                {error}
              </Typography>
            )}
            <Stack direction="row" justifyContent="flex-start">
              <Button variant="contained" onClick={submit} disabled={busy || !key}>
                Sign in
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}


