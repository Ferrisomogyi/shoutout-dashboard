// =================================================================
// Shoutout Outreach API Proxy — Cloudflare Worker
// Proxyt Instantly.ai API calls zodat je API key veilig blijft
// Deploy als Cloudflare Worker met secret: INSTANTLY_API_KEY
// =================================================================

const INSTANTLY_BASE = 'https://api.instantly.ai/api/v1';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

async function proxyInstantly(path, params, apiKey) {
  const url = new URL(`${INSTANTLY_BASE}${path}`);
  url.searchParams.set('api_key', apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v);
    }
  }
  const resp = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await resp.json();
  return jsonResponse(data, resp.status);
}

async function proxyInstantlyPost(path, body, apiKey) {
  const url = `${INSTANTLY_BASE}${path}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, api_key: apiKey }),
  });
  const data = await resp.json();
  return jsonResponse(data, resp.status);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const params = Object.fromEntries(url.searchParams);
    const apiKey = env.INSTANTLY_API_KEY;

    if (!apiKey) {
      return errorResponse('INSTANTLY_API_KEY not configured', 500);
    }

    try {
      if (path === '/api/campaigns') {
        return await proxyInstantly('/campaign/list', { limit: params.limit || '100', skip: params.skip || '0' }, apiKey);
      }
      if (path === '/api/campaign/summary') {
        return await proxyInstantly('/analytics/campaign/summary', { campaign_id: params.campaign_id, start_date: params.start_date, end_date: params.end_date }, apiKey);
      }
      if (path === '/api/campaign/count') {
        return await proxyInstantly('/analytics/campaign/count', { campaign_id: params.campaign_id }, apiKey);
      }
      if (path === '/api/leads') {
        return await proxyInstantly('/lead/list', { campaign_id: params.campaign_id, limit: params.limit || '100', skip: params.skip || '0', email: params.email }, apiKey);
      }
      if (path === '/api/lead/get') {
        return await proxyInstantly('/lead/get', { campaign_id: params.campaign_id, email: params.email }, apiKey);
      }
      if (path === '/api/accounts') {
        return await proxyInstantly('/account/list', { limit: params.limit || '100', skip: params.skip || '0' }, apiKey);
      }
      if (path === '/api/account/warmup/status') {
        return await proxyInstantly('/account/warmup/status', { email: params.email }, apiKey);
      }
      if (path === '/api/lead/email' && request.method === 'POST') {
        const body = await request.json();
        return await proxyInstantlyPost('/lead/email/send', body, apiKey);
      }
      if (path === '/api/health' || path === '/') {
        return jsonResponse({ status: 'ok', service: 'shoutout-outreach-proxy', version: '1.0.0', timestamp: new Date().toISOString() });
      }
      return errorResponse('Not found', 404);
    } catch (err) {
      return errorResponse(`Proxy error: ${err.message}`, 502);
    }
  },
};
