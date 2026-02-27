import { wazuhFetch } from './tls';
import { cached } from '@/lib/cache';
import type { WazuhAlertSearchResponse, WazuhVulnerabilityResponse } from '@/lib/types';

const WAZUH_INDEXER_URL = process.env.WAZUH_INDEXER_URL || 'https://wazuh.indexer:9200';
const WAZUH_INDEXER_USER = process.env.WAZUH_INDEXER_USER || 'admin';
const WAZUH_INDEXER_PASSWORD = process.env.WAZUH_INDEXER_PASSWORD || '';

const indexerAuth = Buffer.from(`${WAZUH_INDEXER_USER}:${WAZUH_INDEXER_PASSWORD}`).toString('base64');

async function indexerFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return wazuhFetch(`${WAZUH_INDEXER_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Basic ${indexerAuth}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function searchWazuhAlerts(
  query: Record<string, unknown>,
  size = 50,
  from = 0,
  sort?: Record<string, string>
): Promise<WazuhAlertSearchResponse> {
  const body = {
    query,
    size,
    from,
    sort: sort ? [sort] : [{ timestamp: 'desc' }],
  };

  const cacheKey = `widx:alerts:${JSON.stringify(body)}`;
  return cached<WazuhAlertSearchResponse>(cacheKey, () =>
    indexerFetch('/wazuh-alerts-*/_search', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  );
}

export async function getRecentWazuhAlerts(
  minutes = 60,
  size = 100,
  minLevel = 0
): Promise<WazuhAlertSearchResponse> {
  const now = new Date();
  const from = new Date(now.getTime() - minutes * 60000);

  const query = {
    bool: {
      must: [
        { range: { timestamp: { gte: from.toISOString(), lte: now.toISOString() } } },
        ...(minLevel > 0 ? [{ range: { 'rule.level': { gte: minLevel } } }] : []),
      ],
    },
  };

  return searchWazuhAlerts(query, size);
}

export async function getWazuhFIMEvents(minutes = 60, size = 50): Promise<WazuhAlertSearchResponse> {
  const now = new Date();
  const from = new Date(now.getTime() - minutes * 60000);

  return searchWazuhAlerts(
    {
      bool: {
        must: [
          { range: { timestamp: { gte: from.toISOString(), lte: now.toISOString() } } },
          { exists: { field: 'syscheck' } },
        ],
      },
    },
    size
  );
}

export async function getWazuhVulnerabilities(size = 200): Promise<WazuhVulnerabilityResponse> {
  const boundedSize = Math.min(Math.max(size, 1), 500);
  const body = {
    query: {
      match_all: {},
    },
    size: boundedSize,
    track_total_hits: true,
    sort: [
      { 'vulnerability.severity': { order: 'desc' } },
      { 'vulnerability.detected_at': { order: 'desc' } },
    ],
  };

  return cached<WazuhVulnerabilityResponse>(
    `widx:vulns:${boundedSize}`,
    () =>
      indexerFetch('/wazuh-states-vulnerabilities-*/_search', {
        method: 'POST',
        body: JSON.stringify(body),
      })
  );
}
