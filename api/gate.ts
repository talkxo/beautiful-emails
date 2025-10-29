export const config = { runtime: 'edge' };

function hasSession(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(';').some((p) => p.trim().startsWith('__session=ok'));
}

export default async function handler(request: Request): Promise<Response> {
  const cookie = request.headers.get('cookie');
  if (hasSession(cookie)) {
    return Response.redirect(new URL('/index.html', request.url), 302);
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Sign in</title></head><body style="font-family:ui-sans-serif,system-ui"><div style="max-width:360px;margin:20vh auto 0;padding:24px;border:1px solid #eee;border-radius:8px"><h3 style="margin:0">Sign in</h3><p style="color:#666">Enter master key to access the app.</p><input id="k" type="password" placeholder="Master key" style="width:100%;padding:10px 12px;margin-top:8px"/><div id="e" style="color:crimson;margin-top:8px"></div><div style="margin-top:12px;display:flex;gap:8"><button id="b">Sign in</button></div></div><script type="module">const b=document.getElementById('b');const i=document.getElementById('k');const e=document.getElementById('e');b.addEventListener('click',async()=>{e.textContent='';b.disabled=true;try{const r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:i.value})});const t=await r.text();let j=null;try{j=JSON.parse(t)}catch{}if(!r.ok){throw new Error((j&&j.error)||t||'Login failed')}location.href='/index.html'}catch(err){e.textContent=err.message||'Login failed'}finally{b.disabled=false}});</script></body></html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}


