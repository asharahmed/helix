'use client';

import { useMemo } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTimestamp, severityColor } from '@/lib/utils';
import type { AlertmanagerAlert, UnifiedAlert } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertDetailDrawerProps {
  alert: UnifiedAlert | null;
  onClose: () => void;
}

export function AlertDetailDrawer({ alert, onClose }: AlertDetailDrawerProps) {
  const grafanaUrl = useMemo(() => {
    if (!alert || alert.source !== 'prometheus') return '';

    const grafanaBase = process.env.GRAFANA_URL;
    const rawAlert = alert.raw as AlertmanagerAlert;
    const expr = alert.labels.expr || alert.labels.expression || alert.labels.query;

    if (grafanaBase && expr) {
      const left = JSON.stringify({
        queries: [{ refId: 'A', expr }],
      });
      return `${grafanaBase.replace(/\/$/, '')}/explore?orgId=1&left=${encodeURIComponent(left)}`;
    }

    return rawAlert.generatorURL || '';
  }, [alert]);

  return (
    <AnimatePresence>
      {alert && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-md lg:max-w-lg border-l border-border bg-surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-detail-title"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 id="alert-detail-title" className="card-title">Alert Details</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close alert details">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-57px)]">
              <div className="p-4 space-y-6">
                {/* Title & Severity */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
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
                    <Badge variant={alert.source === 'prometheus' ? 'cyan' : 'amber'}>
                      {alert.source}
                    </Badge>
                    <span className="text-xs font-mono text-muted">
                      {alert.status}
                    </span>
                  </div>
                  <h3 className={`text-lg font-mono font-medium ${severityColor(alert.severity)}`}>
                    {alert.title}
                  </h3>
                </div>

                {/* Description */}
                {alert.description && (
                  <div>
                    <label className="label-text mb-1 block">Description</label>
                    <p className="text-sm font-mono text-text-primary bg-background/50 rounded p-3 border border-border">
                      {alert.description}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <div>
                  <label className="label-text mb-1 block">Started</label>
                  <span className="text-sm font-mono text-text-primary">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>

                {grafanaUrl ? (
                  <div>
                    <label className="label-text mb-1 block">Observability</label>
                    <a
                      href={grafanaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-mono text-cyan hover:text-cyan/80"
                    >
                      View in Grafana
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : null}

                {/* Labels */}
                <div>
                  <label className="label-text mb-2 block">Labels</label>
                  <div className="space-y-1.5">
                    {Object.entries(alert.labels).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 text-sm font-mono bg-background/50 rounded px-3 py-1.5 border border-border"
                      >
                        <span className="text-cyan">{key}</span>
                        <span className="text-muted">=</span>
                        <span className="text-text-primary break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw JSON */}
                <div>
                  <label className="label-text mb-2 block">Raw Data</label>
                  <pre className="text-xs font-mono text-text-secondary bg-background/50 rounded p-3 border border-border overflow-x-auto max-h-[300px]">
                    {JSON.stringify(alert.raw, null, 2)}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
