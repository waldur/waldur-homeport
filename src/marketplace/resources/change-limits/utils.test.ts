import { DateTime } from 'luxon';
import { describe, it, expect, vi } from 'vitest';
import {
  marketplaceResourcesRetrieve,
  marketplaceResourcesOfferingRetrieve,
  marketplacePublicOfferingsPlansRetrieve,
  projectsRetrieve,
} from 'waldur-js-client';

import {
  getLimitChangeData,
  loadData,
} from '@/marketplace/resources/change-limits/utils';

import * as fixtures from './fixtures';

describe('Change resource limits', () => {
  it('returns correct data', () => {
    const actual = getLimitChangeData(
      fixtures.plan,
      fixtures.offering,
      fixtures.newLimits,
      fixtures.currentLimits,
      fixtures.usages,
      fixtures.orderCanBeApproved,
    );

    // Float-tolerant deep compare against the fixture — toEqual is too strict
    // for accumulated multiplications (we round to 6 sig figs).
    const round6 = (v: unknown): unknown => {
      if (typeof v === 'number') return Number(v.toPrecision(6));
      if (Array.isArray(v)) return v.map(round6);
      if (v && typeof v === 'object') {
        return Object.fromEntries(
          Object.entries(v as Record<string, unknown>).map(([k, vv]) => [
            k,
            round6(vv),
          ]),
        );
      }
      return v;
    };

    expect(round6(actual)).toEqual(round6(fixtures.resultData));
  });

  it('loadData fetches all required data', async () => {
    vi.mocked(marketplaceResourcesRetrieve).mockResolvedValue({
      data: {
        uuid: 'res-uuid',
        offering_uuid: 'offering-uuid',
        plan_uuid: 'plan-uuid',
        project_uuid: 'project-uuid',
        limits: {},
      },
    } as any);
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: { uuid: 'offering-uuid', type: 'test-type', components: [] },
    } as any);
    vi.mocked(marketplacePublicOfferingsPlansRetrieve).mockResolvedValue({
      data: { uuid: 'plan-uuid', name: 'Test Plan', prices: {} },
    } as any);
    vi.mocked(projectsRetrieve).mockResolvedValue({
      data: {
        uuid: 'project-uuid',
        customer_display_billing_info_in_projects: true,
      },
    } as any);

    const data = await loadData('res-uuid');
    expect(data.resource.uuid).toBe('res-uuid');
    expect(data.plan.name).toBe('Test Plan');
    expect(data.concealBillingInfo).toBe(false);
  });

  it('loadData handles project fetch failure gracefully', async () => {
    vi.mocked(marketplaceResourcesRetrieve).mockResolvedValue({
      data: {
        uuid: 'res-uuid',
        offering_uuid: 'offering-uuid',
        plan_uuid: 'plan-uuid',
        project_uuid: 'project-uuid',
        limits: {},
      },
    } as any);
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: { uuid: 'offering-uuid', type: 'test-type', components: [] },
    } as any);
    vi.mocked(marketplacePublicOfferingsPlansRetrieve).mockResolvedValue({
      data: { uuid: 'plan-uuid', name: 'Test Plan', prices: {} },
    } as any);
    vi.mocked(projectsRetrieve).mockRejectedValue(new Error('Fetch failed'));

    const data = await loadData('res-uuid');
    expect(data.concealBillingInfo).toBe(false);
  });

  it('getRemainingMonths calculates months correctly', async () => {
    const { getRemainingMonths } = await import('./utils');
    // Luxon, like the function under test, clamps to the last day of a
    // shorter month; Date.setMonth overflows into the next one instead, so
    // on the 31st it asked for three months *and a day* and the ceiling in
    // getRemainingMonths correctly answered 4.
    const futureDate = DateTime.now().plus({ months: 3 });
    expect(getRemainingMonths(futureDate.toISO())).toBe(3);

    const pastDate = DateTime.now().minus({ months: 1 });
    expect(getRemainingMonths(pastDate.toISO())).toBe(0);
  });

  it('getLimitChangeRequirements extracts correct data', async () => {
    const { getLimitChangeRequirements } = await import('./utils');
    const resource = {
      current_usages: { cores: 5 },
      limits: { cores: 10, ram: 20 },
    } as any;
    const offering = {
      type: 'test-type',
      components: [
        { type: 'cores', billing_type: 'limit', name: 'Cores' },
        { type: 'ram', billing_type: 'limit', name: 'RAM' },
      ],
    } as any;

    const requirements = getLimitChangeRequirements(resource, offering);
    expect(requirements.usages).toEqual({ cores: 5 });
    expect(requirements.limits).toEqual({ cores: 10, ram: 20 });
    expect(requirements.offeringLimits).toBeDefined();
  });

  it('loadData falls back to offering plans if plan retrieval fails', async () => {
    vi.mocked(marketplaceResourcesRetrieve).mockResolvedValue({
      data: {
        uuid: 'res-uuid',
        offering_uuid: 'offering-uuid',
        plan_uuid: 'plan-uuid',
        limits: {},
      },
    } as any);
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: {
        uuid: 'offering-uuid',
        type: 'test-type',
        components: [],
        plans: [{ uuid: 'plan-uuid', name: 'Fallback Plan', prices: {} }],
      },
    } as any);
    vi.mocked(marketplacePublicOfferingsPlansRetrieve).mockRejectedValue(
      new Error('404'),
    );

    const data = await loadData('res-uuid');
    expect(data.plan.name).toBe('Fallback Plan');
  });

  it('getLimitChangeData handles prepaid components', () => {
    const prepaidOffering = {
      ...fixtures.offering,
      components: [
        {
          type: 'cores',
          billing_type: 'limit',
          name: 'Cores',
          is_prepaid: true,
        },
      ],
    };
    const plan = { ...fixtures.plan, unit: 'month' };
    const endDate = '2026-12-31'; // Future date

    const data = getLimitChangeData(
      plan,
      prepaidOffering,
      { cores: 10 },
      { cores: 5 },
      { cores: 0 },
      true,
      false,
      endDate,
    );

    expect(data.components[0].chargeMode).toBe('prepaid');
    expect(data.components[0].priceSuffix).toContain('remaining');
    expect(data.periodTotals[0].chargeMode).toBe('prepaid');
  });

  it('getLimitChangeData renders one-time price for total limit_period', () => {
    const totalLimitOffering = {
      ...fixtures.offering,
      components: [
        {
          type: 'gpu_hours',
          billing_type: 'limit',
          name: 'GPU hours',
          measured_unit: 'h',
          is_boolean: false,
          limit_period: 'total',
        },
      ],
    };
    const plan = { prices: { gpu_hours: 0.5 }, unit: 'month' };

    const data = getLimitChangeData(
      plan,
      totalLimitOffering,
      { gpu_hours: 100 },
      { gpu_hours: 40 },
      { gpu_hours: 0 },
      true,
    );

    expect(data.components).toHaveLength(1);
    const row = data.components[0];
    expect(row.chargeMode).toBe('total');
    expect(row.priceSuffix).toContain('one-time');
    // 100 × 0.5 — one-time, NOT multiplied by 30 or 365
    expect(row.price).toBeCloseTo(50);
    // Only the delta is charged on a TOTAL-period limit change: (100-40) × 0.5
    expect(row.changedPrice).toBeCloseTo(30);
    expect(data.periodTotals).toHaveLength(1);
    expect(data.periodTotals[0].label).toBe('One-time total');
  });

  it('getLimitChangeData groups totals by limit_period for mixed offerings', () => {
    const mixedOffering = {
      ...fixtures.offering,
      components: [
        {
          type: 'gpu_hours',
          billing_type: 'limit',
          name: 'GPU hours',
          measured_unit: 'h',
          is_boolean: false,
          limit_period: 'total',
        },
        {
          type: 'storage',
          billing_type: 'limit',
          name: 'Storage',
          measured_unit: 'GB',
          is_boolean: false,
          limit_period: 'month',
        },
      ],
    };
    const plan = {
      prices: { gpu_hours: 0.5, storage: 1 },
      unit: 'month',
    };

    const data = getLimitChangeData(
      plan,
      mixedOffering,
      { gpu_hours: 100, storage: 10 },
      { gpu_hours: 40, storage: 5 },
      { gpu_hours: 0, storage: 0 },
      true,
    );

    expect(data.periodTotals).toHaveLength(2);
    const modes = data.periodTotals.map((r) => r.chargeMode).sort();
    expect(modes).toEqual(['month', 'total']);
  });

  it('getLimitChangeData annualizes monthly and quarterly prices', () => {
    const offering = {
      ...fixtures.offering,
      components: [
        {
          type: 'cpu',
          billing_type: 'limit',
          name: 'CPU',
          measured_unit: 'cores',
          is_boolean: false,
          limit_period: 'month',
        },
        {
          type: 'gpu',
          billing_type: 'limit',
          name: 'GPU',
          measured_unit: 'h',
          is_boolean: false,
          limit_period: 'quarterly',
        },
        {
          type: 'storage',
          billing_type: 'limit',
          name: 'Storage',
          measured_unit: 'GB',
          is_boolean: false,
          limit_period: 'annual',
        },
        {
          type: 'extras',
          billing_type: 'limit',
          name: 'Extras',
          measured_unit: 'u',
          is_boolean: false,
          limit_period: 'total',
        },
      ],
    };
    const plan = {
      prices: { cpu: 1, gpu: 2, storage: 3, extras: 4 },
      unit: 'month',
    };

    const data = getLimitChangeData(
      plan,
      offering,
      { cpu: 10, gpu: 5, storage: 7, extras: 9 },
      { cpu: 0, gpu: 0, storage: 0, extras: 0 },
      { cpu: 0, gpu: 0, storage: 0, extras: 0 },
      true,
    );

    const byType = Object.fromEntries(data.components.map((r) => [r.type, r]));

    // Each component shows a single period-aware price with a matching suffix —
    // no /day · /30 days · /365 days breakdown (the change view bills the limit
    // for the relevant period, not per usage).
    expect(byType.cpu.price).toBeCloseTo(10); // 10 /mo
    expect(byType.cpu.priceSuffix).toBe(' /mo');
    expect(byType.gpu.price).toBeCloseTo(30); // 5 × 2 × 3 /quarter
    expect(byType.gpu.priceSuffix).toBe(' /quarter');
    expect(byType.storage.price).toBeCloseTo(252); // 7 × 3 × 12 /year
    expect(byType.storage.priceSuffix).toBe(' /year');
    expect(byType.extras.price).toBeCloseTo(36); // 9 × 4 one-time
    expect(byType.extras.priceSuffix).toBe(' one-time');
  });

  it('getLimitChangeData scales the monthly price regardless of plan.unit', () => {
    // OpenStack offerings ship with plan.unit='month'; resources priced per-day
    // store the rate differently but the change view must show the same monthly
    // total either way.
    const buildOffering = () => ({
      ...fixtures.offering,
      components: [
        {
          type: 'cores',
          billing_type: 'limit',
          name: 'Cores',
          measured_unit: 'cores',
          is_boolean: false,
          limit_period: 'month',
        },
      ],
    });

    const monthData = getLimitChangeData(
      { prices: { cores: 30 }, unit: 'month' },
      buildOffering(),
      { cores: 2 },
      { cores: 0 },
      { cores: 0 },
      true,
    );
    expect(monthData.components[0].price).toBeCloseTo(60); // 2 × 30 /mo
    expect(monthData.components[0].priceSuffix).toBe(' /mo');

    const dayData = getLimitChangeData(
      { prices: { cores: 1 }, unit: 'day' },
      buildOffering(),
      { cores: 2 },
      { cores: 0 },
      { cores: 0 },
      true,
    );
    expect(dayData.components[0].price).toBeCloseTo(60); // 2 × 1 × 30
    expect(dayData.components[0].priceSuffix).toBe(' /mo');
  });

  it('getLimitChangeData scales monthly price by plan_unit', () => {
    const dayPlanOffering = {
      ...fixtures.offering,
      components: [
        {
          type: 'cores',
          billing_type: 'limit',
          name: 'Cores',
          measured_unit: 'cores',
          is_boolean: false,
          limit_period: 'month',
        },
      ],
    };
    const plan = { prices: { cores: 1 }, unit: 'day' };

    const data = getLimitChangeData(
      plan,
      dayPlanOffering,
      { cores: 10 },
      { cores: 0 },
      { cores: 0 },
      true,
    );

    // 10 cores × $1/day × 30 days = $300/mo
    expect(data.components[0].price).toBeCloseTo(300);
    expect(data.components[0].priceSuffix).toBe(' /mo');
  });
});
