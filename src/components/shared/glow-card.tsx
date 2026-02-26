'use client';

import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'cyan' | 'amber' | 'red' | 'green';
  className?: string;
  padding?: boolean;
}

export function GlowCard({ children, variant = 'default', className, padding = true }: GlowCardProps) {
  const variantClass = {
    default: 'glow-card',
    cyan: 'glow-card-cyan',
    amber: 'glow-card-amber',
    red: 'glow-card-red',
    green: 'glow-card-green',
  }[variant];

  return (
    <div className={cn(variantClass, padding && 'p-4', className)}>
      {children}
    </div>
  );
}
