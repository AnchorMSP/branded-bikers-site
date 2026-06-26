import type { APIRoute } from 'astro';

export const prerender = true;

const service = 'branded-bikers-site';
const version = import.meta.env.npm_package_version || '0.0.1';
const environment =
  import.meta.env.PUBLIC_APP_ENV ||
  import.meta.env.VERCEL_ENV ||
  import.meta.env.MODE ||
  'development';
const commit =
  import.meta.env.VERCEL_GIT_COMMIT_SHA ||
  import.meta.env.PUBLIC_APP_COMMIT ||
  'unknown';

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify(
      {
        status: 'ok',
        service,
        environment,
        version,
        commit,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    },
  );
};
