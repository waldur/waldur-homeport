import { describe, expect, it } from 'vitest';

import { FIELD_MAPPING } from './OfferingUserDetailsDialog';

describe('FIELD_MAPPING', () => {
  const expectedKeys = [
    'full_name',
    'email',
    'phone_number',
    'organization',
    'job_title',
    'affiliations',
    'gender',
    'personal_title',
    'place_of_birth',
    'country_of_residence',
    'nationality',
    'nationalities',
    'organization_country',
    'organization_type',
    'organization_registry_code',
    'eduperson_assurance',
    'civil_number',
    'birth_date',
    'identity_source',
  ];

  it('contains all expected attribute keys', () => {
    for (const key of expectedKeys) {
      expect(FIELD_MAPPING).toHaveProperty(key);
    }
  });

  it('all entries have label and getValue functions', () => {
    for (const [, entry] of Object.entries(FIELD_MAPPING)) {
      expect(typeof entry.label).toBe('function');
      expect(typeof entry.getValue).toBe('function');
      expect(entry.label()).toBeTruthy();
    }
  });

  it('getValue accesses correct user_ prefixed fields', () => {
    const mockUser = {
      user_full_name: 'Test User',
      user_email: 'test@example.com',
      user_organization_registry_code: 'REG-001',
      user_identity_source: 'eduGAIN',
    } as any;

    expect(FIELD_MAPPING.full_name.getValue(mockUser)).toBe('Test User');
    expect(FIELD_MAPPING.email.getValue(mockUser)).toBe('test@example.com');
    expect(FIELD_MAPPING.organization_registry_code.getValue(mockUser)).toBe(
      'REG-001',
    );
    expect(FIELD_MAPPING.identity_source.getValue(mockUser)).toBe('eduGAIN');
  });

  it('getValue returns undefined for missing fields', () => {
    const emptyUser = {} as any;
    for (const entry of Object.values(FIELD_MAPPING)) {
      expect(entry.getValue(emptyUser)).toBeUndefined();
    }
  });
});
