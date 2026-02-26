import { wazuhFetch as tlsFetch } from './tls';
import type { WazuhAgentResponse, WazuhScanResponse, WazuhTokenResponse } from '@/lib/types';

const WAZUH_API_URL = process.env.WAZUH_API_URL || 'https://wazuh.manager:55000';
const WAZUH_API_USER = process.env.WAZUH_API_USER || 'wazuh-wui';
const WAZUH_API_PASSWORD = process.env.WAZUH_API_PASSWORD || '';

// JWT token cache with mutex to prevent race conditions
let cachedToken: { jwt: string; expiresAt: number } | null = null;
let tokenPromise: Promise<string> | null = null;

async function authenticate(): Promise<string> {
  const credentials = Buffer.from(`${WAZUH_API_USER}:${WAZUH_API_PASSWORD}`).toString('base64');
  const res = await tlsFetch(`${WAZUH_API_URL}/security/user/authenticate`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}` },
  });

  if (!res.ok) throw new Error(`Wazuh auth failed: ${res.status}`);
  const body = (await res.json()) as WazuhTokenResponse;
  const jwt = body.data.token;

  // Wazuh tokens last 900s by default; refresh at 80%
  cachedToken = { jwt, expiresAt: Date.now() + 720_000 };
  return jwt;
}

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.jwt;
  // Mutex: if a refresh is in-flight, await it instead of firing another
  if (tokenPromise) return tokenPromise;
  tokenPromise = authenticate().finally(() => {
    tokenPromise = null;
  });
  return tokenPromise;
}

async function wazuhFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return tlsFetch(`${WAZUH_API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getWazuhAgents(): Promise<WazuhAgentResponse> {
  const res = await wazuhFetch('/agents?limit=500');
  if (!res.ok) throw new Error(`Wazuh agents: ${res.status}`);
  return res.json();
}

export async function triggerSyscheck(agentId: string): Promise<WazuhScanResponse> {
  const res = await wazuhFetch(`/syscheck`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agents_list: [agentId] }),
  });
  if (!res.ok) throw new Error(`Syscheck trigger failed: ${res.status}`);
  return res.json();
}

export async function triggerRootcheck(agentId: string): Promise<WazuhScanResponse> {
  const res = await wazuhFetch(`/rootcheck`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agents_list: [agentId] }),
  });
  if (!res.ok) throw new Error(`Rootcheck trigger failed: ${res.status}`);
  return res.json();
}
