import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The box runs the app as a systemd unit from /opt/sink/app, launched via
  // `node server.js` — which only exists in a standalone build. Without this the
  // deploy script builds fine and then aborts with "no standalone output".
  output: 'standalone',

  // Every image is pre-cropped and pre-encoded to an exact size by
  // scripts/process-media.py, so the built-in optimiser would only re-encode
  // assets that are already optimal — and it needs a running server to do it.
  images: { unoptimized: true },
};

export default nextConfig;
