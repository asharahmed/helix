import { describe, it, expect } from 'vitest';
import { unifyAlerts } from '@/lib/utils/unify-alerts';
import type { AlertmanagerAlert, WazuhAlertSearchResponse } from '@/lib/types';

function makePromAlert(
  overrides: Partial<AlertmanagerAlert> = {}
): AlertmanagerAlert {
  return {
    annotations: {},
    endsAt: '2026-02-26T12:10:00.000Z',
    fingerprint: 'fp-default',
    receivers: [{ name: 'default' }],
    startsAt: '2026-02-26T12:00:00.000Z',
    status: {
      inhibitedBy: [],
      silencedBy: [],
      state: 'active',
    },
    updatedAt: '2026-02-26T12:00:30.000Z',
    generatorURL: 'http://prometheus.example/graph',
    labels: {
      alertname: 'NodeDown',
      severity: 'warning',
      instance: 'node-1',
    },
    ...overrides,
  };
}

function makeWazuhResponse(
  hits: WazuhAlertSearchResponse['hits']['hits']
): WazuhAlertSearchResponse {
  return {
    hits: {
      total: {
        value: hits.length,
        relation: 'eq',
      },
      hits,
    },
  };
}

describe('unifyAlerts', () => {
  it('returns empty array when both sources are empty', () => {
    expect(unifyAlerts(undefined, undefined)).toEqual([]);
  });

  it('normalises Prometheus alerts', () => {
    const prom = [
      makePromAlert({
        fingerprint: 'fp-1',
        labels: { alertname: 'CPUHigh', severity: 'critical', job: 'node' },
      }),
    ];

    const result = unifyAlerts(prom, undefined);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'fp-1',
      source: 'prometheus',
      severity: 'critical',
      title: 'CPUHigh',
      status: 'active',
      labels: {
        alertname: 'CPUHigh',
        severity: 'critical',
        job: 'node',
      },
    });
  });

  it('normalises Wazuh alerts', () => {
    const wazuh = makeWazuhResponse([
      {
        _id: 'w-1',
        _source: {
          timestamp: '2026-02-26T12:05:00.000Z',
          rule: {
            id: '100001',
            level: 13,
            description: 'Suspicious activity',
            groups: ['authentication_failed'],
            firedtimes: 1,
          },
          agent: {
            id: '001',
            name: 'agent-a',
            ip: '10.0.0.1',
          },
          manager: { name: 'wazuh-manager' },
          full_log: 'Failed login attempt',
        },
      },
    ]);

    const result = unifyAlerts(undefined, wazuh);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'w-1',
      source: 'wazuh',
      severity: 'critical',
      title: 'Suspicious activity',
      status: 'active',
      labels: {
        agent: 'agent-a',
        rule_id: '100001',
        level: '13',
        groups: 'authentication_failed',
      },
    });
  });

  it('sorts mixed alerts by severity, then newest timestamp', () => {
    const prom = [
      makePromAlert({
        fingerprint: 'p-critical-old',
        startsAt: '2026-02-26T11:00:00.000Z',
        labels: { alertname: 'DiskFull', severity: 'critical', instance: 'node-2' },
      }),
      makePromAlert({
        fingerprint: 'p-warning',
        startsAt: '2026-02-26T13:00:00.000Z',
        labels: { alertname: 'LoadHigh', severity: 'warning', instance: 'node-3' },
      }),
    ];

    const wazuh = makeWazuhResponse([
      {
        _id: 'w-critical-new',
        _source: {
          timestamp: '2026-02-26T12:30:00.000Z',
          rule: {
            id: '100002',
            level: 15,
            description: 'Privilege escalation',
            groups: ['privilege_escalation'],
            firedtimes: 1,
          },
          agent: { id: '010', name: 'agent-b', ip: '10.0.0.10' },
          manager: { name: 'wazuh-manager' },
          full_log: 'Detected escalation',
        },
      },
      {
        _id: 'w-info',
        _source: {
          timestamp: '2026-02-26T12:40:00.000Z',
          rule: {
            id: '100003',
            level: 3,
            description: 'Informational event',
            groups: ['syslog'],
            firedtimes: 1,
          },
          agent: { id: '011', name: 'agent-c', ip: '10.0.0.11' },
          manager: { name: 'wazuh-manager' },
          full_log: 'Routine event',
        },
      },
    ]);

    const result = unifyAlerts(prom, wazuh);

    expect(result.map((alert) => alert.id)).toEqual([
      'w-critical-new',
      'p-critical-old',
      'p-warning',
      'w-info',
    ]);
  });
});
