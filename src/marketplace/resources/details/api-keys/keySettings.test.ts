import { describe, expect, it } from 'vitest';

import {
  getComponentReadings,
  getComponentUsage,
  getHeadlineUsage,
  getMeterVariant,
  getPeriodUsages,
  getReadingLabel,
} from './keyLimits';
import {
  getKeySettingsFields,
  serializeKeySettings,
} from './keySettingsFields';
import {
  getKeyLimitComponents,
  getResourceKeyComponents,
} from './keySpendingLimits';

const TOKENS = { type: 'tokens', name: 'Tokens' };

// Usage is counted per UTC month; fixtures report for the current one.
const THIS_MONTH = `${new Date().toISOString().slice(0, 7)}-01`;

const row = (overrides: Record<string, unknown> = {}) =>
  ({
    uuid: 'k1',
    limits: null,
    current_usages: null,
    usage_period: THIS_MONTH,
    ...overrides,
  }) as any;

const TOKEN_COST = {
  type: 'token_cost',
  name: 'Token cost',
  billing_type: 'usage' as const,
  spending_limit_periods: { day: {}, week: {}, month: { maximum: 1000 } },
};

const limitComponents = (
  resourceLimits: Record<string, Record<string, number>> = {},
  held?: Record<string, Record<string, number>>,
) => getKeyLimitComponents([TOKENS, TOKEN_COST], resourceLimits, held);

describe('serializeKeySettings', () => {
  it('sends limits per period as numbers and drops the cleared ones', () => {
    expect(
      serializeKeySettings(
        {
          spending_limits: {
            token_cost: { day: '5', week: '', month: 50 },
            tokens: { month: null },
          },
        },
        limitComponents(),
        null,
      ),
    ).toEqual({ spending_limits: { token_cost: { day: 5, month: 50 } } });
  });

  it('sends an empty limit map and model list so a cleared form removes them', () => {
    expect(serializeKeySettings({}, limitComponents(), ['gpt-4o'])).toEqual({
      spending_limits: {},
      allowed_models: [],
    });
  });

  it('sends the ticked models as a list', () => {
    expect(
      serializeKeySettings(
        { all_models: false, allowed_models: ['gpt-4o'] },
        [],
        ['gpt-4o', 'llama-3'],
      ),
    ).toEqual({ allowed_models: ['gpt-4o'] });
  });

  // The individual ticks stay in the form while All models locks them; they
  // must not be what is sent.
  it('sends every model as its own value, whatever is ticked under it', () => {
    expect(
      serializeKeySettings(
        { all_models: true, allowed_models: ['gpt-4o'] },
        [],
        ['gpt-4o', 'llama-3'],
      ),
    ).toEqual({ allowed_models: ['*'] });
  });

  it('leaves out the settings the offering does not have', () => {
    expect(
      serializeKeySettings(
        { spending_limits: { tokens: { month: 1 } }, allowed_models: ['x'] },
        [],
        null,
      ),
    ).toEqual({});
  });

  // A period no longer offered is not shown, so it is not sent either.
  it('sends only the periods shown', () => {
    expect(
      serializeKeySettings(
        { spending_limits: { tokens: { day: 3, month: 5 } } },
        limitComponents(),
        null,
      ),
    ).toEqual({ spending_limits: { tokens: { month: 5 } } });
  });
});

