import { describe, expect, it } from 'vitest';

import { shouldRemoveOnboardingMetadata } from './onboardingMetadata';

describe('shouldRemoveOnboardingMetadata', () => {
  it('removes existing metadata when both mappings are cleared', () => {
    expect(
      shouldRemoveOnboardingMetadata(
        { maps_to_customer_field: '', intent_field: '  ' },
        'meta-1',
      ),
    ).toBe(true);
    expect(shouldRemoveOnboardingMetadata({}, 'meta-1')).toBe(true);
  });

  it('keeps metadata while either mapping is set', () => {
    expect(
      shouldRemoveOnboardingMetadata(
        { maps_to_customer_field: 'email', intent_field: '' },
        'meta-1',
      ),
    ).toBe(false);
    expect(
      shouldRemoveOnboardingMetadata(
        { maps_to_customer_field: '', intent_field: 'intent' },
        'meta-1',
      ),
    ).toBe(false);
  });

  it('sends nothing when there is no metadata to remove', () => {
    expect(
      shouldRemoveOnboardingMetadata(
        { maps_to_customer_field: '', intent_field: '' },
        undefined,
      ),
    ).toBe(false);
  });
});
