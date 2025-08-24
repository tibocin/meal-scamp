/**
 * File: src/routes/api/diag/+server.ts
 * Purpose: Runtime diagnostics and environment information for troubleshooting
 * Related: Health monitoring, configuration validation, debugging
 * Tags: diagnostics, monitoring, environment, troubleshooting
 */
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify({
    node: process.version,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      HAS_PUSHOVER_TOKEN: Boolean(process.env.PUSHOVER_APP_TOKEN),
      HAS_PUSHOVER_USER: Boolean(process.env.PUSHOVER_USER_KEY)
    },
    now: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  }, null, 2), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-cache'
    }
  });
};
