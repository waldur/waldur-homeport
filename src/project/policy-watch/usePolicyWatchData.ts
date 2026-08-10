import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  customerCreditsList,
  invoiceItemsCostsList,
  marketplaceCustomerEstimatedCostPoliciesList,
  marketplaceProjectEstimatedCostPoliciesList,
  marketplaceResourcesList,
  marketplaceSlurmPeriodicUsagePoliciesEvaluationLogsList,
  marketplaceSlurmPeriodicUsagePoliciesList,
  projectCreditsList,
  Resource,
  SlurmPeriodicUsagePolicy,
  SlurmPolicyEvaluationLog,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { getCostPolicyActionOptions } from '@/customer/cost-policies/utils';
import { translate } from '@/i18n';
import { POLICY_LABELS } from '@/marketplace/resources/details/ResourceFlags';
import { Project } from '@/workspace/types';

import {
  BreakdownBucket,
  CreditBreakdown,
  CreditRunway,
  CreditTerms,
  PacingSnapshot,
  PolicySaturation,
  PolicyWatchData,
  PolicyWatchEvent,
  ResourceHealth,
  ResourceStatusBucket,
  ResourceWithAttribution,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

const safeNumber = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const addDays = (start: Date, days: number): Date =>
  new Date(start.getTime() + days * DAY_MS);

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const tresWeights = (
  policy: SlurmPeriodicUsagePolicy,
): Record<string, number> => {
  const raw =
    (policy.tres_billing_weights as Record<string, number> | undefined) ?? null;
  if (raw && Object.keys(raw).length > 0) return raw;
  return { CPU: 0.015625, Mem: 0.001953125, 'GRES/gpu': 0.25 };
};

const weightedSum = (
  data: Record<string, number> | undefined,
  weights: Record<string, number>,
): number => {
  if (!data) return 0;
  let total = 0;
  for (const [key, value] of Object.entries(data)) {
    let w = weights[key];
    if (w === undefined) {
      const matched = Object.entries(weights).find(
        ([k]) => k.toLowerCase() === key.toLowerCase(),
      );
      w = matched?.[1];
    }
    if (typeof w === 'number') {
      total += value * w;
    } else {
      total += value;
    }
  }
  return total;
};

const findMatchingSlurmPolicy = (
  resource: Resource,
  slurmPolicies: SlurmPeriodicUsagePolicy[],
): SlurmPeriodicUsagePolicy | undefined =>
  slurmPolicies.find((p) => p.scope_uuid === resource.offering_uuid);

const computeSlurmSaturation = (
  resource: Resource,
  policy: SlurmPeriodicUsagePolicy,
): { saturation: number; thresholdValue: number; currentValue: number } => {
  const weights = tresWeights(policy);
  const allocScalar = weightedSum(resource.limits, weights);
  const usageScalar = weightedSum(
    resource.current_usages as Record<string, number> | undefined,
    weights,
  );
  if (allocScalar <= 0) {
    return { saturation: 0, thresholdValue: 0, currentValue: usageScalar };
  }
  return {
    saturation: (usageScalar / allocScalar) * 100,
    thresholdValue: allocScalar,
    currentValue: usageScalar,
  };
};

const bucketForResource = (
  resource: ResourceWithAttribution,
  saturation: number,
): ResourceStatusBucket => {
  if (resource.paused) return 'paused';
  if (resource.downscaled) return 'downscaled';
  if (saturation >= 100) return 'slowdown';
  if (saturation >= 80) return 'notification';
  return 'ok';
};

const formatPolicyAction = (actions: string): string => {
  const list = (actions || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!list.length) return translate('No action');
  const options = getCostPolicyActionOptions();
  return list
    .map((a) => options.find((o) => o.value === a)?.label || a)
    .join(', ');
};

const buildPolicyAttributionEvent = (
  resource: ResourceWithAttribution,
  field: 'paused' | 'downscaled',
): PolicyWatchEvent | null => {
  const attr = resource.attributes?._policy_attribution?.[field];
  if (!attr || !attr.timestamp) return null;
  const type = field === 'paused' ? 'policy-paused' : 'policy-downscaled';
  const policyTypeLabel = attr.policy_class
    ? POLICY_LABELS[attr.policy_class] || attr.policy_class
    : translate('Policy');
  return {
    id: `attribution-${resource.uuid}-${field}`,
    date: attr.timestamp,
    type,
    title:
      field === 'paused'
        ? translate('Resource paused')
        : translate('Resource downscaled'),
    subtitle: `${policyTypeLabel}${attr.scope_name ? ` — ${attr.scope_name}` : ''}`,
    resourceUuid: resource.uuid,
    resourceName: resource.name,
    policyUuid: attr.policy_uuid,
    isFuture: false,
  };
};

const sortByDate = (a: PolicyWatchEvent, b: PolicyWatchEvent) =>
  a.date.localeCompare(b.date);

export const usePolicyWatchData = (project: Project): PolicyWatchData => {
  const projectUuid = project?.uuid;
  const customerUuid = project?.customer_uuid;

  const projectPoliciesQ = useQuery({
    queryKey: ['policy-watch-project-policies', projectUuid],
    queryFn: () =>
      marketplaceProjectEstimatedCostPoliciesList({
        query: { scope_uuid: projectUuid, page_size: 100 },
      }).then((r) => r.data || []),
    enabled: !!projectUuid,
    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const customerPoliciesQ = useQuery({
    queryKey: ['policy-watch-customer-policies', customerUuid],
    queryFn: () =>
      marketplaceCustomerEstimatedCostPoliciesList({
        query: { scope_uuid: customerUuid, page_size: 100 },
      }).then((r) => r.data || []),
    enabled: !!customerUuid,
    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const projectCreditQ = useQuery({
    queryKey: ['policy-watch-project-credit', projectUuid],
    queryFn: () =>
      projectCreditsList({
        query: { project_uuid: projectUuid },
      }).then((r) => (r.data && r.data.length > 0 ? r.data[0] : null)),
    enabled: !!projectUuid,
    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const customerCreditQ = useQuery({
    queryKey: ['policy-watch-customer-credit', customerUuid],
    queryFn: () =>
      customerCreditsList({
        query: { customer_uuid: customerUuid },
      }).then((r) => (r.data && r.data.length > 0 ? r.data[0] : null)),
    enabled: !!customerUuid,
    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const invoicesQ = useQuery({
    queryKey: ['policy-watch-invoices', projectUuid],
    queryFn: () =>
      invoiceItemsCostsList({
        query: { project_uuid: projectUuid, page: 1, page_size: 12 },
      }).then((r) => r.data || []),
    enabled: !!projectUuid,
    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const resourcesQ = useQuery({
    queryKey: ['policy-watch-resources', projectUuid],
    queryFn: () =>
      marketplaceResourcesList({
        query: {
          project_uuid: projectUuid,
          page_size: 200,
          field: [
            'uuid',
            'name',
            'paused',
            'downscaled',
            'attributes',
            'offering_uuid',
            'offering_name',
            'offering_type',
            'offering_plugin_options',
            'current_usages',
            'limit_usage',
            'limits',
            'state',
            'project',
            'project_uuid',
            'customer_uuid',
            'is_usage_based',
            'is_limit_based',
          ],
        },
      }).then((r) => (r.data || []) as ResourceWithAttribution[]),
    enabled: !!projectUuid,
    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const offeringUuids = useMemo(() => {
    const r = resourcesQ.data || [];
    return Array.from(
      new Set(r.map((x) => x.offering_uuid).filter((x): x is string => !!x)),
    );
  }, [resourcesQ.data]);

  const slurmPoliciesQueries = useQueries({
    queries: offeringUuids.map((offUuid) => ({
      queryKey: ['policy-watch-slurm-policy', offUuid],
      queryFn: () =>
        marketplaceSlurmPeriodicUsagePoliciesList({
          query: { scope_uuid: offUuid, page_size: 50 },
        }).then((r) => r.data || []),
      staleTime: SHORT_STALE_TIME,
      refetchOnWindowFocus: false,
    })),
  });

  const slurmPolicies: SlurmPeriodicUsagePolicy[] = useMemo(
    () => slurmPoliciesQueries.flatMap((q) => q.data || []),
    [slurmPoliciesQueries],
  );

  const slurmPolicyUuids = useMemo(
    () => slurmPolicies.map((p) => p.uuid),
    [slurmPolicies],
  );

  const slurmLogQueries = useQueries({
    queries: slurmPolicyUuids.map((policyUuid) => ({
      queryKey: ['policy-watch-slurm-logs', policyUuid],
      queryFn: () =>
        marketplaceSlurmPeriodicUsagePoliciesEvaluationLogsList({
          path: { uuid: policyUuid },
          query: { page_size: 50 },
        }).then((r) => r.data || []),
      staleTime: SHORT_STALE_TIME,
      refetchOnWindowFocus: false,
    })),
  });

  const slurmLogs: SlurmPolicyEvaluationLog[] = useMemo(
    () => slurmLogQueries.flatMap((q) => q.data || []),
    [slurmLogQueries],
  );

  return useMemo<PolicyWatchData>(() => {
    const projectPolicies = projectPoliciesQ.data || [];
    const customerPolicies = customerPoliciesQ.data || [];
    const resources = resourcesQ.data || [];
    const projectCredit = projectCreditQ.data || null;
    const customerCredit = customerCreditQ.data || null;
    const invoices = invoicesQ.data || [];

    const today = new Date();

    const monthlyBurn = safeNumber(projectCredit?.consumption_last_month);
    const burnPerDay = monthlyBurn / 30;
    // The allocation. It stays the headline balance so this card agrees with
    // the credit lifecycle beside it, the timeline, and the burn-down chart,
    // all of which are denominated in the allocation.
    const creditValue = safeNumber(projectCredit?.value);
    // What can actually be drawn: the allocation capped by the organization
    // balance, since compensation stops once that reaches zero.
    const spendableValue = safeNumber(projectCredit?.spendable_value);
    // Read the flag rather than inferring it from a zero spendable value — an
    // unfunded allocation and an organization-capped one both report zero, and
    // only the latter is worth alarming about.
    const isLimitedByOrganizationCredit = Boolean(
      projectCredit?.is_limited_by_organization_credit,
    );
    // Runway measures what is left to draw, so a zero spendable balance is
    // zero days, not "unknown". Only an unknown burn rate yields null.
    const daysRemaining =
      burnPerDay > 0
        ? Math.floor(Math.max(0, spendableValue) / burnPerDay)
        : null;
    const exhaustionDate =
      daysRemaining !== null ? isoDate(addDays(today, daysRemaining)) : null;

    const runway: CreditRunway = {
      credit: projectCredit,
      customerCredit,
      spendableValue,
      isLimitedByOrganizationCredit,
      burnPerDay,
      daysRemaining,
      exhaustionDate,
    };

    const policies: PolicySaturation[] = [];

    for (const p of projectPolicies) {
      // billing_price_estimate.total already nets credit: PriceEstimate sums
      // every invoice item for the month and compensations are items with a
      // negative unit_price. Do not subtract compensation again here — when
      // the estimate looks un-netted it is stale, which is a backend concern.
      const currentTotal = safeNumber(p.billing_price_estimate?.total);
      const limit = safeNumber(p.limit_cost);
      const sat = limit > 0 ? (currentTotal / limit) * 100 : 0;
      const remaining = limit - currentTotal;
      const dailyCostBurn = burnPerDay;
      const etaDays =
        dailyCostBurn > 0 && remaining > 0
          ? Math.floor(remaining / dailyCostBurn)
          : remaining <= 0
            ? 0
            : null;
      const etaDate =
        etaDays !== null ? isoDate(addDays(today, etaDays)) : null;
      policies.push({
        policyUuid: p.uuid,
        policyKind: 'project-cost',
        scopeName: p.scope_name,
        scopeUuid: p.scope_uuid,
        thresholdLabel: translate('Project cost cap'),
        thresholdValue: limit,
        currentValue: currentTotal,
        saturationPct: sat,
        action: p.actions,
        actionLabel: formatPolicyAction(p.actions),
        etaDays,
        etaDate,
        hasFired: p.has_fired,
        firedDatetime: p.fired_datetime || null,
        affectedResourcesCount: p.affected_resources_count || 0,
      });
    }

    for (const p of customerPolicies) {
      const limit = safeNumber(p.limit_cost);
      const currentTotal = safeNumber(
        (p as { billing_price_estimate?: { total?: string } })
          .billing_price_estimate?.total,
      );
      const sat = limit > 0 ? (currentTotal / limit) * 100 : 0;
      policies.push({
        policyUuid: p.uuid,
        policyKind: 'customer-cost',
        scopeName: p.scope_name,
        scopeUuid: p.scope_uuid,
        thresholdLabel: translate('Organization cost cap'),
        thresholdValue: limit,
        currentValue: currentTotal,
        saturationPct: sat,
        action: p.actions,
        actionLabel: formatPolicyAction(p.actions),
        etaDays: null,
        etaDate: null,
        hasFired: p.has_fired,
        firedDatetime: p.fired_datetime || null,
        affectedResourcesCount: p.affected_resources_count || 0,
      });
    }

    for (const sp of slurmPolicies) {
      const matchingResources = resources.filter(
        (r) => r.offering_uuid === sp.scope_uuid,
      );
      if (matchingResources.length === 0) continue;
      let maxSat = 0;
      let totalAlloc = 0;
      let totalUsage = 0;
      for (const r of matchingResources) {
        const { saturation, thresholdValue, currentValue } =
          computeSlurmSaturation(r, sp);
        if (saturation > maxSat) maxSat = saturation;
        totalAlloc += thresholdValue;
        totalUsage += currentValue;
      }
      const remaining = totalAlloc - totalUsage;
      const dailyUsageRate = totalUsage / 30;
      const etaDays =
        dailyUsageRate > 0 && remaining > 0
          ? Math.floor(remaining / dailyUsageRate)
          : remaining <= 0
            ? 0
            : null;
      const etaDate =
        etaDays !== null ? isoDate(addDays(today, etaDays)) : null;
      policies.push({
        policyUuid: sp.uuid,
        policyKind: 'slurm-periodic',
        scopeName: sp.scope_name,
        scopeUuid: sp.scope_uuid,
        thresholdLabel: translate('SLURM usage cap'),
        thresholdValue: totalAlloc,
        currentValue: totalUsage,
        saturationPct: maxSat,
        action: sp.actions,
        actionLabel: formatPolicyAction(sp.actions),
        etaDays,
        etaDate,
        hasFired: sp.has_fired,
        firedDatetime: sp.fired_datetime || null,
        affectedResourcesCount: sp.affected_resources_count || 0,
      });
    }

    const perResource: ResourceHealth[] = resources.map((r) => {
      const sp = findMatchingSlurmPolicy(r, slurmPolicies);
      // A real limit-based quota needs actual limit AND usage entries — not just
      // a truthy (possibly empty {}) object, which every resource carries.
      const quotaKeys = r.limits
        ? Object.keys(r.limits as Record<string, number>).length
        : 0;
      const usageKeys = r.limit_usage
        ? Object.keys(r.limit_usage as Record<string, number>).length
        : 0;
      const hasQuota = quotaKeys > 0 && usageKeys > 0;
      let saturation = 0;
      if (sp) {
        saturation = computeSlurmSaturation(r, sp).saturation;
      } else if (hasQuota) {
        const allocSum = Object.values(
          r.limits as Record<string, number>,
        ).reduce((a, b) => a + b, 0);
        const usageSum = Object.values(
          r.limit_usage as Record<string, number>,
        ).reduce((a, b) => a + b, 0);
        saturation = allocSum > 0 ? (usageSum / allocSum) * 100 : 0;
      }
      // "% of policy threshold" is only meaningful with a SLURM usage policy or
      // a limit-based quota; cost-policy-only / usage-billed resources have none.
      const hasThreshold = Boolean(sp) || hasQuota;
      const bucket = bucketForResource(r, saturation);

      const attribution =
        r.attributes?._policy_attribution?.paused ||
        r.attributes?._policy_attribution?.downscaled;
      let attributionField: 'paused' | 'downscaled' | undefined;
      if (r.attributes?._policy_attribution?.paused)
        attributionField = 'paused';
      else if (r.attributes?._policy_attribution?.downscaled)
        attributionField = 'downscaled';

      const matchedPolicy =
        sp &&
        policies.find(
          (p) => p.policyKind === 'slurm-periodic' && p.policyUuid === sp.uuid,
        );

      return {
        resource: r,
        bucket,
        saturationPct: saturation,
        hasThreshold,
        matchedPolicy,
        attribution,
        attributionField,
        unblocksOn: matchedPolicy?.etaDate || undefined,
      };
    });

    const events: PolicyWatchEvent[] = [];

    if (customerCredit?.value) {
      events.push({
        id: `credit-${customerCredit.uuid}`,
        date: customerCredit.end_date || isoDate(today),
        type: 'credit-funded',
        title: translate('Organization credit active'),
        subtitle: `${customerCredit.value} — ${customerCredit.allocated_to_projects} ${translate('allocated to projects')}`,
        isFuture: false,
      });
    }

    if (projectCredit?.value) {
      events.push({
        id: `project-credit-${projectCredit.uuid}`,
        date: isoDate(today),
        type: 'credit-funded',
        title: translate('Project credit'),
        subtitle: `${projectCredit.value} ${translate('available')}, ${projectCredit.consumption_last_month} ${translate('spent last month')}`,
        isFuture: false,
      });
    }

    for (const r of resources) {
      const pausedEvent = buildPolicyAttributionEvent(r, 'paused');
      if (pausedEvent) events.push(pausedEvent);
      const downEvent = buildPolicyAttributionEvent(r, 'downscaled');
      if (downEvent) events.push(downEvent);
    }

    for (const policy of [...projectPolicies, ...customerPolicies]) {
      if (policy.has_fired && policy.fired_datetime) {
        events.push({
          id: `policy-fired-${policy.uuid}`,
          date: policy.fired_datetime,
          type: 'policy-notified',
          title: translate('Cost policy fired'),
          subtitle: `${policy.scope_name} — ${formatPolicyAction(policy.actions)}`,
          policyUuid: policy.uuid,
          isFuture: false,
        });
      }
    }

    for (const sp of slurmPolicies) {
      if (sp.has_fired && sp.fired_datetime) {
        events.push({
          id: `slurm-fired-${sp.uuid}`,
          date: sp.fired_datetime,
          type: 'policy-paused',
          title: translate('SLURM policy fired'),
          subtitle: `${sp.scope_name} — ${formatPolicyAction(sp.actions)}`,
          policyUuid: sp.uuid,
          isFuture: false,
        });
      }
    }

    for (const log of slurmLogs.slice(0, 30)) {
      const actions = log.actions_taken || [];
      if (actions.length === 0) continue;
      events.push({
        id: `slurm-eval-${log.uuid}`,
        date: log.evaluated_at,
        type: actions.includes('pause') ? 'policy-paused' : 'policy-downscaled',
        title: translate('SLURM evaluation: {action}', {
          action: actions.join(', '),
        }),
        subtitle: `${log.resource_name} — ${log.usage_percentage.toFixed(1)}% ${translate('usage')}`,
        resourceUuid: log.resource_uuid,
        resourceName: log.resource_name,
        isFuture: false,
      });
    }

    events.push({
      id: 'today-marker',
      date: isoDate(today),
      type: 'today',
      title: translate('Today'),
      isFuture: false,
    });

    if (exhaustionDate && daysRemaining !== null && daysRemaining > 0) {
      events.push({
        id: 'projected-credit-exhaustion',
        date: exhaustionDate,
        type: 'projected-credit-exhaustion',
        title: translate('Projected credit exhaustion'),
        subtitle: translate('At current burn of {burn}/day, in ~{days} days', {
          burn: burnPerDay.toFixed(2),
          days: daysRemaining,
        }),
        isFuture: true,
      });
    }

    for (const ps of policies) {
      if (!ps.hasFired && ps.etaDays !== null && ps.etaDate && ps.etaDays > 0) {
        events.push({
          id: `projected-${ps.policyUuid}`,
          date: ps.etaDate,
          type: 'projected-policy',
          title: translate('{label} threshold projected', {
            label: ps.thresholdLabel,
          }),
          subtitle: `${ps.scopeName} — ${ps.actionLabel} (~${ps.etaDays}d)`,
          policyUuid: ps.policyUuid,
          isFuture: true,
        });
      }
    }

    events.sort(sortByDate);

    // The /api/invoice-items/costs/ endpoint exposes three top-level numbers
    // per month: `incurred` (gross), `compensation` (negative, credit applied)
    // and `price` (net = incurred − |compensation|). These match
    // ProjectEstimatedCostPolicy.is_triggered's `total − compensation` check.
    // The SDK type omits incurred/compensation; we read them as untyped fields.
    const currentInvoice = invoices.find(
      (inv) =>
        inv.year === today.getFullYear() && inv.month === today.getMonth() + 1,
    ) as
      | {
          price?: number | string;
          incurred?: number | string;
          compensation?: number | string;
          year: number;
          month: number;
          items?: (typeof invoices)[number]['items'];
        }
      | undefined;
    const currentMonthItems = currentInvoice?.items || [];

    const incurredCost = safeNumber(currentInvoice?.incurred);
    const compensationAmount = Math.abs(
      safeNumber(currentInvoice?.compensation),
    );
    const netCost = Math.max(0, safeNumber(currentInvoice?.price));

    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate();
    const dayOfMonth = today.getDate();
    const periodFraction = dayOfMonth / daysInMonth;

    // Smallest active monthly project cost policy gives the effective monthly cap.
    const monthlyProjectPolicies = projectPolicies.filter(
      (p) => p.period === 2,
    );
    const monthlyBudget =
      monthlyProjectPolicies.length > 0
        ? Math.min(
            ...monthlyProjectPolicies.map((p) => safeNumber(p.limit_cost)),
          )
        : creditValue > 0
          ? creditValue / 12
          : null;

    const spendFraction =
      monthlyBudget && monthlyBudget > 0 ? netCost / monthlyBudget : null;
    const paceDelta =
      spendFraction !== null ? spendFraction - periodFraction : null;
    const projectedMonthlyCost =
      periodFraction > 0 ? netCost / periodFraction : 0;

    const pacing: PacingSnapshot = {
      monthlyBudget,
      incurredCost,
      compensationAmount,
      netCost,
      spentThisMonth: netCost,
      periodFraction,
      spendFraction,
      paceDelta,
      projectedMonthlyCost,
    };

    // The /api/invoice-items/costs/ items list only contains positive line
    // items (unit_price > 0 in views.py:_get_current_month_items). Per-item
    // compensation rows are not exposed individually — only as the top-level
    // `compensation` total. So the breakdown shows charges only; the header
    // surfaces the compensation total.
    const breakdownMap = new Map<string, BreakdownBucket>();
    for (const item of currentMonthItems) {
      const label = item.name || translate('Uncategorized');
      const cost = safeNumber(item.price);
      const existing = breakdownMap.get(label);
      if (existing) {
        existing.cost += cost;
      } else {
        breakdownMap.set(label, { label, cost, isCompensation: false });
      }
    }
    const breakdown: BreakdownBucket[] = Array.from(breakdownMap.values()).sort(
      (a, b) => b.cost - a.cost,
    );
    const breakdownCharges = breakdown;
    const breakdownCompensations: BreakdownBucket[] = [];

    // --- Credit terms snapshot for HealthView
    let creditTerms: CreditTerms | null = null;
    const creditSource = projectCredit || customerCredit;
    if (creditSource) {
      const endDate = creditSource.end_date || null;
      const daysUntilEndDate = endDate
        ? Math.max(
            0,
            Math.floor(
              (new Date(endDate).getTime() - today.getTime()) / DAY_MS,
            ),
          )
        : null;
      creditTerms = {
        value: safeNumber(creditSource.value),
        expectedConsumption: safeNumber(creditSource.expected_consumption),
        minimalConsumption: safeNumber(creditSource.minimal_consumption),
        minimalConsumptionLogic:
          creditSource.minimal_consumption_logic || 'fixed',
        graceCoefficient: safeNumber(creditSource.grace_coefficient),
        applyAsMinimalConsumption:
          creditSource.apply_as_minimal_consumption !== false,
        endDate,
        daysUntilEndDate,
        consumptionLastMonth: safeNumber(creditSource.consumption_last_month),
      };
    }

    // --- Credit lifecycle breakdown: used + lost + remaining = granted.
    // Reconstructed from the monthly costs series without a new endpoint. Each
    // month's credit debited is |compensation|; the part matching real usage is
    // "used", and the floor-draw shortfall (debited beyond incurred) is "lost"
    // and hard to recover. Remaining is the current balance, so the three parts
    // always reconcile to the granted total no matter the changes made.
    let creditBreakdown: CreditBreakdown | null = null;
    if (creditTerms) {
      let used = 0;
      let lost = 0;
      for (const inv of invoices as Array<{
        incurred?: number | string;
        compensation?: number | string;
      }>) {
        const incurred = safeNumber(inv.incurred);
        const debited = Math.abs(safeNumber(inv.compensation));
        used += Math.min(incurred, debited);
        lost += Math.max(0, debited - incurred);
      }
      const remaining = creditTerms.value;
      creditBreakdown = {
        used,
        lost,
        remaining,
        granted: used + lost + remaining,
      };
    }

    const isLoading =
      projectPoliciesQ.isLoading ||
      customerPoliciesQ.isLoading ||
      resourcesQ.isLoading ||
      projectCreditQ.isLoading ||
      customerCreditQ.isLoading ||
      invoicesQ.isLoading ||
      slurmPoliciesQueries.some((q) => q.isLoading) ||
      slurmLogQueries.some((q) => q.isLoading);

    const hasError =
      !!projectPoliciesQ.error ||
      !!customerPoliciesQ.error ||
      !!resourcesQ.error ||
      !!projectCreditQ.error ||
      !!customerCreditQ.error ||
      !!invoicesQ.error;

    return {
      projectPolicies,
      customerPolicies,
      slurmPolicies,
      resources,
      slurmLogs,
      runway,
      pacing,
      policies,
      perResource,
      events,
      invoices,
      currentMonthItems,
      breakdown,
      breakdownCharges,
      breakdownCompensations,
      creditTerms,
      creditBreakdown,
      isLoading,
      hasError,
    };
  }, [
    projectPoliciesQ.data,
    projectPoliciesQ.isLoading,
    projectPoliciesQ.error,
    customerPoliciesQ.data,
    customerPoliciesQ.isLoading,
    customerPoliciesQ.error,
    resourcesQ.data,
    resourcesQ.isLoading,
    resourcesQ.error,
    projectCreditQ.data,
    projectCreditQ.isLoading,
    projectCreditQ.error,
    customerCreditQ.data,
    customerCreditQ.isLoading,
    customerCreditQ.error,
    invoicesQ.data,
    invoicesQ.isLoading,
    invoicesQ.error,
    slurmPolicies,
    slurmLogs,
    slurmPoliciesQueries,
    slurmLogQueries,
  ]);
};
