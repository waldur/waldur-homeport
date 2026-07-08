import { screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser, useSetUser } from '@/workspace/hooks';

import { useProfileFieldWarnings } from './useProfileFieldWarnings';
import { UserProfileTabs } from './UserProfileTabs';

const mockUpdateUserCallback = vi.fn();
const mockConfirm = vi.fn();
const mockOpenDialog = vi.fn();

const ALL_ATTRIBUTES = [
  'native_name',
  'phone_number',
  'organization',
  'job_title',
  'affiliations',
  'gender',
  'personal_title',
  'birth_date',
  'place_of_birth',
  'country_of_residence',
  'nationality',
  'nationalities',
  'organization_country',
  'organization_type',
  'organization_registry_code',
  'eduperson_assurance',
  'civil_number',
  'identity_source',
];

vi.mock('@/features/connect');
vi.mock('@/core/Tooltip', () => ({
  Tip: vi.fn(({ label, children }) => (
    <div title={label as string} data-testid="tip-mock">
      {children}
    </div>
  )),
}));

vi.mock('@/marketplace/common/CountryFlag', () => ({
  CountryFlag: vi.fn(({ countryCode }) => (
    <span data-testid={`flag-${countryCode}`}>Flag: {countryCode}</span>
  )),
}));

vi.mock('./useUpdateUser', () => ({
  useUpdateUser: () => ({ callback: mockUpdateUserCallback }),
}));

vi.mock('./useProfileFieldWarnings', () => ({
  useProfileFieldWarnings: vi.fn(() => ({ data: null })),
}));

vi.mock('./UserEditAvatarFormItem', () => ({
  UserEditAvatarFormItem: () => null,
}));

const makeUser = (overrides = {}): any => ({
  uuid: 'user-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone_number: '+1234567890',
  username: 'johndoe',
  date_joined: '2023-01-15T10:00:00Z',
  organization: 'ACME Corp',
  job_title: 'Engineer',
  identity_provider_fields: [],
  affiliations: [],
  eduperson_assurance: [],
  ...overrides,
});

const renderTabs = (user = makeUser(), disabled = false) =>
  renderWithProviders(<UserProfileTabs user={user} disabled={disabled} />);

