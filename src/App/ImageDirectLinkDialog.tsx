import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogContent, DialogTitle, LinearProgress, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';

type Props = { open: boolean; onClose: () => void };

export default function ImageDirectLinkDialog({ open, onClose }: Props): JSX.Element {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ name: string; url?: string; error?: string }[]>([]);

  const tooMany = useMemo(() => files.length > 5, [files]);
  const invalidSizes = useMemo(() => files.filter((f) => f.size > 500 * 1024).map((f) => f.name), [files]);

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
        const text = await resp.text();
        let data: any = null;
        try { data = JSON.parse(text) } catch {}
        if (!resp.ok) {
          return { name: file.name, error: (data && data.error) || text || 'Upload failed' };
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create image link</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Upload up to 5 images at a time. Max 500KB each.
          </Typography>
          <Box>
            <Button variant="outlined" component="label" disabled={busy}>
              Select images
              <input hidden type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            </Button>
            {files.length > 0 && <Chip label={`${Math.min(files.length, 5)} selected`} size="small" sx={{ ml: 1 }} />}
          </Box>
          {tooMany && <Alert severity="warning">You selected more than 5 files; only the first 5 will upload.</Alert>}
          {invalidSizes.length > 0 && (
            <Alert severity="error">Files over 500KB: {invalidSizes.join(', ')}</Alert>
          )}
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={uploadAll} disabled={busy || files.length === 0}>Upload</Button>
            {busy && <LinearProgress sx={{ flex: 1, alignSelf: 'center' }} />}
          </Stack>

          {results.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Results</Typography>
              <List dense>
                {results.map((r) => (
                  <ListItem key={r.name} secondaryAction={r.url ? (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" href={r.url} target="_blank">Open</Button>
                      <Button size="small" onClick={() => navigator.clipboard.writeText(r.url!)}>Copy</Button>
                    </Stack>
                  ) : undefined}>
                    <ListItemText
                      primary={r.name}
                      secondary={r.url ? r.url : r.error}
                      secondaryTypographyProps={{ color: r.url ? 'text.secondary' : 'error.main' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}


