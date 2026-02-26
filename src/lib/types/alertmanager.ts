export interface AlertmanagerAlert {
  annotations: Record<string, string>;
  endsAt: string;
  fingerprint: string;
  receivers: { name: string }[];
  startsAt: string;
  status: {
    inhibitedBy: string[];
    silencedBy: string[];
    state: 'active' | 'suppressed' | 'unprocessed';
  };
  updatedAt: string;
  generatorURL: string;
  labels: Record<string, string>;
}

export interface AlertmanagerSilence {
  id: string;
  status: {
    state: 'active' | 'pending' | 'expired';
  };
  updatedAt: string;
  comment: string;
  createdBy: string;
  endsAt: string;
  startsAt: string;
  matchers: AlertmanagerMatcher[];
}

export interface AlertmanagerMatcher {
  isEqual: boolean;
  isRegex: boolean;
  name: string;
  value: string;
}

export interface CreateSilencePayload {
  matchers: AlertmanagerMatcher[];
  startsAt: string;
  endsAt: string;
  createdBy: string;
  comment: string;
}
