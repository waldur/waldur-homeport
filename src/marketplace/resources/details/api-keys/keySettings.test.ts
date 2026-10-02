import { describe, expect, it } from 'vitest';

import { getComponentUsage, getMeterVariant } from './keyLimits';
import {
  getKeySettingsFields,
  serializeKeySettings,
} from './keySettingsFields';

const TOKENS = { type: 'tokens', name: 'Tokens' };
const REQUESTS = { type: 'requests', name: 'Requests' };

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

describe('serializeKeySettings', () => {
  it('sends limits as numbers and drops the cleared ones', () => {
    expect(
      serializeKeySettings(
        { limits: { tokens: '500', requests: '' } },
        [TOKENS, REQUESTS],
        [],
      ),
    ).toEqual({ limits: { tokens: 500 } });
  });

  it('sends an empty limit map and model list so a cleared form removes them', () => {
    expect(serializeKeySettings({}, [TOKENS], ['gpt-4o'])).toEqual({
      limits: {},
      allowed_models: [],
    });
  });

  // A key limited to retired models shows none ticked; saving an unrelated
  // change must not send that empty list, which would allow every model.
  it('leaves untouched models out of an edit', () => {
    expect(
      serializeKeySettings(
        { limits: { tokens: 5 }, allowed_models: [] },
        [TOKENS],
        ['gpt-4o'],
        false,
      ),
    ).toEqual({ limits: { tokens: 5 } });
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
        { limits: { tokens: 1 }, allowed_models: ['x'] },
        [],
        [],
      ),
    ).toEqual({});
  });
});

describe('getKeySettingsFields', () => {
  const limitField = (limits: Record<string, number>) =>
    getKeySettingsFields({ limits } as any, [TOKENS], [])[0] as any;

  it("bounds a key's limit by the resource limit", () => {
    expect(limitField({ tokens: 1000 }).maxValue).toBe(1000);
  });

  // A resource without a limit must not clamp every key limit down to zero.
  it('leaves a limit unbounded when the resource limit is zero', () => {
    const field = limitField({ tokens: 0 });
    expect(field.maxValue).toBeUndefined();
    expect(field.help_text).toBeUndefined();
  });

  // The resource limit was lowered after the key's limit was set: the key's
  // own value stays valid until the user changes it.
  it("keeps a key's existing limit valid above a lowered resource limit", () => {
    const field = getKeySettingsFields(
      { limits: { tokens: 500 } } as any,
      [TOKENS],
      [],
      {
        currentLimits: { tokens: 800 },
      },
    )[0] as any;
    expect(field.maxValue).toBe(800);
  });

  it('bounds by the resource limit when the key limit is within it', () => {
    const field = getKeySettingsFields(
      { limits: { tokens: 500 } } as any,
      [TOKENS],
      [],
      {
        currentLimits: { tokens: 200 },
      },
    )[0] as any;
    expect(field.maxValue).toBe(500);
  });

  it('locks every setting with a reason', () => {
    const fields = getKeySettingsFields(
      { limits: {} } as any,
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
