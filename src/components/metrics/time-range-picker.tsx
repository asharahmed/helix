'use client';

import { cn } from '@/lib/utils';
import { TIME_RANGES } from '@/lib/constants';

interface TimeRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  return (
    <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
      {TIME_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            'px-3 py-1 rounded-md text-xs font-mono transition-colors',
            value === range.value
              ? 'bg-cyan/10 text-cyan border border-cyan/30'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
