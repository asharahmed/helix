'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DataCounterProps {
  value: number;
  label: string;
  color?: 'cyan' | 'amber' | 'red' | 'green' | 'default';
  className?: string;
}

export function DataCounter({ value, label, color = 'default', className }: DataCounterProps) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on('change', (v) => setDisplayValue(v));
  }, [display]);

  const colorClasses = {
    cyan: 'text-cyan',
    amber: 'text-amber',
    red: 'text-red',
    green: 'text-green',
    default: 'text-text-primary',
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <motion.span
        className={cn('text-2xl font-mono font-bold tabular-nums leading-none', colorClasses[color])}
      >
        {displayValue}
      </motion.span>
      <span className="label-text mt-1.5">{label}</span>
    </div>
  );
}
