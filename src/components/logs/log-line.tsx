'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface LogLineProps {
  timestamp: string;
  line: string;
  labels: Record<string, string>;
  isHighlighted?: boolean;
}

/** Syntax-highlight JSON-like content in log lines */
function highlightLine(line: string): React.ReactNode {
  // Try to detect if the line is JSON
  const trimmed = line.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      // Validate it's actually JSON
      JSON.parse(trimmed);
      return highlightJSON(trimmed);
    } catch {
      // Not valid JSON, render as plain text
    }
  }
  return <span>{line}</span>;
}

function highlightJSON(json: string): React.ReactNode {
  // Tokenize and colourise
  const parts: React.ReactNode[] = [];
  let i = 0;

  const addPlain = (text: string) => {
    if (text) parts.push(<span key={i++} className="text-text-secondary">{text}</span>);
  };

  // Simple regex-based highlighting for JSON
  const tokenRegex = /("(?:[^"\\]|\\.)*")\s*:/g;
  const valueRegex = /:\s*("(?:[^"\\]|\\.)*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

  let lastIndex = 0;
  let match;

  // Keys
  const keyPositions: Array<{ start: number; end: number; key: string }> = [];
  while ((match = tokenRegex.exec(json)) !== null) {
    keyPositions.push({
      start: match.index,
      end: match.index + match[0].length,
      key: match[1],
    });
  }

  if (keyPositions.length === 0) {
    return <span className="text-text-primary">{json}</span>;
  }

  // Build highlighted output character by character segments
  const highlighted = json
    .replace(
      /("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")/g,
      '<span class="text-cyan">$1</span>: <span class="text-green">$2</span>'
    )
    .replace(
      /("(?:[^"\\]|\\.)*")\s*:\s*(-?\d+(?:\.\d+)?)/g,
      '<span class="text-cyan">$1</span>: <span class="text-amber">$2</span>'
    )
    .replace(
      /("(?:[^"\\]|\\.)*")\s*:\s*(true|false|null)/g,
      '<span class="text-cyan">$1</span>: <span class="text-red">$2</span>'
    );

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

export const LogLine = memo(function LogLine({
  timestamp,
  line,
  labels,
  isHighlighted,
}: LogLineProps) {
  const formattedTime = useMemo(() => {
    // Loki timestamps are nanoseconds
    const ms = parseInt(timestamp) / 1_000_000;
    const date = new Date(ms);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  }, [timestamp]);

  const container = labels.container || labels.container_name || labels.job || '';

  return (
    <div
      className={cn(
        'flex items-start gap-2 px-3 py-0.5 font-mono text-xs hover:bg-surface/50 transition-colors border-b border-border/20',
        isHighlighted && 'bg-cyan/5'
      )}
    >
      <span className="text-muted shrink-0 w-20 tabular-nums">{formattedTime}</span>
      {container && (
        <span className="text-cyan shrink-0 w-24 truncate">{container}</span>
      )}
      <span className="text-text-primary break-all flex-1">{highlightLine(line)}</span>
    </div>
  );
});
