import { Agent } from 'undici';
import fs from 'node:fs';

const caCertPath = process.env.NODE_EXTRA_CA_CERTS;

function loadCaCert(): string | undefined {
  if (!caCertPath) return undefined;
  try {
    return fs.readFileSync(caCertPath, 'utf-8');
  } catch {
    console.warn(`[tls] Cannot read CA cert at ${caCertPath}, falling back to rejectUnauthorized: false`);
    return undefined;
  }
}

const caCert = loadCaCert();

/**
 * Scoped undici Agent (dispatcher) for Wazuh services with self-signed certs.
 * Node.js 20's built-in fetch uses undici -- https.Agent is silently ignored.
 * Must use undici's Agent with connect options instead.
 *
 * If the Wazuh root CA is available, use it.
 * Otherwise, fall back to rejectUnauthorized: false -- scoped to this dispatcher only.
 * NEVER set global NODE_TLS_REJECT_UNAUTHORIZED.
 */
export const wazuhDispatcher = caCert
  ? new Agent({ connect: { ca: caCert } })
  : new Agent({ connect: { rejectUnauthorized: false } });

/**
 * fetch() wrapper that injects the Wazuh TLS dispatcher.
 * Single cast point - eliminates scattered @ts-expect-error directives.
 */
export function wazuhFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { ...init, dispatcher: wazuhDispatcher } as any);
}
