import { serve } from 'bun';
import index from './index.html';

const port = process.env.PORT || 3000;

const server = serve({
  port,
  routes: {
    // Serve favicon
    '/favicon.svg': () =>
      new Response(Bun.file('src/favicon.svg'), {
        headers: { 'Content-Type': 'image/svg+xml' },
      }),

    // Serve manifest.json
    '/manifest.json': () =>
      new Response(Bun.file('src/manifest.json'), {
        headers: { 'Content-Type': 'application/json' },
      }),

    // Serve index.html for all unmatched routes (SPA routing)
    '/*': index,
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Lift Log server running at ${server.url}`);
