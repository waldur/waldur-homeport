import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { OfferingComponent } from 'waldur-js-client';

import { TENANT_TYPE } from '@/openstack/constants';
import { VMWARE_VM } from '@/vmware/constants';

import {
  formatQuotaUnits,
  getDisplayUnit,
  getQuotaCellProps,
  getResetsText,
  getResetsValue,
  getResourceComponentEntries,
  getSpendingLimitCellProps,
  isReportedBeforeThisMonth,
  RESOURCE_QUOTA_FIELDS,
} from './ResourceComponentItem';

const makeComponent = (
  overrides: Partial<OfferingComponent> = {},
): OfferingComponent =>
  ({
    type: 'node',
    name: 'node-hours',
    measured_unit: 'node-Hours',
    billing_type: 'limit',
    factor: null,
    ...overrides,
  }) as OfferingComponent;

const makeResource = (overrides = {}) =>
  ({
    limits: { node: 1 },
    current_usages: { node: 0.33 },
    limit_usage: { node: 0.33 },
    ...overrides,
  }) as any;

describe('getDisplayUnit', () => {
  it('should convert MB to GB when factor is 1024', () => {
    expect(getDisplayUnit('MB', 1024)).toBe('GB');
  });

  it('should convert MB to TB when factor is 1048576', () => {
    expect(getDisplayUnit('MB', 1048576)).toBe('TB');
  });

  it('should convert GB to TB when factor is 1024', () => {
    expect(getDisplayUnit('GB', 1024)).toBe('TB');
  });

  it('should convert KB to MB when factor is 1024', () => {
    expect(getDisplayUnit('KB', 1024)).toBe('MB');
  });

  it('should return original unit when factor is 1', () => {
    expect(getDisplayUnit('MB', 1)).toBe('MB');
  });

  it('should return original unit when factor is null', () => {
    expect(getDisplayUnit('MB', null)).toBe('MB');
  });

  it('should return original unit when factor is undefined', () => {
    expect(getDisplayUnit('MB', undefined)).toBe('MB');
  });

  it('should return empty string when unit is undefined', () => {
    expect(getDisplayUnit(undefined, 1024)).toBe('');
  });

  it('should return original unit for unknown factor', () => {
    expect(getDisplayUnit('MB', 512)).toBe('MB');
  });

  it('should keep the measured unit of OpenStack tenant components', () => {
    expect(getDisplayUnit('GB', 1024, TENANT_TYPE)).toBe('GB');
  });

  it('should keep the measured unit of VMware components', () => {
    expect(getDisplayUnit('GB', 1024, VMWARE_VM)).toBe('GB');
  });
});

describe('getQuotaCellProps for a VMware virtual machine', () => {
  const resource = makeResource({
    offering_type: VMWARE_VM,
    limits: { ram: 4096, disk: 46080 },
    limit_usage: {},
    current_usages: {},
  });

  it('should show RAM stored in MiB as GB', () => {
    const props = getQuotaCellProps(
      makeComponent({
        type: 'ram',
        name: 'RAM',
        measured_unit: 'GB',
        factor: 1024,
      }),
      resource,
    );
    expect(props.limit).toBe('4');
    expect(props.displayUnit).toBe('GB');
  });

  it('should show disk stored in MiB as GB', () => {
    const props = getQuotaCellProps(
      makeComponent({
        type: 'disk',
        name: 'Disk',
        measured_unit: 'GB',
        factor: 1024,
      }),
      resource,
    );
    expect(props.limit).toBe('45');
    expect(props.displayUnit).toBe('GB');
  });

  // A list that requests only RESOURCE_QUOTA_FIELDS still knows the offering
  // type, or it would promote these gigabytes to terabytes.
  it('keeps the unit from the fields a list requests', () => {
    const listed = Object.fromEntries(
      Object.entries(resource).filter(([field]) =>
        RESOURCE_QUOTA_FIELDS.includes(field),
      ),
    );
    const props = getQuotaCellProps(
      makeComponent({
        type: 'ram',
        name: 'RAM',
        measured_unit: 'GB',
        factor: 1024,
      }),
      listed as any,
    );
    expect(props.displayUnit).toBe('GB');
  });
});

