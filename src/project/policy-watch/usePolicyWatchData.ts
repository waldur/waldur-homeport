import { useQueries, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  creditTransactionsList,
  customerCreditsList,
  invoiceItemsCostsList,
  marketplaceCustomerEstimatedCostPoliciesList,
  marketplaceProjectEstimatedCostPoliciesList,
  marketplaceResourcesList,
  marketplaceSlurmPeriodicUsagePoliciesList,
  projectCreditsList,
  Resource,
  SlurmPeriodicUsagePolicy,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { getCostPolicyActionOptions } from '@/customer/cost-policies/utils';
import { translate } from '@/i18n';
import { Project } from '@/workspace/types';

import { buildCreditBreakdown } from './creditBreakdown';
import { buildCreditEvents } from './creditEvents';
import {
  CreditBreakdown,
  CreditRunway,
  CreditTerms,
  PacingSnapshot,
  PolicySaturation,
  PolicyWatchData,
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

// SLURM usage policies add two actions on top of the cost-policy set
// (SlurmPeriodicUsagePolicy.available_actions). Without them the matrix
// printed the raw key next to humanised labels for every other action.
const SLURM_ACTION_LABELS: Record<string, string> = {
  request_slurm_resource_downscaling: translate(
    'Request downscaling of SLURM allocations',
  ),
  request_slurm_resource_pausing: translate(
    'Request pausing of SLURM allocations',
  ),
};

const formatPolicyAction = (actions: string): string => {
  const list = (actions || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!list.length) return translate('No action');
  const options = getCostPolicyActionOptions();
  return list
    .map(
      (a) =>
        options.find((o) => o.value === a)?.label ||
        SLURM_ACTION_LABELS[a] ||
        a,
    )
    .join(', ');
};

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

  // The credit whose drawdown the lifecycle card describes: the project
  // allocation when there is one, otherwise the organization balance. Mirrors
  // the `projectCredit || customerCredit` choice the card itself makes.
  const ledgerCreditUuid = projectCreditQ.data
    ? null
    : customerCreditQ.data?.uuid || null;
  const ledgerProjectUuid = projectCreditQ.data ? projectUuid : null;

  const creditLedgerQ = useQuery({
    queryKey: [
      'policy-watch-credit-ledger',
      ledgerProjectUuid,
      ledgerCreditUuid,
    ],
    queryFn: () =>
      creditTransactionsList({
        query: {
          ...(ledgerProjectUuid
            ? { project_uuid: ledgerProjectUuid }
            : { credit_uuid: ledgerCreditUuid }),
          // A credit's whole history, not a page of it: the card states
          // lifetime totals, and a truncated ledger understates forfeiture
          // without saying so.
          page_size: 500,
        },
      }).then((r) => r.data || []),
    enabled: !!ledgerProjectUuid || !!ledgerCreditUuid,
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
            // The lifetime the pace and exhaustion columns extrapolate along.
            'created',
            'end_date',
            // The date the resource actually terminates: its own end date or the
            // project-driven one, grace period included.
            'resource_effective_end_date',
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

  // Retry every source behind the view at once, so the error state can offer a
  // single "try again" the way other widgets do.
  const refetch = useCallback(() => {
    projectPoliciesQ.refetch();
    customerPoliciesQ.refetch();
    projectCreditQ.refetch();
    customerCreditQ.refetch();
    invoicesQ.refetch();
    creditLedgerQ.refetch();
    resourcesQ.refetch();
    slurmPoliciesQueries.forEach((q) => q.refetch());
  }, [
    projectPoliciesQ,
    customerPoliciesQ,
    projectCreditQ,
    customerCreditQ,
    invoicesQ,
    creditLedgerQ,
    resourcesQ,
    slurmPoliciesQueries,
  ]);

  return useMemo<PolicyWatchData>(() => {
    const projectPolicies = projectPoliciesQ.data || [];
    const customerPolicies = customerPoliciesQ.data || [];
    const resources = resourcesQ.data || [];
    const projectCredit = projectCreditQ.data || null;
    const customerCredit = customerCreditQ.data || null;
    const invoices = invoicesQ.data || [];
    const creditLedger = creditLedgerQ.data || [];

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

    const policies: PolicySaturation[] = [];

    for (const p of projectPolicies) {
      // `current_cost` is the figure the policy itself compares against
      // limit_cost: the cost over its own period (1, 3 or 12 months), less the
      // credit already applied and the credit still to be drawn — the last of
      // which only the server can simulate. Prefer it over the price estimate,
      // which covers the current month only and knows nothing of the pending
      // draw. The fallback keeps older backends working.
      const currentTotal = safeNumber(
        p.current_cost ?? p.billing_price_estimate?.total,
      );
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
        p.current_cost ??
          (p as { billing_price_estimate?: { total?: string } })
            .billing_price_estimate?.total,
      );
      const sat = limit > 0 ? (currentTotal / limit) * 100 : 0;
      // Same projection as the project cost policy. Without it an organization
      // cap can only ever be reported after it fires, and it never reaches the
      // dated list of what happens next. The rate is this project's draw, so
      // the estimate is a ceiling: sibling projects spending against the same
      // cap bring the date closer, never further out.
      const remaining = limit - currentTotal;
      const etaDays =
        burnPerDay > 0 && remaining > 0
          ? Math.floor(remaining / burnPerDay)
          : remaining <= 0
            ? 0
            : null;
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
        etaDays,
        etaDate: etaDays !== null ? isoDate(addDays(today, etaDays)) : null,
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

    // Each end condition is kept whole, with what it does, rather than ranked
    // into one countdown: they are not the same kind of event. See
    // buildCreditEvents for the consequences each one carries.
    const events = buildCreditEvents(
      {
        balance: creditValue,
        spendableValue,
        isLimitedByOrganizationCredit,
        exhaustionDate,
        burnPerDay,
        creditEndDate: projectCredit?.end_date || null,
        project,
        resources,
        // Policies fire on an estimate, but the estimate still has to sort
        // against the dated events, so it is carried as a date too.
        policies: policies
          .filter((p) => !p.hasFired)
          .map((p) => ({
            actionLabel: p.actionLabel,
            etaDays: p.etaDays,
            kind: p.policyKind,
            scopeName: p.scopeName,
          })),
      },
      today,
    );

    const runway: CreditRunway = {
      credit: projectCredit,
      customerCredit,
      spendableValue,
      isLimitedByOrganizationCredit,
      burnPerDay,
      daysRemaining,
      exhaustionDate,
      events,
    };

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
      // Absolute figures alongside the percentage: "84% of quota" does not say
      // whether that is 84 core-hours or 84 000.
      let usedTotal = 0;
      let limitTotal = 0;
      if (sp) {
        const slurm = computeSlurmSaturation(r, sp);
        saturation = slurm.saturation;
        usedTotal = slurm.currentValue;
        limitTotal = slurm.thresholdValue;
      } else if (hasQuota) {
        limitTotal = Object.values(r.limits as Record<string, number>).reduce(
          (a, b) => a + b,
          0,
        );
        usedTotal = Object.values(
          r.limit_usage as Record<string, number>,
        ).reduce((a, b) => a + b, 0);
        saturation = limitTotal > 0 ? (usedTotal / limitTotal) * 100 : 0;
      }

      // Pace against the resource's own lifetime: where consumption should be
      // today if the quota were spread evenly from creation to end date, and
      // when it will run out at the rate observed so far. Both need an end
      // date; without one there is no line to extrapolate along.
      const createdAt = r.created ? new Date(r.created) : null;
      const endsAt = r.end_date ? new Date(r.end_date) : null;
      let idealPct: number | null = null;
      let projectedExhaustion: string | null = null;
      if (createdAt && endsAt && endsAt > createdAt) {
        const span = endsAt.getTime() - createdAt.getTime();
        const elapsed = today.getTime() - createdAt.getTime();
        idealPct = Math.min(Math.max((elapsed / span) * 100, 0), 100);

        const elapsedDays = Math.max(elapsed / DAY_MS, 1);
        const burnPerDay = usedTotal / elapsedDays;
        if (burnPerDay > 0 && limitTotal > usedTotal) {
          const daysLeft = (limitTotal - usedTotal) / burnPerDay;
          projectedExhaustion = addDays(today, daysLeft)
            .toISOString()
            .slice(0, 10);
        }
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
        usedTotal,
        limitTotal,
        endDate: r.end_date || null,
        idealPct,
        projectedExhaustion,
        hasThreshold,
        matchedPolicy,
        attribution,
        attributionField,
        unblocksOn: matchedPolicy?.etaDate || undefined,
      };
    });

    // The /api/invoice-items/costs/ endpoint exposes three top-level numbers
    // per month: `incurred` (gross), `compensation` (negative, credit already
    // applied) and `price` (net = incurred − |compensation|). `price` is the
    // same figure ProjectEstimatedCostPolicy.is_triggered calls `total`.
    //
    // The policy then subtracts the credit still to be drawn this month, which
    // only the backend can simulate (MonthlyCompensation). Until the monthly
    // compensation is written, the policy therefore evaluates a slightly lower
    // cost than shown here — saturation and ETAs read marginally early, never
    // late, which is the safe direction for a warning.
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
        }
      | undefined;
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
    // Read from the credit ledger, which records both ways a balance is drawn.
    // The invoice items record only one of them: the minimal-consumption floor
    // takes its shortfall straight off the balance and writes no item, so a
    // breakdown inferred from items could never show forfeiture at all.
    let creditBreakdown: CreditBreakdown | null = null;
    if (creditTerms) {
      creditBreakdown = buildCreditBreakdown(creditLedger, creditTerms.value);
    }

    const isLoading =
      projectPoliciesQ.isLoading ||
      customerPoliciesQ.isLoading ||
      resourcesQ.isLoading ||
      projectCreditQ.isLoading ||
      customerCreditQ.isLoading ||
      invoicesQ.isLoading ||
      creditLedgerQ.isLoading ||
      slurmPoliciesQueries.some((q) => q.isLoading);

    const hasError =
      !!projectPoliciesQ.error ||
      !!customerPoliciesQ.error ||
      !!resourcesQ.error ||
      !!projectCreditQ.error ||
      !!customerCreditQ.error ||
      !!invoicesQ.error ||
      !!creditLedgerQ.error;

    return {
      projectPolicies,
      customerPolicies,
      slurmPolicies,
      resources,
      runway,
      pacing,
      policies,
      perResource,
      invoices,
      creditTerms,
      creditBreakdown,
      isLoading,
      hasError,
      refetch,
    };
  }, [
    refetch,
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
    creditLedgerQ.data,
    creditLedgerQ.isLoading,
    creditLedgerQ.error,
    slurmPolicies,
    slurmPoliciesQueries,
  ]);
};