describe('getKeyLimitComponents', () => {
  const periods = (components: ReturnType<typeof limitComponents>, type) =>
    components.find((component) => component.type === type)!
      .spending_limit_periods;

  it('offers month on every component and the others where the component offers them', () => {
    const components = limitComponents();
    expect(Object.keys(periods(components, 'tokens'))).toEqual(['month']);
    expect(Object.keys(periods(components, 'token_cost'))).toEqual([
      'day',
      'week',
      'month',
    ]);
  });

  // The provider's maximum is for resources; a key is capped by its resource,
  // as no key may spend more in a period than its resource may in that period
  // or any longer one.
  it("caps each period by the resource's limits for it and every longer period", () => {
    const components = limitComponents({ token_cost: { day: 20, month: 50 } });
    expect(periods(components, 'token_cost')).toEqual({
      day: { maximum: 20 },
      week: { maximum: 50 },
      month: { maximum: 50 },
    });
    // A day limit above the month's is capped by the month's.
    expect(
      periods(
        limitComponents({ token_cost: { day: 80, month: 50 } }),
        'token_cost',
      ).day,
    ).toEqual({ maximum: 50 });
  });

  it('applies no provider maximum, nor a cap without a resource limit', () => {
    // TOKEN_COST offers month with a provider maximum of 1000.
    expect(periods(limitComponents(), 'token_cost').month).toEqual({});
  });

  it("caps a held period by the resource's longer limits too", () => {
    const components = limitComponents(
      { tokens: { year: 100 } },
      { tokens: { day: 3 } },
    );
    expect(periods(components, 'tokens')).toEqual({
      day: { maximum: 100, heldOnly: true },
      month: { maximum: 100 },
    });
  });

  // The resource limit was lowered after the key's limit was set: the key's
  // own value stays valid as it is (the fields' keepHeld), but a new amount is
  // capped by the resource's limit, as the backend caps it.
  it("caps a new amount by a resource limit lowered below the key's", () => {
    const components = limitComponents(
      { token_cost: { day: 20 } },
      { token_cost: { day: 30 } },
    );
    expect(periods(components, 'token_cost').day).toEqual({ maximum: 20 });
  });

  it('keeps showing a limit on a period no longer offered, to keep or clear', () => {
    const components = limitComponents({}, { tokens: { day: 3 } });
    expect(periods(components, 'tokens')).toEqual({
      day: { heldOnly: true },
      month: {},
    });
  });
});

describe('getKeySettingsFields', () => {
  it('has no limit field on an offering without components', () => {
    expect(getKeySettingsFields({} as any, [], null)).toEqual([]);
  });
});

describe('getComponentUsage', () => {
  // A key paused at its limit in September resumes on 1 October; until the
  // agent reports October, September's usage must not read as October's.
  it('counts no usage reported for an earlier month', () => {
    const reading = getComponentUsage(
      row({
        limits: { tokens: 100 },
        current_usages: { tokens: 100 },
        usage_period: '2026-09-01',
      }),
      TOKENS,
      {},
      new Date('2026-10-01T00:30:00Z'),
    );
    expect(reading).toMatchObject({ used: undefined, ratio: 0 });
  });

  it('counts usage reported for the current UTC month', () => {
    const reading = getComponentUsage(
      row({
        limits: { tokens: 100 },
        current_usages: { tokens: 40 },
        usage_period: '2026-10-01',
      }),
      TOKENS,
      {},
      new Date('2026-10-31T23:30:00Z'),
    );
    expect(reading).toMatchObject({ used: 40, ratio: 40 });
  });

  it("reads against the key's own limit", () => {
    const reading = getComponentUsage(
      row({ limits: { tokens: 100 }, current_usages: { tokens: 50 } }),
      TOKENS,
      { tokens: { month: 1000 } },
    );
    expect(reading).toMatchObject({ limit: 100, ratio: 50, inherited: false });
  });

  it('inherits the resource limit when the key has no limit', () => {
    const reading = getComponentUsage(
      row({ current_usages: { tokens: 250 } }),
      TOKENS,
      { tokens: { month: 1000 } },
    );
    expect(reading).toMatchObject({ limit: 1000, ratio: 25, inherited: true });
  });

  it('applies the resource limit when it is tighter than the key limit', () => {
    const reading = getComponentUsage(
      row({ limits: { tokens: 5000 } }),
      TOKENS,
      { tokens: { month: 1000 } },
    );
    expect(reading).toMatchObject({ limit: 1000, inherited: true });
  });

  // A tie counts as the key's own limit.
  it('reads a key limit equal to the resource limit as its own', () => {
    const reading = getComponentUsage(
      row({ spending_limits: { tokens: { month: 1000 } } }),
      TOKENS,
      { tokens: { month: 1000 } },
    );
    expect(reading).toMatchObject({ limit: 1000, inherited: false });
  });

  // Only a limit on the same period caps it.
  it("ignores the resource's limits on other periods", () => {
    const reading = getComponentUsage(
      row({ spending_limits: { tokens: { month: 150 } } }),
      TOKENS,
      { tokens: { day: 10 } },
    );
    expect(reading).toMatchObject({ limit: 150, inherited: false });
  });

  it('treats zero as no limit', () => {
    const reading = getComponentUsage(
      row({ limits: { tokens: 0 }, current_usages: { tokens: 7 } }),
      TOKENS,
      { tokens: { month: 0 } },
    );
    expect(reading).toMatchObject({ limit: undefined, used: 7 });
  });
});

