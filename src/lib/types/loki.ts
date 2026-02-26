export interface LokiQueryResponse {
  status: string;
  data: {
    resultType: 'streams' | 'matrix' | 'vector';
    result: LokiStream[];
    stats?: Record<string, unknown>;
  };
}

export interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][]; // [timestamp_ns, log_line]
}

export interface LokiLabelsResponse {
  status: string;
  data: string[];
}

export interface LokiTailEvent {
  streams: LokiStream[];
  dropped_entries?: {
    labels: Record<string, string>;
    timestamp: string;
  }[];
}

export interface LogEntry {
  timestamp: string;
  line: string;
  labels: Record<string, string>;
  id: string;
}
