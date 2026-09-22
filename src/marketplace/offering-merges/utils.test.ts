import { describe, expect, it } from 'vitest';
import {
  OfferingMerge,
  OfferingMergeEntry,
  OfferingMergePreview,
} from 'waldur-js-client';

import { POLL_INTERVAL } from './constants';
import {
  getAllowedOfferingTypes,
  getDraftChanges,
  getDraftFromMerge,
  getExecuteBlockers,
  getPresetSuggestion,
  getRefetchInterval,
  getUnknownAnswerKeys,
  groupMergeEntries,
  prefillMappings,
  summarizeCheckDetails,
} from './utils';

const PREVIEW = {
  target: 'target',
  sources: ['source-a'],
  counts: { 'marketplace.Resource.offering': 3 },
  entries: [],
  left_on_source: {},
  summaries_to_recompute: { components: 0, periods: [] },
  invoice_items: {
    policy: 'open_month',
    to_rewrite: 0,
    to_rewrite_by_policy: {},
    on_closed_invoices: 0,
    kept_on_closed_invoices: 0,
  },
  blockers: [],
  warnings: [
    { code: 'plan_price_difference', message: 'Prices differ', details: {} },
    { code: 'unknown_answer_keys', message: 'Keys', details: {} },
  ],
};

const makeMerge = (overrides: Partial<OfferingMerge> = {}): OfferingMerge =>
  ({
    uuid: 'merge',
    state: 'previewed',
    sources: ['source-a'],
    target: 'target',
    plan_mapping: { 'plan-a': 'plan-t' },
    component_mapping: { 'source-a': { cpu: 'cores' } },
    attribute_key_mapping: {},
    invoice_policy: 'open_month',
    preview: PREVIEW,
    verification: null,
    progress: null,
    ...overrides,
  }) as OfferingMerge;

describe('getAllowedOfferingTypes', () => {
  it('allows every type while nothing is chosen', () => {
    expect(getAllowedOfferingTypes([])).toBeUndefined();
  });

  it('lets Basic, Support and site agent offerings merge between themselves', () => {
    expect(getAllowedOfferingTypes(['Support.OfferingTemplate'])).toEqual([
      'Marketplace.Basic',
      'Support.OfferingTemplate',
      'Marketplace.Slurm',
    ]);
  });

  it('restricts any other type to itself', () => {
    expect(getAllowedOfferingTypes(['OpenStack.Tenant'])).toEqual([
      'OpenStack.Tenant',
    ]);
  });

  it('allows nothing for a mix the backend refuses', () => {
    expect(
      getAllowedOfferingTypes(['OpenStack.Tenant', 'Marketplace.Basic']),
    ).toEqual([]);
  });
});

describe('prefillMappings', () => {
  const suggestion = {
    plan_mapping: { 'plan-a': 'plan-t1', 'plan-b': 'plan-t2' },
    component_mapping: { 'source-a': { cpu: 'cpu', ram: 'ram' } },
    unmatched_plans: [],
    unmatched_components: [],
  };

  it('fills an empty draft from the suggestion', () => {
    expect(
      prefillMappings(suggestion, { plan_mapping: {}, component_mapping: {} }),
    ).toEqual({
      plan_mapping: { 'plan-a': 'plan-t1', 'plan-b': 'plan-t2' },
      component_mapping: { 'source-a': { cpu: 'cpu', ram: 'ram' } },
    });
  });

  it('keeps choices made by hand and only fills the gaps', () => {
    expect(
      prefillMappings(suggestion, {
        plan_mapping: { 'plan-a': 'plan-manual' },
        component_mapping: { 'source-a': { cpu: 'cores' } },
      }),
    ).toEqual({
      plan_mapping: { 'plan-a': 'plan-manual', 'plan-b': 'plan-t2' },
      component_mapping: { 'source-a': { cpu: 'cores', ram: 'ram' } },
    });
  });
});

