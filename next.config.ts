import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The box runs the app as a systemd unit from /opt/sink/app, launched via
  // `node server.js` — which only exists in a standalone build. Without this the
  // deploy script builds fine and then aborts with "no standalone output".
  output: 'standalone',

  // The root layout lives in app/[locale], so an unmatched URL has no layout to
  // build a 404 from and Next serves its own unstyled one. This flag enables the
  // app/global-not-found.tsx convention, which is documented for exactly that
  // case (a root layout defined by a top-level dynamic segment).
  experimental: { globalNotFound: true },

  // Every image is pre-cropped and pre-encoded to an exact size by
  // scripts/process-media.py, so the built-in optimiser would only re-encode
  // assets that are already optimal — and it needs a running server to do it.
  images: { unoptimized: true },
};

export default nextConfig;
