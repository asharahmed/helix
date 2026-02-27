import { beforeEach, describe, expect, it, vi } from 'vitest';
import { eventBus } from '@/lib/event-bus';

process.env.WEBHOOK_SECRET = 'test-secret';

const { secureCompareMock } = vi.hoisted(() => ({
  secureCompareMock: vi.fn(),
}));

vi.mock('@/lib/utils/secure-compare', () => ({
  secureCompare: secureCompareMock,
}));

import { POST as postAlertmanagerWebhook } from '@/app/api/webhooks/alertmanager/route';
import { POST as postWazuhWebhook } from '@/app/api/webhooks/wazuh/route';

describe('webhook authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    secureCompareMock.mockImplementation((a: string, b: string) => a === b);
  });

  it('publishes alertmanager events with valid token', async () => {
    const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});
    const response = await postAlertmanagerWebhook(
      new Request('http://localhost/api/webhooks/alertmanager', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-secret',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alerts: [{ status: 'firing' }] }),
      }) as any
    );

    expect(response.status).toBe(200);
    expect(secureCompareMock).toHaveBeenCalledWith('Bearer test-secret', 'Bearer test-secret');
    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(publishSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'alert',
        source: 'alertmanager',
      })
    );
  });

  it('returns 401 and does not publish when token is invalid', async () => {
    const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});
    const response = await postAlertmanagerWebhook(
      new Request('http://localhost/api/webhooks/alertmanager', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer wrong-secret',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alerts: [] }),
      }) as any
    );

    expect(response.status).toBe(401);
    expect(secureCompareMock).toHaveBeenCalledWith('Bearer wrong-secret', 'Bearer test-secret');
    expect(publishSpy).not.toHaveBeenCalled();
  });

  it('publishes wazuh events with valid token', async () => {
    const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});
    const response = await postWazuhWebhook(
      new Request('http://localhost/api/webhooks/wazuh', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-secret',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rule: { id: '100001' } }),
      }) as any
    );

    expect(response.status).toBe(200);
    expect(secureCompareMock).toHaveBeenCalledWith('Bearer test-secret', 'Bearer test-secret');
    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(publishSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'security',
        source: 'wazuh',
      })
    );
  });
});
