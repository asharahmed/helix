export interface PrometheusQueryResult {
  status: string;
  data: {
    resultType: 'matrix' | 'vector' | 'scalar' | 'string';
    result: PrometheusMetric[];
  };
}

export interface PrometheusMetric {
  metric: Record<string, string>;
  value?: [number, string]; // instant vector
  values?: [number, string][]; // range vector
}

export interface PrometheusAlert {
  labels: Record<string, string>;
  annotations: Record<string, string>;
  state: 'firing' | 'pending' | 'inactive';
  activeAt: string;
  value: string;
}

export interface PrometheusAlertGroup {
  name: string;
  file: string;
  rules: PrometheusAlertRule[];
}

export interface PrometheusAlertRule {
  name: string;
  query: string;
  duration: number;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  alerts: PrometheusAlert[];
  state: string;
  type: string;
}

export interface PrometheusTarget {
  discoveredLabels: Record<string, string>;
  labels: Record<string, string>;
  scrapePool: string;
  scrapeUrl: string;
  globalUrl: string;
  lastError: string;
  lastScrape: string;
  lastScrapeDuration: number;
  health: 'up' | 'down' | 'unknown';
}

export interface PrometheusTargetResponse {
  status: string;
  data: {
    activeTargets: PrometheusTarget[];
    droppedTargets: PrometheusTarget[];
  };
}
