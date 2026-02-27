'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, LayoutGrid, LayoutList, Search, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GlowCard } from '@/components/shared/glow-card';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { SilenceDialog } from './silence-dialog';
import { AlertDetailDrawer } from './alert-detail-drawer';
import { AlertGroupView } from './alert-group-view';
import { useAlertmanagerAlerts, useWazuhAlerts } from '@/lib/hooks';
import { formatRelativeTime, severityColor, truncate } from '@/lib/utils';
import { exportToCSV } from '@/lib/utils/export';
import { unifyAlerts } from '@/lib/utils/unify-alerts';
import type { UnifiedAlert } from '@/lib/types';

export function AlertTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'prometheus' | 'wazuh'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('flat');
  const [selectedAlert, setSelectedAlert] = useState<UnifiedAlert | null>(null);
  const [silenceTarget, setSilenceTarget] = useState<UnifiedAlert | null>(null);

  const { data: amAlerts, isLoading: amLoading, error: amError } = useAlertmanagerAlerts();
  const { data: wazuhAlerts, isLoading: wazLoading, error: wazError } = useWazuhAlerts(360, 200);

  useEffect(() => {
    const storedView = window.localStorage.getItem('helix-alert-view');
    if (storedView === 'flat' || storedView === 'grouped') {
      setViewMode(storedView);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('helix-alert-view', viewMode);
  }, [viewMode]);

  const unifiedAlerts = useMemo<UnifiedAlert[]>(
    () => unifyAlerts(amAlerts, wazuhAlerts),
    [amAlerts, wazuhAlerts]
  );

  const filteredAlerts = useMemo(() => {
    return unifiedAlerts.filter((alert) => {
      if (sourceFilter !== 'all' && alert.source !== sourceFilter) return false;
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          alert.title.toLowerCase().includes(term) ||
          alert.description.toLowerCase().includes(term) ||
          Object.values(alert.labels).some((v) => v.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [unifiedAlerts, sourceFilter, severityFilter, searchTerm]);

  const isLoading = amLoading || wazLoading;
  const hasError = amError || wazError;

  const exportRows = useMemo(
    () =>
      filteredAlerts.map((alert) => ({
        severity: alert.severity,
        title: alert.title,
        source: alert.source,
        status: alert.status,
        timestamp: alert.timestamp,
        description: alert.description,
      })),
    [filteredAlerts]
  );

  return (
    <>
      <GlowCard>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="prometheus">Prometheus</SelectItem>
              <SelectItem value="wazuh">Wazuh</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <span className="label-text">
            {filteredAlerts.length} alerts
          </span>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Export alerts as CSV"
            onClick={() => exportToCSV(exportRows, 'helix-alerts')}
            disabled={filteredAlerts.length === 0}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Export
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label={viewMode === 'flat' ? 'Switch to grouped alerts view' : 'Switch to flat alerts view'}
            onClick={() => setViewMode((current) => (current === 'flat' ? 'grouped' : 'flat'))}
          >
            {viewMode === 'flat' ? (
              <>
                <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                Grouped
              </>
            ) : (
              <>
                <LayoutList className="h-3.5 w-3.5 mr-1" />
                Flat
              </>
            )}
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <LoadingSkeleton lines={8} />
        ) : hasError ? (
          <ErrorState message="Failed to load alerts" />
        ) : viewMode === 'grouped' ? (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <AlertGroupView
              alerts={filteredAlerts}
              onSelectAlert={setSelectedAlert}
              onSilenceAlert={setSilenceTarget}
            />
          </ScrollArea>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Alert</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-expanded={selectedAlert?.id === alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedAlert(alert);
                      }
                    }}
                  >
                    <td>
                      <Badge
                        variant={
                          alert.severity === 'critical'
                            ? 'red'
                            : alert.severity === 'warning'
                            ? 'amber'
                            : 'default'
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </td>
                    <td>
                      <div>
                        <span className={`text-sm font-mono ${severityColor(alert.severity)}`}>
                          {truncate(alert.title, 50)}
                        </span>
                        {alert.description && (
                          <p className="text-xs text-muted mt-0.5 truncate max-w-md">
                            {alert.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge variant={alert.source === 'prometheus' ? 'cyan' : 'amber'}>
                        {alert.source}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-text-secondary">
                        {alert.status}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-muted">
                        {formatRelativeTime(alert.timestamp)}
                      </span>
                    </td>
                    <td>
                      {alert.source === 'prometheus' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSilenceTarget(alert);
                          }}
                        >
                          <VolumeX className="h-3.5 w-3.5 mr-1" />
                          Silence
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </GlowCard>

      {/* Detail Drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />

      {/* Silence Dialog */}
      <SilenceDialog
        alert={silenceTarget}
        onClose={() => setSilenceTarget(null)}
      />
    </>
  );
}
