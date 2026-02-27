'use client';

import { Search, Play, Pause, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLokiLabelValues } from '@/lib/hooks';

interface LogFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedContainers: string[];
  onContainerChange: (containers: string[]) => void;
  isLive: boolean;
  onLiveToggle: () => void;
  logCount: number;
  onExport?: () => void;
}

export function LogFilters({
  searchTerm,
  onSearchChange,
  selectedContainers,
  onContainerChange,
  isLive,
  onLiveToggle,
  logCount,
  onExport,
}: LogFiltersProps) {
  const { data: containerValues } = useLokiLabelValues('container');
  const containers = containerValues?.data ?? [];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
        <Input
          placeholder="Filter logs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Container filter */}
      <Select
        value={selectedContainers[0] || 'all'}
        onValueChange={(v) => onContainerChange(v === 'all' ? [] : [v])}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All containers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All containers</SelectItem>
          {containers.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Live mode toggle */}
      <Button
        variant={isLive ? 'default' : 'outline'}
        size="sm"
        onClick={onLiveToggle}
        className={isLive ? 'border-green text-green bg-green/10' : ''}
      >
        {isLive ? (
          <>
            <Pause className="h-3.5 w-3.5 mr-1" />
            Live
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5 mr-1" />
            Live
          </>
        )}
      </Button>

      <Badge>{logCount} entries</Badge>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Export logs as CSV"
        onClick={onExport}
        disabled={!onExport || logCount === 0}
      >
        <Download className="h-3.5 w-3.5 mr-1" />
        Export
      </Button>
    </div>
  );
}