describe('getQuotaCellProps', () => {
  it('should preserve fractional usage for limit-based components', () => {
    const props = getQuotaCellProps(makeComponent(), makeResource());
    expect(props.usage).toBe('0.33');
    expect(props.limit).toBe('1');
    expect(props.title).toBe('node-hours');
    expect(props.displayUnit).toBe('node-Hours');
    expect(props.units).toBe('node-Hours');
  });

  it('should return integer string when usage is a whole number', () => {
    const props = getQuotaCellProps(
      makeComponent(),
      makeResource({ limit_usage: { node: 1 }, current_usages: { node: 1 } }),
    );
    expect(props.usage).toBe('1');
    expect(props.limit).toBe('1');
  });

  it('should use limit_usage for limit billing type', () => {
    const props = getQuotaCellProps(
      makeComponent({ billing_type: 'limit' }),
      makeResource({
        limit_usage: { node: 0.75 },
        current_usages: { node: 0.5 },
      }),
    );
    expect(props.usage).toBe('0.75');
  });

  it('should use live current_usages for OpenStack tenant limit components', () => {
    // Storage freed mid-month: live usage dropped to 0 but limit_usage still
    // holds the monthly peak. The tenant hero must track the live value so it
    // matches the Quotas panel, not the stale high-watermark.
    const props = getQuotaCellProps(
      makeComponent({ type: 'storage', billing_type: 'limit' }),
      makeResource({
        offering_type: TENANT_TYPE,
        limit_usage: { storage: 5 },
        current_usages: { storage: 0 },
        limits: { storage: 10 },
      }),
    );
    expect(props.usage).toBe('0');
    expect(props.limit).toBe('10');
  });

  it('should still use limit_usage peak for non-tenant limit components', () => {
    const props = getQuotaCellProps(
      makeComponent({ billing_type: 'limit' }),
      makeResource({
        offering_type: 'Marketplace.Support',
        limit_usage: { node: 0.75 },
        current_usages: { node: 0.5 },
      }),
    );
    expect(props.usage).toBe('0.75');
  });

  it('should use current_usages for usage billing type', () => {
    const props = getQuotaCellProps(
      makeComponent({ billing_type: 'usage' }),
      makeResource({
        limit_usage: { node: 0.75 },
        current_usages: { node: 0.5 },
        limits: { node: 100 },
      }),
    );
    expect(props.usage).toBe('0.50');
    expect(props.limit).toBe('100');
  });

  it('should apply factor when dividing values', () => {
    const props = getQuotaCellProps(
      makeComponent({ factor: 60 }),
      makeResource({ limit_usage: { node: 120 }, limits: { node: 3600 } }),
    );
    expect(props.usage).toBe('2');
    expect(props.limit).toBe('60');
  });

  it('should handle zero usage', () => {
    const props = getQuotaCellProps(
      makeComponent(),
      makeResource({ limit_usage: { node: 0 }, current_usages: { node: 0 } }),
    );
    expect(props.usage).toBe('0');
  });

  it('should handle null component', () => {
    const props = getQuotaCellProps(null, makeResource());
    expect(props.usage).toBe('');
    expect(props.limit).toBe('');
    expect(props.displayUnit).toBe('');
    expect(props.units).toBe('');
  });

  it('should return null limit for fixed billing type', () => {
    const props = getQuotaCellProps(
      makeComponent({ billing_type: 'fixed' }),
      makeResource({ limit_usage: null }),
    );
    expect(props.limit).toBeNull();
  });

  it('should fall back to current_usages when limit_usage is missing', () => {
    const props = getQuotaCellProps(
      makeComponent({ billing_type: 'limit' }),
      makeResource({ limit_usage: null, current_usages: { node: 0.45 } }),
    );
    expect(props.usage).toBe('0.45');
  });

  it('should always show units alongside value', () => {
    const props = getQuotaCellProps(
      makeComponent({ name: 'CPU Cores', measured_unit: 'cores' }),
      makeResource(),
    );
    expect(props.title).toBe('CPU Cores');
    expect(props.displayUnit).toBe('cores');
    expect(props.units).toBe('cores');
  });

  it('should show units when name does not contain the unit', () => {
    const props = getQuotaCellProps(
      makeComponent({
        name: 'RAM',
        measured_unit: 'MB',
        factor: 1024,
      }),
      makeResource(),
    );
    expect(props.title).toBe('RAM');
    expect(props.displayUnit).toBe('GB');
    expect(props.units).toBe('GB');
  });

  it('should convert measured_unit based on factor', () => {
    const props = getQuotaCellProps(
      makeComponent({
        name: 'Storage',
        measured_unit: 'MB',
        factor: 1024,
      }),
      makeResource(),
    );
    expect(props.displayUnit).toBe('GB');
    expect(props.units).toBe('GB');
  });

  describe('usage-based component limit', () => {
    const usageComponent = makeComponent({
      type: 'inodes',
      billing_type: 'usage',
    });

    it('takes the limit from display_limits when none is stored', () => {
      const props = getQuotaCellProps(
        usageComponent,
        makeResource({
          limits: { storage: 10 },
          display_limits: { inodes: 2000 },
          current_usages: { inodes: 1500 },
        }),
      );
      expect(props.usage).toBe('1500');
      expect(props.limit).toBe('2000');
    });

    it('prefers a stored limit over display_limits', () => {
      const props = getQuotaCellProps(
        usageComponent,
        makeResource({
          limits: { inodes: 5 },
          display_limits: { inodes: 2000 },
        }),
      );
      expect(props.limit).toBe('5');
    });

    it('shows no limit without a stored or displayed one', () => {
      const props = getQuotaCellProps(
        usageComponent,
        makeResource({ limits: { storage: 10 } }),
      );
      expect(props.limit).toBeNull();
    });

    it('ignores display_limits for a limit-based component', () => {
      const props = getQuotaCellProps(
        makeComponent({ type: 'storage' }),
        makeResource({
          limits: { storage: 10 },
          display_limits: { storage: 99 },
        }),
      );
      expect(props.limit).toBe('10');
    });
  });
});

