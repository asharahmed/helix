import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function formatTimestamp(ts: string | number): string {
  const date = new Date(typeof ts === 'number' ? ts * 1000 : ts);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatRelativeTime(ts: string | number): string {
  const now = Date.now();
  const then = typeof ts === 'number' ? ts * 1000 : new Date(ts).getTime();
  const diff = now - then;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function severityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'firing':
      return 'text-red';
    case 'warning':
      return 'text-amber';
    case 'info':
    case 'resolved':
      return 'text-green';
    default:
      return 'text-text-secondary';
  }
}

export function severityBg(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'firing':
      return 'bg-red/10 border-red/30';
    case 'warning':
      return 'bg-amber/10 border-amber/30';
    case 'info':
    case 'resolved':
      return 'bg-green/10 border-green/30';
    default:
      return 'bg-surface border-border';
  }
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '...' : str;
}
