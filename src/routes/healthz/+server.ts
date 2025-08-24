/**
 * File: src/routes/healthz/+server.ts
 * Purpose: Simple health check endpoint for monitoring and diagnostics
 * Related: System monitoring, load balancer health checks
 * Tags: health, monitoring, diagnostics
 */
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  return new Response('ok', {
    status: 200,
    headers: {
      'content-type': 'text/plain',
      'cache-control': 'no-cache'
    }
  });
};
