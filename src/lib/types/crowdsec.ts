export interface CrowdSecDecision {
  id: number;
  origin: string;
  type: string;
  scope: string;
  value: string;
  duration: string;
  scenario: string;
  simulated: boolean;
  until: string;
}

export interface CrowdSecDecisionResponse {
  new?: CrowdSecDecision[];
  deleted?: CrowdSecDecision[];
}
