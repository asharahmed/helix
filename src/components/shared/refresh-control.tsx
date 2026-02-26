'use client';

import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { POLLING_INTERVALS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RefreshControlProps {
  onIntervalChange?: (interval: number) => void;
  currentInterval?: number;
}

export function RefreshControl({ onIntervalChange, currentInterval }: RefreshControlProps) {
  const queryClient = useQueryClient();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    queryClient.invalidateQueries();
    setTimeout(() => setSpinning(false), 1000);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={String(currentInterval ?? POLLING_INTERVALS.normal)}
        onValueChange={(v) => onIntervalChange?.(parseInt(v))}
      >
        <SelectTrigger className="w-[100px] h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={String(POLLING_INTERVALS.fast)}>5s</SelectItem>
          <SelectItem value={String(POLLING_INTERVALS.normal)}>15s</SelectItem>
          <SelectItem value={String(POLLING_INTERVALS.slow)}>30s</SelectItem>
          <SelectItem value={String(POLLING_INTERVALS.lazy)}>60s</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-7 w-7">
        <RefreshCw className={cn('h-3.5 w-3.5', spinning && 'animate-spin')} />
      </Button>
    </div>
  );
}
