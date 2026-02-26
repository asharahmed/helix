'use client';

import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield } from 'lucide-react';
import { GlowCard } from '@/components/shared/glow-card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { useWazuhAlerts } from '@/lib/hooks';
import { formatRelativeTime } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function WazuhAlertsPanel() {
  const [timeRange, setTimeRange] = useState('60');
  const { data, isLoading, error } = useWazuhAlerts(parseInt(timeRange), 200);

  const groupedData = useMemo(() => {
    if (!data?.hits?.hits) return [];
    const groups: Record<string, number> = {};
    for (const hit of data.hits.hits) {
      const ruleGroups = hit._source.rule.groups || [];
      for (const group of ruleGroups) {
        groups[group] = (groups[group] || 0) + 1;
      }
    }
    return Object.entries(groups)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data]);

  const BAR_COLORS = ['#00d4ff', '#00a0cc', '#0080a0', '#006080', '#004060'];

  return (
    <GlowCard>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber" />
          <h2 className="text-sm font-sans font-medium text-text-primary">
            Wazuh Alerts by Group
          </h2>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[100px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 min</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="360">6 hours</SelectItem>
            <SelectItem value="1440">24 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={5} />
      ) : error ? (
        <ErrorState message="Failed to load Wazuh alerts" />
      ) : groupedData.length === 0 ? (
        <p className="text-sm font-mono text-text-secondary text-center py-8">
          No alerts in time range
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={groupedData} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#e0e0e0', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f0f1a',
                border: '1px solid #1a1a2e',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {groupedData.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Recent alerts list */}
      {data?.hits?.hits && data.hits.hits.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <span className="label-text mb-2 block">Recent Events</span>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1.5 pr-2">
              {data.hits.hits.slice(0, 20).map((hit) => (
                <div
                  key={hit._id}
                  className="flex items-center gap-2 text-xs font-mono py-1 border-b border-border/30"
                >
                  <Badge
                    variant={
                      hit._source.rule.level >= 12
                        ? 'red'
                        : hit._source.rule.level >= 8
                        ? 'amber'
                        : 'default'
                    }
                    className="shrink-0"
                  >
                    L{hit._source.rule.level}
                  </Badge>
                  <span className="text-text-primary truncate flex-1">
                    {hit._source.rule.description}
                  </span>
                  <span className="text-muted shrink-0">
                    {formatRelativeTime(hit._source.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </GlowCard>
  );
}