describe('usage against a limit', () => {
  it('reads a limited key with no usage as 0%', () => {
    const reading = getComponentUsage(
      row({ limits: { tokens: 100 } }),
      TOKENS,
      {},
    );
    expect(reading).toMatchObject({ limit: 100, ratio: 0, overLimit: false });
  });

  it('warns near the limit and alarms at it', () => {
    expect(getMeterVariant(undefined)).toBeUndefined();
    expect(getMeterVariant(13)).toBeUndefined();
    expect(getMeterVariant(85)).toBe('warning');
    expect(getMeterVariant(100)).toBe('danger');
    expect(getMeterVariant(102)).toBe('danger');
    // The resource's limit does not pause the key.
    expect(getMeterVariant(102, true)).toBe('warning');
    expect(getMeterVariant(13, true)).toBeUndefined();
  });
});

describe('limits on periods other than the month', () => {
  const status = (period, used, limit) => ({
    component_type: 'token_cost',
    period,
    used,
    limit,
    resets_at: '2026-10-22T00:00:00Z',
    reached: used >= limit,
  });

  it('reads each from the status the backend measured', () => {
    const readings = getPeriodUsages(
      row({
        spending_limit_status: [status('day', 4, 5), status('month', 4, 50)],
      }),
      TOKEN_COST,
      {},
    );
    expect(readings).toHaveLength(1);
    expect(readings[0]).toMatchObject({
      period: 'day',
      used: 4,
      limit: 5,
      ratio: 80,
    });
    expect(getReadingLabel(readings[0])).toBe('Token cost · Daily limit');
  });

  it("reads each against the resource's limit for the period when tighter", () => {
    const readings = getPeriodUsages(
      row({
        spending_limit_status: [status('day', 4, 10), status('week', 4, 20)],
      }),
      TOKEN_COST,
      { token_cost: { day: 5, week: 20 } },
    );
    expect(readings).toEqual([
      expect.objectContaining({
        period: 'day',
        limit: 5,
        ratio: 80,
        inherited: true,
      }),
      // A tie counts as the key's own limit.
      expect.objectContaining({ period: 'week', limit: 20, inherited: false }),
    ]);
  });

  // Next to "· Daily limit", a bare month line would not say what it limits.
  it('labels the month reading as the monthly limit', () => {
    const [month] = getComponentReadings(
      row({ limits: { token_cost: 50 }, current_usages: { token_cost: 4 } }),
      TOKEN_COST,
      {},
    );
    expect(getReadingLabel(month)).toBe('Token cost · Monthly limit');
    // An inherited limit is the resource's month limit.
    const [inherited] = getComponentReadings(
      row({ current_usages: { token_cost: 4 } }),
      TOKEN_COST,
      { token_cost: { month: 80 } },
    );
    expect(getReadingLabel(inherited)).toBe('Token cost · Monthly limit');
  });

  it('labels usage with no month limit by its component alone', () => {
    const [month] = getComponentReadings(
      row({ current_usages: { token_cost: 4 } }),
      TOKEN_COST,
      {},
    );
    expect(getReadingLabel(month)).toBe('Token cost');
  });

  it('heads the list with the limit closest to being reached', () => {
    const headline = getHeadlineUsage(
      row({
        limits: { token_cost: 50 },
        current_usages: { token_cost: 4 },
        spending_limit_status: [status('day', 4, 5), status('month', 4, 50)],
      }),
      [TOKEN_COST],
      {},
    );
    expect(headline).toMatchObject({ period: 'day', ratio: 80 });
  });

  // The month reading comes first from the API's shape; the dialogs list
  // periods shortest first, and so must the row.
  it('lists the readings shortest period first', () => {
    const readings = getComponentReadings(
      row({
        spending_limits: { token_cost: { day: 5, week: 20, month: 50 } },
        current_usages: { token_cost: 4 },
        spending_limit_status: [
          status('week', 4, 20),
          status('month', 4, 50),
          status('day', 4, 5),
        ],
      }),
      TOKEN_COST,
      {},
    );
    expect(readings.map((reading) => reading.period ?? 'month')).toEqual([
      'day',
      'week',
      'month',
    ]);
  });

  // The resource's limit is not the key's: the key's usage going over it
  // pauses nothing, so it must not head an OK key as its breach.
  it("heads the list with the key's own limit over an inherited one", () => {
    const headline = getHeadlineUsage(
      row({
        current_usages: { token_cost: 500 },
        spending_limit_status: [status('day', 1, 10)],
      }),
      [TOKEN_COST],
      { token_cost: { month: 40 } },
    );
    expect(headline).toMatchObject({ period: 'day', inherited: false });
  });

  it('heads with an inherited limit only when the key has none, and warns at most', () => {
    const headline = getHeadlineUsage(
      row({ current_usages: { token_cost: 500 } }),
      [TOKEN_COST],
      { token_cost: { month: 40 } },
    )!;
    expect(headline).toMatchObject({ inherited: true, overLimit: true });
    expect(getMeterVariant(headline.ratio, headline.inherited)).toBe('warning');
  });

  it('reads a limit of 0 as reached, should one come', () => {
    expect(
      getPeriodUsages(
        row({ spending_limit_status: [status('day', 0, 0)] }),
        TOKEN_COST,
        {},
      )[0].ratio,
    ).toBe(100);
  });
});

