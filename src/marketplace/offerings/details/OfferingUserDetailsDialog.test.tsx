import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceOfferingUsersRetrieve,
  marketplaceProviderOfferingsUserAttributeConfigRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import {
  FIELD_MAPPING,
  OfferingUserDetailsDialog,
} from './OfferingUserDetailsDialog';

const offeringUuid = 'offering-1';
const offeringUserUuid = 'offering-user-1';

const offeringUser = {
  uuid: offeringUserUuid,
  offering_uuid: offeringUuid,
  user_full_name: 'Jane Doe',
  user_email: 'jane@example.com',
  username: 'jane_external',
  state: 'OK',
  created: '2024-01-01T00:00:00Z',
  is_restricted: false,
  is_profile_complete: true,
} as any;

const attributeConfig = {
  exposed_fields: ['full_name', 'email'],
};

const renderDialog = () =>
  renderWithProviders(
    <OfferingUserDetailsDialog resolve={{ offeringUserUuid, offeringUuid }} />,
  );

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

describe('OfferingUserDetailsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(marketplaceOfferingUsersRetrieve).mockResolvedValue({
      data: offeringUser,
    } as any);
    vi.mocked(
      marketplaceProviderOfferingsUserAttributeConfigRetrieve,
    ).mockResolvedValue({
      data: attributeConfig,
    } as any);
  });

  it('fetches offering user details and attribute config on open', async () => {
    renderDialog();

    await waitFor(() => {
      expect(marketplaceOfferingUsersRetrieve).toHaveBeenCalledWith({
        path: { uuid: offeringUserUuid },
      });
      expect(
        marketplaceProviderOfferingsUserAttributeConfigRetrieve,
      ).toHaveBeenCalledWith({
        path: { uuid: offeringUuid },
      });
    });
  });

  it('renders exposed attributes from retrieved offering user details', async () => {
    renderDialog();

    expect(await screen.findByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane_external')).toBeInTheDocument();
  });
});
