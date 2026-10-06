"use client";

// Replaces the root layout when it fails, so it can't rely on globals.css or the theme script.
// Kept deliberately small, with its own styles that follow the device's light/dark setting.
const css = `
:root{color-scheme:light dark;--bg:#f7f6f3;--fg:#171716;--mut:#6e6d68;--line:#d3d0ca}
@media (prefers-color-scheme:dark){:root{--bg:#0e0e0d;--fg:#f2f2ef;--mut:#a6a6a1;--line:#3a3a37}}
body{margin:0;min-height:100dvh;display:grid;place-items:center;background:var(--bg);color:var(--fg);font:14px/1.55 system-ui,sans-serif;padding:16px}
main{max-width:34rem}h1{font-size:22px;margin:0 0 8px}p{color:var(--mut);margin:0 0 16px}
button,a{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:8px;font:500 14px system-ui,sans-serif;cursor:pointer;text-decoration:none;margin-right:8px}
button{background:var(--fg);color:var(--bg);border:0}a{border:1px solid var(--line);color:var(--fg)}
:focus-visible{outline:2px solid var(--fg);outline-offset:2px}`;

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <title>Something went wrong · Realty Adwise</title>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <main role="alert">
          <h1>The portal couldn&apos;t start</h1>
          <p>
            Something failed while loading the app itself. Try again; if it keeps happening, send the reference to whoever runs the portal.
            {error.digest && <> Reference: {error.digest}</>}
          </p>
          <button type="button" onClick={() => retry()}>
            Try again
          </button>
          <a href="/">Go to sign in</a>
        </main>
      </body>
    </html>
  );
}