describe('UserProfileTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({
      uuid: 'admin-1',
      is_staff: true,
      is_support: false,
    } as any);
    vi.mocked(useSetUser).mockReturnValue(vi.fn());
    (ENV.plugins.WALDUR_CORE as any).ENABLED_USER_PROFILE_ATTRIBUTES =
      ALL_ATTRIBUTES;
    vi.mocked(useModal).mockReturnValue({
      openDialog: mockOpenDialog,
      closeDialog: vi.fn(),
      confirm: mockConfirm,
    } as any);
  });

  // ── Tab Visibility ──────────────────────────────────────────────────────────

  describe('tab visibility', () => {
    it('renders all 6 tabs when user is staff and all attributes enabled', () => {
      renderTabs();

      expect(screen.getByText('Basic info')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.getByText('Geographic')).toBeInTheDocument();
      expect(screen.getByText('Affiliation')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
      expect(screen.getByText('Internal')).toBeInTheDocument();
    });

    it('hides Personal tab when no personal attributes are enabled', () => {
      (ENV.plugins.WALDUR_CORE as any).ENABLED_USER_PROFILE_ATTRIBUTES =
        ALL_ATTRIBUTES.filter(
          (attr) =>
            ![
              'personal_title',
              'gender',
              'birth_date',
              'place_of_birth',
            ].includes(attr),
        );
      renderTabs();

      expect(screen.queryByText('Personal')).not.toBeInTheDocument();
    });

    it('hides Geographic tab when no geographic attributes are enabled', () => {
      (ENV.plugins.WALDUR_CORE as any).ENABLED_USER_PROFILE_ATTRIBUTES =
        ALL_ATTRIBUTES.filter(
          (attr) =>
            !['country_of_residence', 'nationality', 'nationalities'].includes(
              attr,
            ),
        );
      renderTabs();

      expect(screen.queryByText('Geographic')).not.toBeInTheDocument();
    });

    it('hides Internal tab for non-staff, non-support users', () => {
      vi.mocked(useUser).mockReturnValue({
        uuid: 'admin-1',
        is_staff: false,
        is_support: false,
      } as any);
      renderTabs();

      expect(screen.queryByText('Internal')).not.toBeInTheDocument();
    });

    it('shows Internal tab for support users', () => {
      vi.mocked(useUser).mockReturnValue({
        uuid: 'admin-1',
        is_staff: false,
        is_support: true,
      } as any);
      renderTabs();

      expect(screen.getByText('Internal')).toBeInTheDocument();
    });
  });

  // ── Basic Info Tab ──────────────────────────────────────────────────────────

  describe('Basic info tab', () => {
    it('renders field labels for basic info', () => {
      renderTabs();

      expect(screen.getByText('First name')).toBeInTheDocument();
      expect(screen.getByText('Last name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Phone number')).toBeInTheDocument();
    });

    it('renders native name when attribute is enabled', () => {
      renderTabs();
      expect(screen.getByText('Native name')).toBeInTheDocument();
    });

    it('hides native name when attribute is disabled', () => {
      (ENV.plugins.WALDUR_CORE as any).ENABLED_USER_PROFILE_ATTRIBUTES =
        ALL_ATTRIBUTES.filter((attr) => attr !== 'native_name');
      renderTabs();

      expect(screen.queryByText('Native name')).not.toBeInTheDocument();
    });

    it('shows isSelf description when viewing own profile', () => {
      vi.mocked(useUser).mockReturnValue({
        uuid: 'user-1',
        is_staff: false,
        is_support: false,
      } as any);

      renderTabs(makeUser({ uuid: 'user-1' }));

      expect(
        screen.getByText('Display your first name on your profile'),
      ).toBeInTheDocument();
    });

    it('shows other-user description when viewing another user profile', () => {
      renderTabs(makeUser({ uuid: 'user-2' }));

      expect(
        screen.getByText("Display the user's first name on their profile"),
      ).toBeInTheDocument();
    });

    it('renders ChangeEmailButton', () => {
      renderTabs();
      expect(screen.getByTestId('change-email-btn')).toBeInTheDocument();
    });
  });

  // ── Personal Tab ────────────────────────────────────────────────────────────

  describe('Personal tab', () => {
    it('renders personal title, gender, birth date, place of birth', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Personal'));

      expect(screen.getByText('Personal title')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
      expect(screen.getByText('Birth date')).toBeInTheDocument();
      expect(screen.getByText('Place of birth')).toBeInTheDocument();
    });

    it('hides place of birth when that attribute is disabled', async () => {
      (ENV.plugins.WALDUR_CORE as any).ENABLED_USER_PROFILE_ATTRIBUTES =
        ALL_ATTRIBUTES.filter((attr) => attr !== 'place_of_birth');

      const user = userEvent.setup();
      renderTabs();
      await user.click(screen.getByText('Personal'));

      expect(screen.queryByText('Place of birth')).not.toBeInTheDocument();
    });
  });

  // ── Geographic Tab ──────────────────────────────────────────────────────────

  describe('Geographic tab', () => {
    it('renders country of residence, nationality, nationalities with flags and badges', async () => {
      const user = userEvent.setup();
      renderTabs(
        makeUser({
          country_of_residence: 'EE',
          nationality: 'FI',
          nationalities: ['EE', 'FI'],
        }),
      );

      await user.click(screen.getByText('Geographic'));

      expect(screen.getByText('Country of residence')).toBeInTheDocument();
      expect(screen.getAllByTestId('flag-EE')).toHaveLength(2); // One in residence, one in nationalities

      expect(screen.getByText('Nationality')).toBeInTheDocument();
      expect(screen.getAllByTestId('flag-FI')).toHaveLength(2); // One in nationality, one in nationalities

      expect(screen.getByText('Nationalities')).toBeInTheDocument();

      // Check for flags in nationalities
      const flags = screen.getAllByTestId(/flag-(EE|FI)/);
      // 1 (EE residence) + 1 (FI nationality) + 2 (EE, FI in nationalities) = 4
      expect(flags.length).toBeGreaterThanOrEqual(4);
    });

    it('hides nationality when attribute is disabled', async () => {
      (ENV.plugins.WALDUR_CORE as any).ENABLED_USER_PROFILE_ATTRIBUTES =
        ALL_ATTRIBUTES.filter((attr) => attr !== 'nationality');

      const user = userEvent.setup();
      renderTabs();
      await user.click(screen.getByText('Geographic'));

      expect(screen.queryByText('Nationality')).not.toBeInTheDocument();
    });
  });

  // ── Affiliation Tab ─────────────────────────────────────────────────────────

  describe('Affiliation tab', () => {
    it('renders organization name and job position', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Affiliation'));

      expect(screen.getByText('Organization name')).toBeInTheDocument();
      expect(screen.getByText('Job position')).toBeInTheDocument();
    });

    it('renders optional org fields when enabled', async () => {
      const user = userEvent.setup();
      renderTabs(makeUser({ organization_country: 'DE' }));

      await user.click(screen.getByText('Affiliation'));

      expect(screen.getByText('Organization country')).toBeInTheDocument();
      expect(screen.getByTestId('flag-DE')).toBeInTheDocument();
      expect(screen.getByText('Organization type')).toBeInTheDocument();
      expect(
        screen.getByText('Organization registry code'),
      ).toBeInTheDocument();
    });

    it('hides optional org fields when disabled', async () => {
      (ENV.plugins.WALDUR_CORE as any).ENABLED_USER_PROFILE_ATTRIBUTES =
        ALL_ATTRIBUTES.filter(
          (attr) =>
            ![
              'organization_country',
              'organization_type',
              'organization_registry_code',
            ].includes(attr),
        );
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Affiliation'));

      expect(
        screen.queryByText('Organization country'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Organization type')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Organization registry code'),
      ).not.toBeInTheDocument();
    });

    it('renders affiliations list when user has affiliations', async () => {
      const user = userEvent.setup();
      renderTabs(makeUser({ affiliations: ['CERN', 'MIT'] }));

      await user.click(screen.getByText('Affiliation'));

      expect(screen.getByText('Affiliations')).toBeInTheDocument();
      expect(screen.getByText('CERN, MIT')).toBeInTheDocument();
    });

    it('hides affiliations row when user has no affiliations', async () => {
      const user = userEvent.setup();
      renderTabs(makeUser({ affiliations: [] }));

      await user.click(screen.getByText('Affiliation'));

      expect(screen.queryByText('Affiliations')).not.toBeInTheDocument();
    });
  });

  // ── System Tab ──────────────────────────────────────────────────────────────

  describe('System tab', () => {
    it('renders username and date joined', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('System'));

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Date joined')).toBeInTheDocument();
    });

    it('renders User type row for staff/support viewing', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('System'));

      expect(screen.getByText('User type')).toBeInTheDocument();
    });

    it('hides User type row for regular users', async () => {
      vi.mocked(useUser).mockReturnValue({
        uuid: 'admin-1',
        is_staff: false,
        is_support: false,
      } as any);

      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('System'));

      expect(screen.queryByText('User type')).not.toBeInTheDocument();
    });

    it('renders civil number when present', async () => {
      const user = userEvent.setup();
      renderTabs(makeUser({ civil_number: 'CN-12345' }));

      await user.click(screen.getByText('System'));

      expect(screen.getByText('ID code')).toBeInTheDocument();
      expect(screen.getByText('CN-12345')).toBeInTheDocument();
    });

    it('hides civil number when absent', async () => {
      const user = userEvent.setup();
      renderTabs(makeUser({ civil_number: undefined }));

      await user.click(screen.getByText('System'));

      expect(screen.queryByText('ID code')).not.toBeInTheDocument();
    });

    it('renders eduperson assurance levels section when user has them', async () => {
      const user = userEvent.setup();
      renderTabs(
        makeUser({
          eduperson_assurance: ['https://refeds.org/assurance/IAP/low'],
        }),
      );

      await user.click(screen.getByText('System'));

      expect(screen.getByText('Assurance levels')).toBeInTheDocument();
    });
  });

  // ── Internal (Staff) Tab ────────────────────────────────────────────────────

  describe('Internal tab', () => {
    it('renders Notes and Notifications fields', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Internal'));

      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  // ── Tab Badges ──────────────────────────────────────────────────────────────

  describe('tab badges', () => {
    it('shows danger badge when required field is empty', () => {
      (ENV.plugins.WALDUR_CORE as any).USER_MANDATORY_FIELDS = ['first_name'];

      renderTabs(makeUser({ first_name: '' }));

      const dangerBadges = screen.getAllByTestId('tab-badge-danger');
      expect(dangerBadges.length).toBeGreaterThan(0);
      expect(dangerBadges[0]).toHaveTextContent('1');

      // Verify tooltip content using within to find the Tip mock
      const basicInfoTab = screen.getByRole('tab', { name: /Basic info/ });
      expect(within(basicInfoTab).getByTestId('tip-mock')).toHaveAttribute(
        'title',
        'Missing required fields: First name',
      );

      (ENV.plugins.WALDUR_CORE as any).USER_MANDATORY_FIELDS = [];
    });

    it('shows light badge with total field count on each tab', () => {
      renderTabs();

      const lightBadges = screen.getAllByTestId('tab-badge-total');
      expect(lightBadges.length).toBeGreaterThan(0);
    });

    it('shows badge-danger when MANDATORY_USER_ATTRIBUTES config has a missing field', () => {
      (ENV.plugins.WALDUR_CORE as any).MANDATORY_USER_ATTRIBUTES = ['email'];

      renderTabs(makeUser({ email: '' }));

      const dangerBadges = screen.getAllByTestId('tab-badge-danger');
      expect(dangerBadges.length).toBeGreaterThan(0);
      expect(dangerBadges[0]).toHaveTextContent('1');

      (ENV.plugins.WALDUR_CORE as any).MANDATORY_USER_ATTRIBUTES = [];
    });
  });

  // ── Disabled prop ────────────────────────────────────────────────────────────

  describe('disabled prop', () => {
    it('passes disabled to ChangeEmailButton when disabled=true', () => {
      renderTabs(makeUser(), true);

      expect(screen.getByTestId('change-email-btn')).toBeDisabled();
    });

    it('does not disable ChangeEmailButton when disabled=false', () => {
      renderTabs(makeUser(), false);

      expect(screen.getByTestId('change-email-btn')).not.toBeDisabled();
    });
  });

  // ── Extended Coverage ───────────────────────────────────────────────────────

  describe('Form Updates and Validation', () => {
    it('calls update callback when a field is changed', async () => {
      const user = userEvent.setup();
      renderTabs();

      // Trigger edit dialog
      await user.click(screen.getAllByTestId(/^edit-/)[0]);
      // The callback is in resolve.callback of the second argument of the first call to openDialog
      const callback = mockOpenDialog.mock.calls[0][1].resolve.callback;

      await act(async () => {
        await callback({ first_name: 'Jane' });
      });

      expect(mockUpdateUserCallback).toHaveBeenCalledWith({
        first_name: 'Jane',
      });
    });

    it('shows confirm dialog when clearing a field required by offerings', async () => {
      const user = userEvent.setup();
      vi.mocked(useProfileFieldWarnings).mockReturnValue({
        data: { first_name: [{ offering_name: 'Offering A' }] },
      } as any);
      mockConfirm.mockResolvedValue(true);

      renderTabs();

      // Trigger edit dialog
      await user.click(screen.getAllByTestId(/^edit-/)[0]);
      const callback = mockOpenDialog.mock.calls[0][1].resolve.callback;

      await act(async () => {
        await callback({ first_name: '' });
      });

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockUpdateUserCallback).toHaveBeenCalledWith({ first_name: '' });
    });

    it('does not call update callback if confirm dialog is cancelled', async () => {
      const user = userEvent.setup();
      vi.mocked(useProfileFieldWarnings).mockReturnValue({
        data: { first_name: [{ offering_name: 'Offering A' }] },
      } as any);
      mockConfirm.mockRejectedValue(null);

      renderTabs();

      // Trigger edit dialog
      await user.click(screen.getAllByTestId(/^edit-/)[0]);
      const callback = mockOpenDialog.mock.calls[0][1].resolve.callback;

      await act(async () => {
        await callback({ first_name: '' });
      });

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockUpdateUserCallback).not.toHaveBeenCalled();
    });
  });

  describe('Additional System Tab details', () => {
    it('renders slug field when feature is visible and user is staff', async () => {
      vi.mocked(isFeatureVisible).mockReturnValue(true);
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('System'));

      expect(screen.getByText('Shortname')).toBeInTheDocument();
    });

    it('renders eduperson assurance badges', async () => {
      const user = userEvent.setup();
      renderTabs(
        makeUser({
          eduperson_assurance: [
            'https://refeds.org/assurance/IAP/low',
            'https://refeds.org/assurance/IAP/medium',
          ],
        }),
      );

      await user.click(screen.getByText('System'));

      expect(screen.getByText('IAP Low')).toBeInTheDocument();
      expect(screen.getByText('IAP Medium')).toBeInTheDocument();
    });
  });

  describe('Staff Tab permissions', () => {
    it('disables Notifications toggle for support-only users', async () => {
      vi.mocked(useUser).mockReturnValue({
        uuid: 'admin-1',
        is_staff: false,
        is_support: true,
      } as any);

      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Internal'));

      // In StaffTab, notifications_enabled disabled={disabled || !isStaffUser}
      // and BooleanEditField with isStaffOnly renders read-only if not staff
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });
  });

  // ── Badge counts match rendered fields ───────────────────────────────────────
  // The tab count badge and the rendered fields are both derived from a single
  // per-tab descriptor list, so the badge must always equal the number of
  // fields shown. These guard against the count drifting out of sync (the
  // regression where Affiliation showed 5 for 7 fields and Internal showed 1
  // for 2 fields).

  describe('badge counts match rendered fields', () => {
    const getTabTotal = (name: RegExp) => {
      const tab = screen.getByRole('tab', { name });
      return within(tab).getByTestId('tab-badge-total').textContent;
    };

    beforeEach(() => {
      // The badge count is read from the tab title (rendered without activating
      // the panel). Pin the feature flag so slug visibility is deterministic
      // and not leaked from an earlier test's mockReturnValue.
      vi.mocked(isFeatureVisible).mockReturnValue(false);
    });

    it('counts all enabled organization fields incl. VAT code and address', () => {
      (ENV.plugins.WALDUR_CORE as any).ENABLED_USER_PROFILE_ATTRIBUTES = [
        ...ALL_ATTRIBUTES,
        'organization_vat_code',
        'organization_address',
      ];

      renderTabs(
        makeUser({
          organization_vat_code: 'VAT123',
          organization_address: '1 Main St',
        }),
      );

      // organization, country, type, registry, vat, address, job position = 7
      expect(getTabTotal(/Affiliation/)).toBe('7');
    });

    it('includes the affiliations row in the Affiliation count when present', () => {
      (ENV.plugins.WALDUR_CORE as any).ENABLED_USER_PROFILE_ATTRIBUTES = [
        ...ALL_ATTRIBUTES,
        'organization_vat_code',
        'organization_address',
      ];

      renderTabs(
        makeUser({
          organization_vat_code: 'VAT123',
          organization_address: '1 Main St',
          affiliations: ['CERN'],
        }),
      );

      expect(getTabTotal(/Affiliation/)).toBe('8');
    });

    it('counts Notes and Notifications on the Internal tab', () => {
      renderTabs();

      expect(getTabTotal(/Internal/)).toBe('2');
    });

    it('counts every visible System row for a staff viewer', () => {
      renderTabs(
        makeUser({
          civil_number: 'CN-1',
          eduperson_assurance: ['https://refeds.org/assurance/IAP/low'],
        }),
      );

      // username, assurance levels, date joined, user type, ID code = 5
      expect(getTabTotal(/System/)).toBe('5');
    });

    it('does not crash when eduperson_assurance is undefined', () => {
      expect(() =>
        renderTabs(makeUser({ eduperson_assurance: undefined })),
      ).not.toThrow();
    });
  });
});