describe('getQuotaCellProps for prepaid components shown as a total', () => {
  const prepaid = makeComponent({
    type: 'cpu',
    name: 'CPU',
    measured_unit: 'Hours',
    billing_type: 'one',
    is_prepaid: true,
  });
  const resource = (overrides = {}) =>
    makeResource({
      limits: { cpu: 5 },
      current_usages: { cpu: 2 },
      limit_usage: { cpu: 7 },
      created: '2026-08-15T10:00:00+00:00',
      end_date: '2026-11-15',
      prepaid_total_component_types: ['cpu'],
      ...overrides,
    });

  // The agent gives SLURM the monthly limit times the months as one budget,
  // and usage counts against it for the whole subscription.
  it('shows the limit and usage for the whole subscription', () => {
    const props = getQuotaCellProps(prepaid, resource());
    expect(props.limit).toBe('15');
    expect(props.usage).toBe('7');
    expect(props.isTotal).toBe(true);
  });

  // The backend leaves a component out when the offering does not ask for
  // totals, or when the resource's plan bills it as something other than a
  // one-time prepaid component.
  it('keeps the monthly view for a component the backend does not total', () => {
    const props = getQuotaCellProps(
      prepaid,
      resource({ prepaid_total_component_types: [] }),
    );
    expect(props.limit).toBe('5');
    expect(props.usage).toBe('2');
    expect(props.isTotal).toBe(false);
  });

  it('keeps the monthly view without the total usage', () => {
    const props = getQuotaCellProps(prepaid, resource({ limit_usage: {} }));
    expect(props.limit).toBe('5');
    expect(props.usage).toBe('2');
    expect(props.isTotal).toBe(false);
  });

  it('keeps the monthly view when the resource dates are unknown', () => {
    const props = getQuotaCellProps(prepaid, resource({ end_date: null }));
    expect(props.limit).toBe('5');
    expect(props.usage).toBe('2');
  });

  // Lists request only the fields they show; with RESOURCE_QUOTA_FIELDS a
  // listed resource reads the same as on its own page.
  it('shows the total from the fields a list requests', () => {
    const listed = Object.fromEntries(
      Object.entries(resource()).filter(([field]) =>
        RESOURCE_QUOTA_FIELDS.includes(field),
      ),
    );
    const props = getQuotaCellProps(prepaid, listed as any);
    expect(props.limit).toBe('15');
    expect(props.usage).toBe('7');
    expect(props.isTotal).toBe(true);
  });
});

