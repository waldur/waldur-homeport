import type {
  CustomerCredit,
  CustomerEstimatedCostPolicy,
  InvoiceCost,
  ProjectCredit,
  ProjectEstimatedCostPolicy,
  Resource,
  SlurmPeriodicUsagePolicy,
} from 'waldur-js-client';

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
  /** Absolute consumption and cap behind saturationPct. */
  usedTotal: number;
  limitTotal: number;
  endDate: string | null;
  /** Where linear consumption would stand today, as a percentage of the cap.
   *  Null when the resource has no end date to extrapolate along. */
  idealPct: number | null;
  /** Date the cap runs out at the rate observed so far, if it will. */
  projectedExhaustion: string | null;
  /** True only when the resource has a SLURM usage policy or a limit-based
   *  quota to measure saturation against; false for cost-policy-only / usage-
   *  billed resources (where "% of policy threshold" would be a meaningless 0). */
  hasThreshold: boolean;
  matchedPolicy?: PolicySaturation;
  attribution?: PolicyAttributionPayload;
  attributionField?: 'paused' | 'downscaled';
  unblocksOn?: string;
}

/** The kinds of end condition a credit-funded project runs into. They are not
 *  comparable: a credit expiry confiscates unspent money while the resources
 *  keep running, a project end date stops the work without touching the money,
 *  and an empty balance stops neither — it only ends compensation. Each is
 *  therefore carried with its own consequence instead of being ranked into a
 *  single "time left" figure that then needs a caveat to be true. */
type CreditEventKind =
  | 'blocked'
  | 'exhaustion'
  | 'credit-expiry'
  | 'project-pause'
  | 'project-end'
  | 'resources-end'
  | 'policy';

export interface CreditEvent {
  kind: CreditEventKind;
  /** ISO date the event lands on; today or earlier when already in effect. */
  date: string;
  /** What happens, e.g. "Credit expires". */
  title: string;
  /** What it does to the money and to the resources. */
  consequence: string;
  tone: 'danger' | 'warning' | 'muted';
  /** The soonest event that actually stops something. Exactly one event is
   *  binding when any is; later ones stay for context. */
  isBinding: boolean;
  /** Shown instead of the calendar-derived relative label when the date is an
   *  estimate rather than a scheduled one — a policy ETA, for instance. */
  approximate?: boolean;
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
  /** Everything that ends, soonest first, each with its consequence. */
  events: CreditEvent[];
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
  /** Credit consumed against real usage: the ledger's `compensation` rows, net
   *  of any roll-back that reversed them. */
  used: number;
  /** Credit forfeited without buying anything: the ledger's `minimal_draw` and
   *  `expiry` rows. Hard to recover. */
  lost: number;
  /** Current remaining balance (ProjectCredit.value). */
  remaining: number;
}

export interface PolicyWatchData {
  projectPolicies: ProjectEstimatedCostPolicy[];
  customerPolicies: CustomerEstimatedCostPolicy[];
  slurmPolicies: SlurmPeriodicUsagePolicy[];
  resources: ResourceWithAttribution[];
  runway: CreditRunway;
  pacing: PacingSnapshot;
  policies: PolicySaturation[];
  perResource: ResourceHealth[];
  invoices: InvoiceCost[];
  creditTerms: CreditTerms | null;
  creditBreakdown: CreditBreakdown | null;
  isLoading: boolean;
  hasError: boolean;
  /** Retries every query behind the view. */
  refetch(): void;
}
