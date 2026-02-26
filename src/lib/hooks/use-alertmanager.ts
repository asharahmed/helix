'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_POLLING_INTERVAL } from '@/lib/constants';
import type { AlertmanagerAlert, AlertmanagerSilence, CreateSilencePayload } from '@/lib/types';

export function useAlertmanagerAlerts(interval?: number) {
  return useQuery<AlertmanagerAlert[]>({
    queryKey: ['alertmanager-alerts'],
    queryFn: async () => {
      const res = await fetch('/api/alertmanager/alerts');
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
  });
}

export function useAlertmanagerSilences(interval?: number) {
  return useQuery<AlertmanagerSilence[]>({
    queryKey: ['alertmanager-silences'],
    queryFn: async () => {
      const res = await fetch('/api/alertmanager/silences');
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
  });
}

export function useCreateSilence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSilencePayload) => {
      const res = await fetch('/api/alertmanager/silences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertmanager-silences'] });
      queryClient.invalidateQueries({ queryKey: ['alertmanager-alerts'] });
    },
  });
}

export function useExpireSilence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (silenceId: string) => {
      const res = await fetch(`/api/alertmanager/silences?id=${silenceId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertmanager-silences'] });
      queryClient.invalidateQueries({ queryKey: ['alertmanager-alerts'] });
    },
  });
}