describe('getDraftChanges', () => {
  it('finds nothing to save in an untouched draft', () => {
    const merge = makeMerge();
    expect(getDraftChanges(merge, getDraftFromMerge(merge))).toEqual({});
  });

  it('sends only the edited field', () => {
    const merge = makeMerge();
    const draft = {
      ...getDraftFromMerge(merge),
      plan_mapping: { 'plan-a': 'plan-other' },
    };
    expect(getDraftChanges(merge, draft)).toEqual({
      plan_mapping: { 'plan-a': 'plan-other' },
    });
  });

  it('treats a cleared mapping as removed', () => {
    const merge = makeMerge();
    const draft = {
      ...getDraftFromMerge(merge),
      component_mapping: { 'source-a': {} },
    };
    expect(getDraftChanges(merge, draft)).toEqual({ component_mapping: {} });
  });
});

describe('getExecuteBlockers', () => {
  const allCodes = ['plan_price_difference', 'unknown_answer_keys'];

  it('allows execute once every warning is acknowledged', () => {
    expect(getExecuteBlockers(makeMerge(), allCodes)).toEqual([]);
  });

  it('lists the warnings still to acknowledge', () => {
    const reasons = getExecuteBlockers(makeMerge(), ['plan_price_difference']);
    expect(reasons).toHaveLength(1);
    expect(reasons[0]).toContain('unknown_answer_keys');
    expect(reasons[0]).not.toContain('plan_price_difference');
  });

  it('refuses while blockers remain', () => {
    const merge = makeMerge({
      preview: {
        ...PREVIEW,
        blockers: [{ code: 'pending_orders', message: 'Pending', details: {} }],
      },
    });
    expect(getExecuteBlockers(merge, allCodes)).toHaveLength(1);
  });

  it('asks for a new preview after a mapping changed locally', () => {
    const reasons = getExecuteBlockers(makeMerge(), allCodes, true);
    expect(reasons).toHaveLength(1);
    expect(reasons[0]).toMatch(/preview/i);
  });

  it('asks for a new preview once an edit returned the record to draft', () => {
    // The backend answers an edit of a previewed record with a draft whose
    // preview is cleared.
    const edited = makeMerge({ state: 'draft', preview: null });
    const reasons = getExecuteBlockers(edited, allCodes);
    expect(reasons).toHaveLength(1);
    expect(reasons[0]).toMatch(/preview/i);
  });

  it('refuses a merge that already ran', () => {
    expect(getExecuteBlockers(makeMerge({ state: 'done' }), allCodes)).toEqual([
      'The merge is Done.',
    ]);
  });
});

describe('getRefetchInterval', () => {
  it.each(['queued', 'running', 'undoing'] as const)(
    'polls while %s',
    (state) => {
      expect(getRefetchInterval(makeMerge({ state }))).toBe(POLL_INTERVAL);
    },
  );

  it.each(['draft', 'previewed', 'done', 'failed', 'undone'] as const)(
    'stops polling when %s',
    (state) => {
      expect(getRefetchInterval(makeMerge({ state }))).toBe(false);
    },
  );

  it('does not poll before the record loads', () => {
    expect(getRefetchInterval(undefined)).toBe(false);
  });
});

describe('getUnknownAnswerKeys', () => {
  it('lists source keys the target form lacks', () => {
    expect(
      getUnknownAnswerKeys(
        [
          { options: { options: { storage: {}, os: {} } } },
          { options: { options: { purpose: {} } } },
        ],
        { options: { options: { os: {} } } },
      ),
    ).toEqual(['purpose', 'storage']);
  });
});

describe('getPresetSuggestion', () => {
  const preset = {
    plan_mapping: { p: 'q' },
    component_mapping: { a: { cpu: 'cpu' } },
    unmatched_plans: [],
    unmatched_components: [],
  };
  const presetSelection = { sources: ['a', 'b'], target: 'k' };

  it('applies to the offerings it was suggested for', () => {
    expect(
      getPresetSuggestion(preset, presetSelection, {
        sources: ['b', 'a'],
        target: 'k',
      }),
    ).toBe(preset);
  });

  it('is dropped once staff change the offerings', () => {
    expect(
      getPresetSuggestion(preset, presetSelection, {
        sources: ['a'],
        target: 'k',
      }),
    ).toBeUndefined();
    expect(
      getPresetSuggestion(preset, presetSelection, {
        sources: ['a', 'b'],
        target: 'other',
      }),
    ).toBeUndefined();
  });

  it('is absent after a reload', () => {
    expect(
      getPresetSuggestion(null, presetSelection, presetSelection),
    ).toBeUndefined();
  });
});

