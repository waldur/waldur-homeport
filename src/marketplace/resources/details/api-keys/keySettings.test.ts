import { describe, expect, it } from 'vitest';

import {
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
import { getKeyLimitComponents } from './keySpendingLimits';

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
        [],
      ),
    ).toEqual({ spending_limits: { token_cost: { day: 5, month: 50 } } });
  });

  it('sends an empty limit map and model list so a cleared form removes them', () => {
    expect(serializeKeySettings({}, limitComponents(), ['gpt-4o'])).toEqual({
      spending_limits: {},
      allowed_models: [],
    });
  });

  // A key limited to retired models shows none ticked; saving an unrelated
  // change must not send that empty list, which would allow every model.
  it('leaves untouched models out of an edit', () => {
    expect(
      serializeKeySettings(
        { spending_limits: { tokens: { month: 5 } }, allowed_models: [] },
        limitComponents(),
        ['gpt-4o'],
        false,
      ),
    ).toEqual({ spending_limits: { tokens: { month: 5 } } });
  });

  // Unticking everything is how a key is opened to every model, even when its
  // list only named retired ones and the form therefore looks unchanged.
  it('sends models the user touched in an edit, even if back to empty', () => {
    expect(
      serializeKeySettings({ allowed_models: [] }, [], ['gpt-4o'], true),
    ).toEqual({ allowed_models: [] });
  });

  it('leaves out the settings the offering does not have', () => {
    expect(
      serializeKeySettings(
        { spending_limits: { tokens: { month: 1 } }, allowed_models: ['x'] },
        [],
        [],
      ),
    ).toEqual({});
  });

  // A period no longer offered is not shown, so it is not sent either.
  it('sends only the periods shown', () => {
    expect(
      serializeKeySettings(
        { spending_limits: { tokens: { day: 3, month: 5 } } },
        limitComponents(),
        [],
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

  // The provider's maximum is for resources; a key is capped by its resource.
  it("caps each period by the resource's limit for it", () => {
    const components = limitComponents({ token_cost: { day: 20 } });
    expect(periods(components, 'token_cost')).toEqual({
      day: { maximum: 20 },
      week: {},
      month: {},
    });
  });

  // The resource limit was lowered after the key's limit was set: the key's
  // own value stays valid until the user changes it.
  it("keeps a key's existing limit valid above a lowered resource limit", () => {
    const components = limitComponents(
      { token_cost: { day: 20 } },
      { token_cost: { day: 30 } },
    );
    expect(periods(components, 'token_cost').day).toEqual({ maximum: 30 });
  });

  it('keeps showing a limit on a period no longer offered', () => {
    const components = limitComponents({}, { tokens: { day: 3 } });
    expect(Object.keys(periods(components, 'tokens'))).toEqual([
      'day',
      'month',
    ]);
  });
});

describe('getKeySettingsFields', () => {
  it('locks every setting with a reason', () => {
    const fields = getKeySettingsFields(
      { spending_limits: {} } as any,
      [TOKENS],
      ['gpt-4o'],
      { disabledReason: 'Locked' },
    ) as any[];
    expect(fields).toHaveLength(2);
    for (const field of fields) {
      expect(field.disabled).toBe(true);
      expect(field.disabled_tooltip).toBe('Locked');
    }
  });

  it('has no limit field on an offering without components', () => {
    expect(getKeySettingsFields({} as any, [], [])).toEqual([]);
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
      { tokens: 1000 },
    );
    expect(reading).toMatchObject({ limit: 100, ratio: 50, inherited: false });
  });

  it('inherits the resource limit when the key has no limit', () => {
    const reading = getComponentUsage(
      row({ current_usages: { tokens: 250 } }),
      TOKENS,
      { tokens: 1000 },
    );
    expect(reading).toMatchObject({ limit: 1000, ratio: 25, inherited: true });
  });

  it('applies the resource limit when it is tighter than the key limit', () => {
    const reading = getComponentUsage(
      row({ limits: { tokens: 5000 } }),
      TOKENS,
      { tokens: 1000 },
    );
    expect(reading).toMatchObject({ limit: 1000, inherited: true });
  });

  it('treats zero as no limit', () => {
    const reading = getComponentUsage(
      row({ limits: { tokens: 0 }, current_usages: { tokens: 7 } }),
      TOKENS,
      { tokens: 0 },
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

  it('reads a limit of 0 as reached, should one come', () => {
    expect(
      getPeriodUsages(
        row({ spending_limit_status: [status('day', 0, 0)] }),
        TOKEN_COST,
      )[0].ratio,
    ).toBe(100);
  });
});