describe('formatQuotaUnits', () => {
  it('says when the figures cover the whole subscription', () => {
    expect(formatQuotaUnits('hours', true)).toBe('hours in total');
    expect(formatQuotaUnits('', true)).toBe('in total');
  });

  it('leaves a monthly unit as it is', () => {
    expect(formatQuotaUnits('hours', false)).toBe('hours');
    expect(formatQuotaUnits(undefined, false)).toBe('');
  });
});

const status = (component_type: string, period: string, used, limit) =>
  ({
    component_type,
    period,
    used,
    limit,
    reached: used >= limit,
    resets_at: '2026-10-24T00:00:00Z',
    last_reported_at: null,
  }) as any;

describe('getResourceComponentEntries', () => {
  const tokens = makeComponent({ type: 'input_tokens', name: 'input_tokens' });
  const cost = makeComponent({
    type: 'token_cost',
    name: 'token_cost',
    billing_type: 'usage',
    measured_unit: 'EUR',
  });

  it('names its own usage as this month beside limits without a month one', () => {
    const entries = getResourceComponentEntries(
      {
        spending_limit_status: [
          status('token_cost', 'day', 1.1, 3),
          status('token_cost', 'week', 4.4, 10),
        ],
      },
      [tokens, cost],
    );
    expect(entries.map((entry) => entry.key)).toEqual([
      'input_tokens',
      'token_cost',
      'token_cost-day',
      'token_cost-week',
    ]);
    expect(entries[0].thisMonth).toBeUndefined();
    expect(entries[1].thisMonth).toBe(true);
    expect(entries[2].spendingLimit.period).toBe('day');
    expect(entries[2].component).toBe(cost);
  });

  // The month limit's entry shows the same month-to-date figure.
  it('leaves its own usage out beside a month limit', () => {
    const entries = getResourceComponentEntries(
      {
        spending_limit_status: [
          status('token_cost', 'day', 1.1, 3),
          status('token_cost', 'month', 8.8, 40),
        ],
      },
      [tokens, cost],
    );
    expect(entries.map((entry) => entry.key)).toEqual([
      'input_tokens',
      'token_cost-day',
      'token_cost-month',
    ]);
  });

  // A resource option shown as the component's limit is not the month limit.
  it('keeps its own entry beside a month limit when it has a limit of its own', () => {
    const entries = getResourceComponentEntries(
      {
        limits: { token_cost: 100 },
        spending_limit_status: [status('token_cost', 'month', 5, 40)],
      },
      [cost],
    );
    expect(entries.map((entry) => entry.key)).toEqual([
      'token_cost',
      'token_cost-month',
    ]);
    expect(entries[0].thisMonth).toBe(true);
  });

  it('keeps its own entry beside a month limit for a displayed limit', () => {
    const entries = getResourceComponentEntries(
      {
        display_limits: { token_cost: 100 },
        spending_limit_status: [status('token_cost', 'month', 5, 40)],
      },
      [cost],
    );
    expect(entries.map((entry) => entry.key)).toEqual([
      'token_cost',
      'token_cost-month',
    ]);
  });

  // current_usages still holds last month's row until this month's report.
  it('has no usage this month when the latest report predates it', () => {
    const lastMonth = DateTime.utc()
      .startOf('month')
      .minus({ days: 3 })
      .toISO();
    const entries = getResourceComponentEntries(
      {
        spending_limit_status: [
          {
            ...status('token_cost', 'day', 0, 3),
            last_reported_at: lastMonth,
          },
        ],
      },
      [cost],
    );
    expect(entries[0]).toMatchObject({
      key: 'token_cost',
      thisMonth: true,
      noUsageThisMonth: true,
    });
  });

  it("takes the usage as this month's once reported this month", () => {
    const entries = getResourceComponentEntries(
      {
        spending_limit_status: [
          {
            ...status('token_cost', 'day', 0, 3),
            last_reported_at: DateTime.utc().toISO(),
          },
        ],
      },
      [cost],
    );
    expect(entries[0].thisMonth).toBe(true);
    expect(entries[0].noUsageThisMonth).toBeUndefined();
  });

  it('lists the components alone when nothing is limited', () => {
    const entries = getResourceComponentEntries({}, [tokens, cost]);
    expect(entries.map((e) => e.key)).toEqual(['input_tokens', 'token_cost']);
    expect(entries.some((e) => e.thisMonth)).toBe(false);
  });
});

