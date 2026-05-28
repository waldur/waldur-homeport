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
    expect(
      getLimitChangeData(
        fixtures.plan,
        fixtures.offering,
        fixtures.newLimits,
        fixtures.currentLimits,
        fixtures.usages,
        fixtures.orderCanBeApproved,
      ),
    ).toEqual(fixtures.resultData);
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
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    expect(getRemainingMonths(futureDate.toISOString())).toBe(3);

    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    expect(getRemainingMonths(pastDate.toISOString())).toBe(0);
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

    expect(data.periods[1]).toContain('Price for remaining');
  });
});