const entry = (overrides: Partial<OfferingMergeEntry>): OfferingMergeEntry =>
  ({
    label: 'marketplace.Resource.offering',
    area: 'resources_and_orders',
    area_title: 'Resources and orders',
    effect: 'moved',
    effect_title: 'Moved to the target',
    count: 3,
    left_on_source: 0,
    can_list_rows: true,
    ...overrides,
  }) as OfferingMergeEntry;

const previewOf = (
  overrides: Partial<OfferingMergePreview>,
): OfferingMergePreview =>
  ({ ...PREVIEW, ...overrides }) as OfferingMergePreview;

describe('groupMergeEntries', () => {
  it('groups by area in the order the API lists the entries', () => {
    const { areas } = groupMergeEntries(
      previewOf({
        entries: [
          entry({
            label: 'marketplace.ComponentUsage.component',
            area: 'billing_history',
            area_title: 'Billing history',
          }),
          entry({}),
          entry({ label: 'marketplace.Order.offering' }),
        ],
      }),
    );
    expect(areas.map((area) => area.key)).toEqual([
      'billing_history',
      'resources_and_orders',
    ]);
    expect(areas[1].rows.map((row) => row.label)).toEqual([
      'marketplace.Resource.offering',
      'marketplace.Order.offering',
    ]);
    expect(areas[1].rows[0].title).toBe('Resources');
  });

  it('keeps the entries that stay on the source out of the areas', () => {
    const { areas, keptOnSource, legacy } = groupMergeEntries(
      previewOf({
        entries: [
          entry({}),
          entry({
            label: 'marketplace.Plan.offering',
            area: 'offering_configuration',
            area_title: 'Offering configuration',
            effect: 'kept_on_source',
            effect_title: 'Kept on the archived source',
          }),
        ],
      }),
    );
    expect(areas).toHaveLength(1);
    expect(areas[0].rows.map((row) => row.label)).toEqual([
      'marketplace.Resource.offering',
    ]);
    expect(keptOnSource.map((row) => row.label)).toEqual([
      'marketplace.Plan.offering',
    ]);
    expect(keptOnSource[0].areaTitle).toBe('Offering configuration');
    expect(legacy).toBe(false);
  });

  it('drops the entries a merge does not touch', () => {
    const { areas } = groupMergeEntries(
      previewOf({
        entries: [
          entry({}),
          entry({
            label: 'marketplace.Order.offering',
            count: 0,
          }),
        ],
      }),
    );
    expect(areas[0].rows).toHaveLength(1);
  });

  it('falls back to the flat counts of a preview stored before the grouping', () => {
    const { areas, keptOnSource, legacy } = groupMergeEntries(
      previewOf({
        entries: [],
        counts: { 'marketplace.Resource.offering': 3 },
        left_on_source: { 'marketplace.OfferingUser.offering': 1 },
      }),
    );
    expect(areas).toHaveLength(1);
    expect(areas[0].rows[0]).toMatchObject({
      label: 'marketplace.Resource.offering',
      count: 3,
      // Nothing is known about the effect, so nothing may be drilled into.
      canListRows: false,
    });
    // The old payload counts collisions in left_on_source - rows the target
    // has an equivalent of - not the configuration a merge keeps on the
    // source, so the view must not describe them in those words.
    expect(legacy).toBe(true);
    expect(keptOnSource[0]).toMatchObject({
      label: 'marketplace.OfferingUser.offering',
      count: 1,
    });
  });
});

describe('summarizeCheckDetails', () => {
  it('names the first keys and says how much each holds', () => {
    expect(
      summarizeCheckDetails({
        moved_resources: 12000,
        offerings: { a: 1, b: 2 },
        missing: ['x'],
      }),
    ).toBe(
      `Moved resources: ${(12000).toLocaleString()}, Offerings: 2 field(s), Missing: 1 item(s)`,
    );
  });

  it('elides the rest of a wide payload', () => {
    const summary = summarizeCheckDetails({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });
    expect(summary.endsWith('…')).toBe(true);
    expect(summary).not.toContain('D:');
  });

  it('has nothing to say about an empty payload', () => {
    expect(summarizeCheckDetails({})).toBe('');
    expect(summarizeCheckDetails(undefined)).toBe('');
  });
});