describe('getSpendingLimitCellProps', () => {
  it('names the period and reads the used and limit amounts', () => {
    expect(
      getSpendingLimitCellProps(
        makeComponent({
          type: 'token_cost',
          name: 'token_cost',
          billing_type: 'usage',
          measured_unit: 'EUR',
        }),
        status('token_cost', 'day', 1.1234, 3),
      ),
    ).toEqual({
      usage: '1.12',
      limit: '3',
      title: 'token_cost · Daily limit',
      displayUnit: 'EUR',
      units: 'EUR',
    });
  });
});

describe('getResetsText', () => {
  it('says an all-time limit never resets', () => {
    expect(
      getResetsText({
        ...status('token_cost', 'total', 1, 3),
        resets_at: null,
      }),
    ).toBe('Never resets');
  });

  it('says a period whose reset time has passed resets shortly', () => {
    expect(
      getResetsText({
        ...status('token_cost', 'day', 1, 3),
        resets_at: '2000-01-01T00:00:00Z',
      }),
    ).toBe('Resets shortly');
  });
});

describe('isReportedBeforeThisMonth', () => {
  const now = DateTime.fromISO('2026-10-01T05:00:00Z', { zone: 'utc' });

  it('is true for a report before the 1st, in UTC', () => {
    expect(isReportedBeforeThisMonth('2026-09-30T23:59:59Z', now)).toBe(true);
    // 1 October 01:00 in UTC+3 is still September in UTC.
    expect(isReportedBeforeThisMonth('2026-10-01T01:00:00+03:00', now)).toBe(
      true,
    );
  });

  it('is false for a report since the 1st', () => {
    expect(isReportedBeforeThisMonth('2026-10-01T00:00:00Z', now)).toBe(false);
  });

  // Nothing reported at all: there is no earlier month's figure to mistake.
  it('is false when nothing is reported', () => {
    expect(isReportedBeforeThisMonth(null, now)).toBe(false);
  });
});

describe('getResetsValue', () => {
  it('says an all-time limit never resets', () => {
    expect(
      getResetsValue({
        ...status('token_cost', 'total', 1, 3),
        resets_at: null,
      }),
    ).toBe('Never');
  });

  it('says a period whose reset time has passed resets shortly', () => {
    expect(
      getResetsValue({
        ...status('token_cost', 'day', 1, 3),
        resets_at: '2000-01-01T00:00:00Z',
      }),
    ).toBe('Shortly');
  });

  it('says when a period resets', () => {
    expect(
      getResetsValue({
        ...status('token_cost', 'month', 1, 3),
        resets_at: DateTime.utc().plus({ days: 3 }).toISO(),
      }),
    ).toMatch(/^in \d+ days, on .+/);
  });
});
