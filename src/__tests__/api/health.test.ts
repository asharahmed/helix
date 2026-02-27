import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HealthResponse } from '@/lib/types';

const { mockWazuhFetch } = vi.hoisted(() => ({
  mockWazuhFetch: vi.fn(),
}));

vi.mock('@/lib/clients/tls', () => ({
  wazuhFetch: mockWazuhFetch,
}));

import { GET } from '@/app/api/health/route';

function serviceResponse(status: number): Response {
  return new Response('{}', { status });
}

describe('GET /api/health', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('returns ok when all services are healthy', async () => {
    fetchMock
      .mockResolvedValueOnce(serviceResponse(200))
      .mockResolvedValueOnce(serviceResponse(200))
      .mockResolvedValueOnce(serviceResponse(200))
      .mockResolvedValueOnce(serviceResponse(200));

    mockWazuhFetch
      .mockResolvedValueOnce(serviceResponse(401))
      .mockResolvedValueOnce(serviceResponse(200));

    const response = await GET();
    const body = (await response.json()) as HealthResponse;

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.services).toHaveLength(6);
    expect(body.services.every((service) => service.status === 'healthy')).toBe(true);
  });

  it('returns down when one service is down', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('Connection refused'))
      .mockResolvedValueOnce(serviceResponse(200))
      .mockResolvedValueOnce(serviceResponse(200))
      .mockResolvedValueOnce(serviceResponse(200));

    mockWazuhFetch
      .mockResolvedValueOnce(serviceResponse(200))
      .mockResolvedValueOnce(serviceResponse(200));

    const response = await GET();
    const body = (await response.json()) as HealthResponse;

    expect(response.status).toBe(503);
    expect(body.status).toBe('down');
    expect(body.services.some((service) => service.status === 'down')).toBe(true);
  });

  it('returns degraded when one service is degraded and none are down', async () => {
    fetchMock
      .mockResolvedValueOnce(serviceResponse(200))
      .mockResolvedValueOnce(serviceResponse(500))
      .mockResolvedValueOnce(serviceResponse(200))
      .mockResolvedValueOnce(serviceResponse(200));

    mockWazuhFetch
      .mockResolvedValueOnce(serviceResponse(200))
      .mockResolvedValueOnce(serviceResponse(200));

    const response = await GET();
    const body = (await response.json()) as HealthResponse;

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.some((service) => service.status === 'degraded')).toBe(true);
    expect(body.services.some((service) => service.status === 'down')).toBe(false);
  });
});
