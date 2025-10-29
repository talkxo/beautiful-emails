# @usewaypoint/editor-sample

Use this as a sample to self-host EmailBuilder.js.

To run this locally, fork the repository and then in this directory run:

- `npm install`
- `npx vite`

Once the server is running, open http://localhost:5173/email-builder-js/ in your browser.

Auth (client-only)
- Set VITE_MASTER_HASH env var in Vercel Project Settings → Environment Variables.
- Generate from your key using Node:

```bash
node -e "(async()=>{const s=process.argv[1];const h=Buffer.from(await crypto.subtle.digest(SHA-256,new TextEncoder().encode(s))).toString(hex);console.log(h)})();" YOUR_KEY_HERE
```