describe('getResourceKeyComponents', () => {
  // Periods other than month need per-key daily usage; see below.
  const offering = {
    components: [TOKENS, TOKEN_COST],
    plugin_options: { api_key_daily_usage: true },
    plans: [
      {
        uuid: 'plan-limit',
        components: [{ type: 'token_cost', billing_type: 'limit' }],
      },
    ],
  } as any;

  // The backend reads the periods a key may limit from the plan's billing.
  it('offers only month on a component the plan bills by limit', () => {
    const components = getKeyLimitComponents(
      getResourceKeyComponents(offering, 'plan-limit'),
      {},
    );
    expect(
      Object.keys(
        components.find((c) => c.type === 'token_cost')!.spending_limit_periods,
      ),
    ).toEqual(['month']);
  });

  it('keeps the offering billing without a known plan', () => {
    const components = getKeyLimitComponents(
      getResourceKeyComponents(offering, undefined),
      {},
    );
    expect(
      Object.keys(
        components.find((c) => c.type === 'token_cost')!.spending_limit_periods,
      ),
    ).toEqual(['day', 'week', 'month']);
  });

  const keyPeriods = (
    plugin_options: Record<string, unknown>,
    held?: Record<string, Record<string, number>>,
  ) =>
    Object.fromEntries(
      getKeyLimitComponents(
        getResourceKeyComponents({ ...offering, plugin_options }, undefined),
        {},
        held,
      ).map((component) => [
        component.type,
        Object.keys(component.spending_limit_periods),
      ]),
    );

  // Day and week limits would never be reached without per-day key usage,
  // and quarter and year would count the current month alone.
  it('offers only month unless the offering reports per-key daily usage', () => {
    expect(keyPeriods({})).toEqual({
      tokens: ['month'],
      token_cost: ['month'],
    });
    expect(keyPeriods({ api_key_daily_usage: false })).toEqual({
      tokens: ['month'],
      token_cost: ['month'],
    });
    expect(keyPeriods({ api_key_daily_usage: true })).toEqual({
      tokens: ['month'],
      token_cost: ['day', 'week', 'month'],
    });
  });

  // A total reads the key's running total, which needs no per-day reports.
  it('offers an all-time limit wherever the component offers it', () => {
    const allTime = {
      ...offering,
      components: [
        TOKENS,
        {
          ...TOKEN_COST,
          spending_limit_periods: { day: {}, year: {}, total: {} },
        },
      ],
    };
    const periodsOf = (plugin_options: Record<string, unknown>) =>
      Object.keys(
        getKeyLimitComponents(
          getResourceKeyComponents({ ...allTime, plugin_options }, undefined),
          {},
        ).find((c) => c.type === 'token_cost')!.spending_limit_periods,
      );
    expect(periodsOf({})).toEqual(['month', 'total']);
    expect(periodsOf({ api_key_daily_usage: true })).toEqual([
      'day',
      'month',
      'year',
      'total',
    ]);
  });

  it('caps a key by the resource total, the longest period', () => {
    const [component] = getKeyLimitComponents(
      [{ ...TOKEN_COST, spending_limit_periods: { total: {} } }],
      { token_cost: { month: 80, total: 50 } },
    );
    expect(component.spending_limit_periods).toEqual({
      month: { maximum: 50 },
      total: { maximum: 50 },
    });
  });

  it('offers no key limit on an offering that turns them off', () => {
    expect(
      keyPeriods({ api_key_limits: false, api_key_daily_usage: true }),
    ).toEqual({});
    // Key limits are on unless turned off.
    expect(keyPeriods({ api_key_limits: true })).toEqual({
      tokens: ['month'],
      token_cost: ['month'],
    });
  });

  // As the backend: limits a key already holds stay until cleared.
  it('keeps limits a key holds once the offering stops offering them', () => {
    const components = getKeyLimitComponents(
      getResourceKeyComponents(
        { ...offering, plugin_options: { api_key_limits: false } },
        undefined,
      ),
      {},
      { token_cost: { day: 2, month: 5 } },
    );
    expect(components).toEqual([
      expect.objectContaining({
        type: 'token_cost',
        spending_limit_periods: {
          day: { heldOnly: true },
          month: { heldOnly: true },
        },
      }),
    ]);
    const monthOnly = getKeyLimitComponents(
      getResourceKeyComponents({ ...offering, plugin_options: {} }, undefined),
      {},
      { token_cost: { day: 2 } },
    );
    expect(
      monthOnly.find((c) => c.type === 'token_cost')!.spending_limit_periods,
    ).toEqual({ day: { heldOnly: true }, month: {} });
  });

  // A LiteLLM cost cap is priced at zero, yet it is what a key's spend is
  // capped on: the price says how the plan bills it, not what it measures.
  describe('a component the plan prices at zero', () => {
    const priced = {
      ...offering,
      plans: [
        {
          uuid: 'plan-free-tokens',
          components: [
            { type: 'tokens', billing_type: 'usage', price: '0.0000000000' },
            {
              type: 'token_cost',
              billing_type: 'usage',
              price: '0.0000000000',
            },
          ],
        },
      ],
    } as any;

    it('takes key limits like any other component', () => {
      const components = getKeyLimitComponents(
        getResourceKeyComponents(priced, 'plan-free-tokens'),
        {},
      );
      expect(components.map((c) => c.type)).toEqual(['tokens', 'token_cost']);
      expect(
        components.find((c) => c.type === 'tokens')!.spending_limit_periods,
      ).toEqual({ month: {} });
    });
  });
});
