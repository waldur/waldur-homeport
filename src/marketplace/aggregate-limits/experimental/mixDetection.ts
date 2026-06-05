import { ComponentsUsageStatsPerOffering } from 'waldur-js-client';

export type ComponentRow =
  ComponentsUsageStatsPerOffering['components'][number];

// Five offering-mix scenarios — see prp_score_improvement_plan / chat analysis.
// Code A..E so per-view code can branch concisely; description is for UI text.
type MixCode = 'A' | 'B' | 'C' | 'D' | 'E';

export interface MixSummary {
  code: MixCode;
  // Short human label for badges (e.g. "Mixed billing & periods (E)").
  label: string;
  // One-sentence explanation suitable for a banner.
  description: string;
  hasUsageOnly: boolean;
  hasLimit: boolean;
  // Distinct (billing_type='limit') periods observed: 'month' | 'quarterly' | 'annual' | 'total'.
  limitPeriods: string[];
  // Distinct billing types observed.
  billingTypes: string[];
  // Distinct component types observed.
  componentTypes: string[];
  // Distinct offerings observed.
  offeringCount: number;
  // Component count by billing_type.
  usageComponentCount: number;
  limitComponentCount: number;
}

export function detectMix(rows: ComponentRow[] | undefined | null): MixSummary {
  const empty: MixSummary = {
    code: 'A',
    label: 'No data',
    description: 'No components reported for this scope.',
    hasUsageOnly: false,
    hasLimit: false,
    limitPeriods: [],
    billingTypes: [],
    componentTypes: [],
    offeringCount: 0,
    usageComponentCount: 0,
    limitComponentCount: 0,
  };
  if (!rows?.length) return empty;

  const billingTypes = new Set<string>();
  const limitPeriods = new Set<string>();
  const componentTypes = new Set<string>();
  const offeringUuids = new Set<string>();
  let usageCount = 0;
  let limitCount = 0;

  for (const r of rows) {
    billingTypes.add(r.billing_type);
    componentTypes.add(r.type);
    offeringUuids.add(r.offering_uuid);
    if (r.billing_type === 'limit') {
      limitCount += 1;
      // limit_period may be null for legacy rows; treat as 'unspecified'.
      limitPeriods.add((r as any).limit_period || 'unspecified');
    } else {
      usageCount += 1;
    }
  }

  const allUsage = billingTypes.size === 1 && billingTypes.has('usage');
  const allLimit = billingTypes.size === 1 && billingTypes.has('limit');
  const singlePeriod = limitPeriods.size <= 1;

  let code: MixCode;
  let label: string;
  let description: string;
  if (allUsage) {
    code = 'A';
    label = 'Usage-only (A)';
    description =
      'No limits reported on any offering — values are raw measurements; "% of limit" charts will show "% of dataset max" or be hidden.';
  } else if (allLimit && singlePeriod) {
    code = 'B';
    label = 'Limit-based · single period (B)';
    description = `Every component is limit-based and shares period "${[
      ...limitPeriods,
    ].join(', ')}" — % of limit comparisons are directly meaningful.`;
  } else if (allLimit) {
    code = 'C';
    label = 'Limit-based · mixed periods (C)';
    description = `All limit-based but periods differ (${[...limitPeriods].join(
      ' / ',
    )}). Within an offering, % of limit is fine; across offerings, the periods are not comparable.`;
  } else if (singlePeriod) {
    code = 'D';
    label = 'Mixed billing · single period (D)';
    description =
      'Some components are usage-based, others limit-based, but all limits share the same period. % of limit is shown only for limit components; usage components show raw values.';
  } else {
    code = 'E';
    label = 'Mixed billing & periods (E)';
    description = `Heaviest mix: usage and limit-based components, with limit periods ${[
      ...limitPeriods,
    ].join(
      ' / ',
    )}. Cross-offering comparisons are normalized per-period or restricted to within-offering.`;
  }

  return {
    code,
    label,
    description,
    hasUsageOnly: usageCount > 0,
    hasLimit: limitCount > 0,
    limitPeriods: [...limitPeriods],
    billingTypes: [...billingTypes],
    componentTypes: [...componentTypes],
    offeringCount: offeringUuids.size,
    usageComponentCount: usageCount,
    limitComponentCount: limitCount,
  };
}
