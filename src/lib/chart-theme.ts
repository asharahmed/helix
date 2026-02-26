/**
 * Shared Recharts theme values derived from the Tailwind/CSS design tokens.
 * Recharts requires literal values (not CSS variables), so we centralise them here.
 */

export const CHART_COLORS = {
  cyan: '#00d4ff',
  amber: '#ffb800',
  red: '#ff3b4f',
  green: '#00e676',
} as const;

export const CHART_AXIS = {
  fill: '#6b7280',
  fontSize: 10,
  fontFamily: "'JetBrains Mono', monospace",
} as const;

export const CHART_GRID = {
  stroke: '#1a1a2e',
  strokeDasharray: '3 3',
} as const;

export const CHART_TOOLTIP = {
  contentStyle: {
    backgroundColor: '#0f0f1a',
    border: '1px solid #1a1a2e',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
  } as React.CSSProperties,
} as const;
