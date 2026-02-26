'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GlowCard } from '@/components/shared/glow-card';
import { LogLine } from './log-line';
import { LogFilters } from './log-filters';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { useLokiQuery, parseLokiStreams } from '@/lib/hooks';
import type { LogEntry } from '@/lib/types';

export function LogStream() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [liveEntries, setLiveEntries] = useState<LogEntry[]>([]);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<string | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);
  const scrolledToBottom = useRef(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCount = useRef(0);

  // Build Loki query
  const lokiQuery = useMemo(() => {
    if (selectedContainers.length > 0) {
      // Escape special regex characters in container names before interpolation
      const escaped = selectedContainers.map((c) =>
        c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      );
      return `{container=~"${escaped.join('|')}"}`;
    }
    return '{job=~".+"}';
  }, [selectedContainers]);

  // Historical logs (poll mode)
  const { data, isLoading, error } = useLokiQuery(
    lokiQuery,
    500,
    undefined,
    undefined,
    !isLive,
    isLive ? undefined : 15000
  );

  const historicalEntries = useMemo(() => parseLokiStreams(data), [data]);

  // Live mode - connect to Loki tail via SSE
  const connectLiveTail = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const params = new URLSearchParams({ query: lokiQuery });
    if (lastSeenTimestamp) {
      params.set('start', lastSeenTimestamp);
    }

    const es = new EventSource(`/api/loki/tail?${params}`);
    eventSourceRef.current = es;

    es.onopen = () => {
      retryCount.current = 0;
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.streams) {
          const newEntries: LogEntry[] = [];
          for (const stream of data.streams) {
            for (const [ts, line] of stream.values) {
              newEntries.push({
                timestamp: ts,
                line,
                labels: stream.stream,
                id: `${ts}-${line.slice(0, 20)}`,
              });
              setLastSeenTimestamp(ts);
            }
          }
          if (newEntries.length > 0) {
            setLiveEntries((prev) => [...prev, ...newEntries].slice(-2000));
          }
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
      retryCount.current++;
      setTimeout(() => {
        if (isLive) connectLiveTail();
      }, delay);
    };
  }, [lokiQuery, lastSeenTimestamp, isLive]);

  useEffect(() => {
    if (isLive) {
      connectLiveTail();
    }
    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [isLive, connectLiveTail]);

  const handleLiveToggle = () => {
    if (isLive) {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      setIsLive(false);
    } else {
      setLiveEntries([]);
      setIsLive(true);
    }
  };

  // Combine entries
  const allEntries = isLive ? liveEntries : historicalEntries;

  // Filter by search term
  const filteredEntries = useMemo(() => {
    if (!searchTerm) return allEntries;
    const term = searchTerm.toLowerCase();
    return allEntries.filter((entry) => entry.line.toLowerCase().includes(term));
  }, [allEntries, searchTerm]);

  // Virtual scroller
  const virtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 20,
  });

  // Auto-scroll to bottom in live mode
  useEffect(() => {
    if (isLive && scrolledToBottom.current && filteredEntries.length > 0) {
      virtualizer.scrollToIndex(filteredEntries.length - 1, { align: 'end' });
    }
  }, [filteredEntries.length, isLive, virtualizer]);

  // Detect scroll position
  const handleScroll = useCallback(() => {
    const el = parentRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    scrolledToBottom.current = atBottom;
  }, []);

  return (
    <GlowCard padding={false}>
      <div className="p-4 border-b border-border">
        <LogFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedContainers={selectedContainers}
          onContainerChange={setSelectedContainers}
          isLive={isLive}
          onLiveToggle={handleLiveToggle}
          logCount={filteredEntries.length}
        />
      </div>

      {isLoading && !isLive ? (
        <div className="p-4">
          <LoadingSkeleton lines={10} />
        </div>
      ) : error && !isLive ? (
        <div className="p-4">
          <ErrorState message="Failed to load logs" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="p-8 text-center text-sm font-mono text-text-secondary">
          {isLive ? 'Waiting for logs...' : 'No logs found'}
        </div>
      ) : (
        <div
          ref={parentRef}
          className="h-[calc(100vh-240px)] overflow-auto"
          onScroll={handleScroll}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const entry = filteredEntries[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <LogLine
                    timestamp={entry.timestamp}
                    line={entry.line}
                    labels={entry.labels}
                    isHighlighted={!!searchTerm && entry.line.toLowerCase().includes(searchTerm.toLowerCase())}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlowCard>
  );
}
