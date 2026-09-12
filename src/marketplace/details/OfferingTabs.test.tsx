import { describe, expect, it, vi } from 'vitest';

import { getTabs } from './OfferingTabs';

vi.mock('@/features/connect', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/connect')>()),
  isFeatureVisible: () => false,
}));

const offering = (extra = {}) =>
  ({
    uuid: 'offering-1',
    attributes: {},
    plans: [{ uuid: 'plan-1' }],
    screenshots: [],
    plugin_options: {},
    billable: true,
    ...extra,
  }) as any;

const titles = (props) =>
  getTabs({ sections: [], offering: offering(props) }).map((tab) => tab.title);

describe('OfferingTabs pricing', () => {
  it('shows the price list of an offering that is invoiced', () => {
    expect(titles({})).toContain('Pricing');
  });

  it('hides the price list of an offering nothing is invoiced for', () => {
    // An OpenStack volume or instance: billed through its tenant, whose plans
    // the public API hands down to it.
    expect(titles({ billable: false })).not.toContain('Pricing');
  });

  it('keeps the components, which carry no prices', () => {
    expect(titles({ billable: false })).toContain('Components');
  });
});
