import type {
  CustomerCredit,
  CustomerEstimatedCostPolicy,
  InvoiceCost,
  InvoiceCostItem,
  ProjectCredit,
  ProjectEstimatedCostPolicy,
  Resource,
  SlurmPeriodicUsagePolicy,
  SlurmPolicyEvaluationLog,
} from 'waldur-js-client';

export type PolicyWatchVariant =
  'health' | 'spend' | 'breakdown' | 'timeline' | 'matrix';

export type ResourceStatusBucket =
  'ok' | 'notification' | 'slowdown' | 'paused' | 'downscaled';

interface PolicyAttributionPayload {
  policy_class?: string;
  policy_uuid?: string;
  action?: string;
  scope_name?: string;
  timestamp?: string;
  limit_cost?: string;
  limit_type?: string;
  grace_ratio?: string;
  actions?: string;
}

export type ResourceWithAttribution = Resource & {
  attributes?: Record<string, unknown> & {
    _policy_attribution?: Record<string, PolicyAttributionPayload>;
  };
};

export interface PolicySaturation {
  policyUuid: string;
  policyKind: 'project-cost' | 'customer-cost' | 'slurm-periodic';
  scopeName: string;
  scopeUuid: string;
  thresholdLabel: string;
  thresholdValue: number;
  currentValue: number;
  saturationPct: number;
  action: string;
  actionLabel: string;
  etaDays: number | null;
  etaDate: string | null;
  hasFired: boolean;
  firedDatetime: string | null;
  affectedResourcesCount: number;
}

export interface ResourceHealth {
  resource: ResourceWithAttribution;
  bucket: ResourceStatusBucket;
  saturationPct: number;
  /** True only when the resource has a SLURM usage policy or a limit-based
   *  quota to measure saturation against; false for cost-policy-only / usage-
   *  billed resources (where "% of policy threshold" would be a meaningless 0). */
  hasThreshold: boolean;
  matchedPolicy?: PolicySaturation;
  attribution?: PolicyAttributionPayload;
  attributionField?: 'paused' | 'downscaled';
  unblocksOn?: string;
}

export interface CreditRunway {
  credit: ProjectCredit | null;
  customerCredit: CustomerCredit | null;
  /** Credit that can actually be drawn: the allocation capped by the
   *  organization balance. Compensation stops once organization credit is
   *  exhausted, so `credit.value` alone overstates what is spendable. */
  spendableValue: number;
  /** True when the organization balance, not this allocation, is binding. */
  isLimitedByOrganizationCredit: boolean;
  burnPerDay: number;
  daysRemaining: number | null;
  exhaustionDate: string | null;
}

export interface PacingSnapshot {
  /** Reference monthly cap derived from the smallest active project cost policy
   *  (or the project credit value divided by 12 if no cost policy applies). */
  monthlyBudget: number | null;
  /** Gross cost charged this month (positive invoice items). */
  incurredCost: number;
  /** Absolute value of compensation items (negative invoice items credited
   *  against the customer/project credit). */
  compensationAmount: number;
  /** incurredCost − compensationAmount. Matches the value used by
   *  ProjectEstimatedCostPolicy.is_triggered (total − compensation). */
  netCost: number;
  /** Kept for backwards compatibility. Same as netCost. */
  spentThisMonth: number;
  /** Day-of-month / days-in-month. */
  periodFraction: number;
  /** netCost / monthlyBudget. */
  spendFraction: number | null;
  /** spendFraction − periodFraction. Positive = burning faster than pace. */
  paceDelta: number | null;
  /** Linear projection of end-of-month NET spend at current daily rate. */
  projectedMonthlyCost: number;
}

export interface CreditTerms {
  /** Current remaining balance. */
  value: number;
  /** Target monthly draw (FIXED) or recalculated target (LINEAR). */
  expectedConsumption: number;
  /** Effective monthly draw enforced even if real cost is lower. */
  minimalConsumption: number;
  /** FIXED | LINEAR — how expected_consumption is managed. */
  minimalConsumptionLogic: 'fixed' | 'linear' | string;
  /** Grace coefficient (0-100): discount on minimal consumption when end_date is not this month. */
  graceCoefficient: number;
  /** If false, minimal_consumption is 0 regardless of expected_consumption. */
  applyAsMinimalConsumption: boolean;
  /** Credit expiry date (must be 1st of month). */
  endDate: string | null;
  /** Days until expiry, or null if no end_date. */
  daysUntilEndDate: number | null;
  /** consumption_last_month, exposed for sanity-check displays. */
  consumptionLastMonth: number;
}

export interface CreditBreakdown {
  /** Initial grant plus every later change; equals used + lost + remaining
   *  regardless of top-ups or reductions. */
  granted: number;
  /** Credit consumed against real usage: Σ min(incurred, credit debited). */
  used: number;
  /** Credit forfeited to the minimal-consumption floor (and expiry): the
   *  Σ max(0, credit debited − incurred) shortfall. Hard to recover. */
  lost: number;
  /** Current remaining balance (ProjectCredit.value). */
  remaining: number;
}

export interface BreakdownBucket {
  /** Display label (offering or resource name). */
  label: string;
  /** Total cost in current period. */
  cost: number;
  /** True when this row is a negative invoice item credited against
   *  customer/project credit (matches the "Credit compensation." prefix or
   *  a non-positive item price). */
  isCompensation: boolean;
  /** Optional resource link details. */
  resourceUuid?: string;
}

export type PolicyWatchEventType =
  | 'credit-funded'
  | 'policy-notified'
  | 'policy-downscaled'
  | 'policy-paused'
  | 'policy-terminated'
  | 'policy-cleared'
  | 'today'
  | 'projected-policy'
  | 'projected-credit-exhaustion';

export interface PolicyWatchEvent {
  id: string;
  date: string;
  type: PolicyWatchEventType;
  title: string;
  subtitle?: string;
  resourceUuid?: string;
  resourceName?: string;
  policyUuid?: string;
  isFuture: boolean;
}

export interface PolicyWatchData {
  projectPolicies: ProjectEstimatedCostPolicy[];
  customerPolicies: CustomerEstimatedCostPolicy[];
  slurmPolicies: SlurmPeriodicUsagePolicy[];
  resources: ResourceWithAttribution[];
  slurmLogs: SlurmPolicyEvaluationLog[];
  runway: CreditRunway;
  pacing: PacingSnapshot;
  policies: PolicySaturation[];
  perResource: ResourceHealth[];
  events: PolicyWatchEvent[];
  invoices: InvoiceCost[];
  currentMonthItems: InvoiceCostItem[];
  breakdown: BreakdownBucket[];
  breakdownCharges: BreakdownBucket[];
  breakdownCompensations: BreakdownBucket[];
  creditTerms: CreditTerms | null;
  creditBreakdown: CreditBreakdown | null;
  isLoading: boolean;
  hasError: boolean;
}
