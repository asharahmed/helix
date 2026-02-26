/**
 * Shared Recharts theme values derived from the Tailwind/CSS design tokens.
 * Recharts requires literal values (not CSS variables), so we centralise them here.
 */

const FONT = "'JetBrains Mono', monospace";

export const CHART_COLORS = {
  cyan: '#00d4ff',
  amber: '#ffb800',
  red: '#ff3b4f',
  green: '#00e676',
} as const;

export const CHART_AXIS = {
  fill: '#6b7280',
  fontSize: 10,
  fontFamily: FONT,
} as const;

export const CHART_GRID = {
  stroke: '#1a1a2e',
  strokeDasharray: '3 3',
} as const;

export const CHART_TOOLTIP = {
  contentStyle: {
    backgroundColor: '#0f0f1a',
    border: '1px solid #1a1a2e',
    borderRadius: 8,
    fontSize: 11,
    fontFamily: FONT,
    padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  } as React.CSSProperties,
  cursor: { stroke: '#2a2a4e', strokeWidth: 1 },
} as const;
