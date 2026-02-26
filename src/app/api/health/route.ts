import { NextResponse } from 'next/server';
import { wazuhFetch } from '@/lib/clients/tls';
import type { ServiceHealth, HealthResponse, ServiceName } from '@/lib/types';

const services: { name: ServiceName; url: string; path: string }[] = [
  { name: 'prometheus', url: process.env.PROMETHEUS_URL || 'http://prometheus:9090', path: '/-/healthy' },
  { name: 'alertmanager', url: process.env.ALERTMANAGER_URL || 'http://alertmanager:9093', path: '/-/healthy' },
  { name: 'loki', url: process.env.LOKI_URL || 'http://loki:3100', path: '/ready' },
  { name: 'crowdsec', url: process.env.CROWDSEC_URL || 'http://crowdsec:8080', path: '/health' },
];

async function checkService(svc: { name: ServiceName; url: string; path: string }): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const res = await fetch(`${svc.url}${svc.path}`, {
      signal: AbortSignal.timeout(5000),
    });
    return {
      name: svc.name,
      status: res.ok ? 'healthy' : 'degraded',
      latency: Date.now() - start,
    };
  } catch (err) {
    return {
      name: svc.name,
      status: 'down',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function checkWazuh(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const res = await wazuhFetch(`${process.env.WAZUH_API_URL || 'https://wazuh.manager:55000'}/`, {
      signal: AbortSignal.timeout(5000),
    });
    return {
      name: 'wazuh',
      status: res.status === 401 || res.ok ? 'healthy' : 'degraded',
      latency: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'wazuh',
      status: 'down',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function checkWazuhIndexer(): Promise<ServiceHealth> {
  const start = Date.now();
  const indexerUrl = process.env.WAZUH_INDEXER_URL || 'https://wazuh.indexer:9200';
  const indexerUser = process.env.WAZUH_INDEXER_USER || 'admin';
  const indexerPass = process.env.WAZUH_INDEXER_PASSWORD || '';
  const auth = Buffer.from(`${indexerUser}:${indexerPass}`).toString('base64');
  try {
    const res = await wazuhFetch(`${indexerUrl}/_cluster/health`, {
      signal: AbortSignal.timeout(5000),
      headers: { Authorization: `Basic ${auth}` },
    });
    return {
      name: 'wazuh-indexer',
      status: res.ok ? 'healthy' : res.status === 401 ? 'degraded' : 'degraded',
      latency: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'wazuh-indexer',
      status: 'down',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function GET() {
  const results = await Promise.all([
    ...services.map(checkService),
    checkWazuh(),
    checkWazuhIndexer(),
  ]);

  const allHealthy = results.every((r) => r.status === 'healthy');
  const anyDown = results.some((r) => r.status === 'down');

  const response: HealthResponse = {
    status: allHealthy ? 'ok' : anyDown ? 'down' : 'degraded',
    services: results,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    status: allHealthy ? 200 : 503,
  });
}
