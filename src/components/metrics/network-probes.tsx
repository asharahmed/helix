'use client';

import { useMemo } from 'react';
import { Globe, ArrowUp, ArrowDown } from 'lucide-react';
import { GlowCard } from '@/components/shared/glow-card';
import { Badge } from '@/components/ui/badge';
import { HexIndicator } from '@/components/shared/hex-indicator';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { usePrometheusQuery } from '@/lib/hooks';

export function NetworkProbes() {
  const { data: probeUp, isLoading: upLoading } = usePrometheusQuery('probe_success');
  const { data: probeDuration, isLoading: durLoading } = usePrometheusQuery('probe_duration_seconds');
  const { data: probeStatus, isLoading: statusLoading } = usePrometheusQuery('probe_http_status_code');

  const probes = useMemo(() => {
    if (!probeUp?.data?.result) return [];

    return probeUp.data.result.map((metric) => {
      const instance = metric.metric.instance || 'unknown';
      const isUp = metric.value?.[1] === '1';

      const duration = probeDuration?.data?.result?.find(
        (m) => m.metric.instance === instance
      );
      const status = probeStatus?.data?.result?.find(
        (m) => m.metric.instance === instance
      );

      return {
        instance,
        up: isUp,
        duration: duration?.value?.[1] ? parseFloat(duration.value[1]) * 1000 : null,
        statusCode: status?.value?.[1] ? parseInt(status.value[1]) : null,
      };
    });
  }, [probeUp, probeDuration, probeStatus]);

  const isLoading = upLoading || durLoading || statusLoading;

  return (
    <GlowCard>
      <div className="flex items-center gap-2 mb-3">
        <Globe className="h-4 w-4 text-cyan" />
        <h2 className="text-sm font-sans font-medium text-text-primary">
          Blackbox Probes
        </h2>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : probes.length === 0 ? (
        <p className="text-sm font-mono text-text-secondary text-center py-4">
          No probe targets configured
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {probes.map((probe) => (
            <div
              key={probe.instance}
              className={`flex items-center gap-3 rounded-md border p-3 transition-colors ${
                probe.up
                  ? 'border-green/20 bg-green/5'
                  : 'border-red/20 bg-red/5'
              }`}
            >
              <HexIndicator status={probe.up ? 'healthy' : 'down'} pulse={!probe.up} />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-mono text-text-primary truncate block">
                  {probe.instance}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  {probe.statusCode && (
                    <Badge variant={probe.statusCode < 400 ? 'green' : 'red'}>
                      {probe.statusCode}
                    </Badge>
                  )}
                  {probe.duration !== null && (
                    <span className="text-[10px] font-mono text-muted">
                      {probe.duration.toFixed(0)}ms
                    </span>
                  )}
                </div>
              </div>
              {probe.up ? (
                <ArrowUp className="h-4 w-4 text-green shrink-0" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </GlowCard>
  );
}
