import { describe, expect, it, vi } from 'vitest';

import { getTabs } from './OfferingPublicUIView';

vi.mock('@/features/connect', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/connect')>()),
  isFeatureVisible: () => false,
}));

const offering = (extra = {}) =>
  ({
    uuid: 'offering-1',
    description: 'Block storage',
    attributes: {},
    plans: [{ uuid: 'plan-1' }],
    files: [],
    screenshots: [],
    software_catalogs: [],
    partitions: [],
    qos_profiles: [],
    billable: true,
    ...extra,
  }) as any;

const keys = (props) => getTabs(offering(props)).map((tab) => tab.key);

describe('OfferingPublicUIView pricing tab', () => {
  it('shows the price list of an offering that is invoiced', () => {
    expect(keys({})).toContain('pricing');
  });

  it('hides the price list of an offering nothing is invoiced for', () => {
    // An OpenStack volume or instance: billed through its tenant, whose plans
    // the public API hands down to it.
    expect(keys({ billable: false })).not.toContain('pricing');
  });

  it('keeps the components, which carry no prices', () => {
    expect(keys({ billable: false })).toContain('components');
  });
});
