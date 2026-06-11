import { describe, expect, it, vi } from 'vitest';
import { User } from 'waldur-js-client';

import { EXTRA_PROFILE_FIELDS } from './extraProfileFields';

// translate returns the key verbatim, so labels equal their source strings.
vi.mock('@/i18n', () => ({
  translate: vi.fn((key) => key),
}));

const fieldByAttr = (attr: string) => {
  const field = EXTRA_PROFILE_FIELDS.find((f) => f.attr === attr);
  if (!field) {
    throw new Error(`No EXTRA_PROFILE_FIELDS entry for ${attr}`);
  }
  return field;
};

const getValue = (attr: string, user: Partial<User>) =>
  fieldByAttr(attr).getValue(user as User);

describe('EXTRA_PROFILE_FIELDS', () => {
  it('returns scalar attribute values as-is', () => {
    expect(
      getValue('country_of_residence', { country_of_residence: 'EE' }),
    ).toBe('EE');
    expect(getValue('personal_title', { personal_title: 'Dr' })).toBe('Dr');
  });

  it('returns null for empty scalar attributes so the row renders a dash', () => {
    expect(getValue('country_of_residence', {})).toBeNull();
    expect(getValue('personal_title', { personal_title: '' })).toBeNull();
  });

  it('formats gender via the shared label helper', () => {
    expect(getValue('gender', { gender: 'female' })).toBe('Female');
    expect(getValue('gender', { gender: null })).toBeNull();
  });

  it('formats organization type URNs to human-friendly labels', () => {
    expect(
      getValue('organization_type', {
        organization_type: 'urn:schac:homeOrganizationType:int:university',
      }),
    ).toBe('University');
  });

  it('joins list-valued nationalities and skips when empty', () => {
    const field = fieldByAttr('nationalities');
    expect(field.skipWhenEmpty).toBe(true);
    expect(
      getValue('nationalities', { nationalities: ['EE', 'FI'] as any }),
    ).toBe('EE, FI');
    expect(getValue('nationalities', { nationalities: [] as any })).toBeNull();
    expect(getValue('nationalities', {})).toBeNull();
  });

  it('maps eduperson assurance URIs to labels and skips when empty', () => {
    const field = fieldByAttr('eduperson_assurance');
    expect(field.skipWhenEmpty).toBe(true);
    expect(
      getValue('eduperson_assurance', {
        eduperson_assurance: ['https://refeds.org/assurance/IAP/low'] as any,
      }),
    ).toBe('IAP Low');
    expect(getValue('eduperson_assurance', {})).toBeNull();
  });

  it('marks only list-valued attributes as skipWhenEmpty', () => {
    const skipped = EXTRA_PROFILE_FIELDS.filter((f) => f.skipWhenEmpty).map(
      (f) => f.attr,
    );
    expect(skipped).toEqual(['nationalities', 'eduperson_assurance']);
  });
});
