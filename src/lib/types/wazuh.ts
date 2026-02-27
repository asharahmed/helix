export interface WazuhAgent {
  id: string;
  name: string;
  ip: string;
  status: 'active' | 'disconnected' | 'pending' | 'never_connected';
  os?: {
    name: string;
    platform: string;
    version: string;
    arch: string;
  };
  node_name: string;
  manager: string;
  dateAdd: string;
  lastKeepAlive: string;
  group?: string[];
  version: string;
}

export interface WazuhAgentResponse {
  data: {
    affected_items: WazuhAgent[];
    total_affected_items: number;
    total_failed_items: number;
    failed_items: unknown[];
  };
  message: string;
  error: number;
}

export interface WazuhAlert {
  _id: string;
  _source: {
    timestamp: string;
    rule: {
      id: string;
      level: number;
      description: string;
      groups: string[];
      firedtimes: number;
      mitre?: {
        id: string[];
        tactic: string[];
        technique: string[];
      };
    };
    agent: {
      id: string;
      name: string;
      ip: string;
    };
    manager: {
      name: string;
    };
    full_log?: string;
    data?: Record<string, unknown>;
    syscheck?: {
      path: string;
      event: string;
      md5_before?: string;
      md5_after?: string;
      sha256_before?: string;
      sha256_after?: string;
      size_before?: string;
      size_after?: string;
      uid_after?: string;
      gid_after?: string;
    };
  };
}

export interface WazuhAlertSearchResponse {
  hits: {
    total: {
      value: number;
      relation: string;
    };
    hits: WazuhAlert[];
  };
}

export interface WazuhScanResponse {
  data: {
    affected_items: { agent: string; task_id: number }[];
    total_affected_items: number;
    total_failed_items: number;
    failed_items: unknown[];
  };
  message: string;
  error: number;
}

export interface WazuhFIMEvent {
  timestamp: string;
  agent: { id: string; name: string };
  path: string;
  event: string;
  md5Before?: string;
  md5After?: string;
  sha256Before?: string;
  sha256After?: string;
}

export interface WazuhTokenResponse {
  data: {
    token: string;
  };
}

export interface WazuhVulnerability {
  _id: string;
  _source: {
    agent: {
      id: string;
      name: string;
    };
    vulnerability: {
      id: string;
      severity: string;
      package: {
        name: string;
        version: string;
      };
      detected_at: string;
      published_at: string;
      title: string;
      reference: string;
    };
  };
}

export interface WazuhVulnerabilityResponse {
  hits: {
    total: {
      value: number;
      relation?: string;
    };
    hits: WazuhVulnerability[];
  };
}
