import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import * as features from '@/features/connect';
import * as workspaceHooks from '@/workspace/hooks';

import * as profileAttributes from './profileAttributes';
import { UserEditRows } from './UserEditRows';
vi.mock('@/workspace/hooks');

// Mock dependencies

vi.mock('@/features/connect');
vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        USER_MANDATORY_FIELDS: [],
        PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS: [],
        ENABLED_USER_PROFILE_ATTRIBUTES: [],
      },
    },
  },
}));
vi.mock('./profileAttributes', () => ({
  isProfileAttributeEnabled: vi.fn(),
}));
vi.mock('@/user/support/selectors', () => ({
  isRequired: () => false,
}));

const mockUser = {
  uuid: 'user-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  identity_provider_fields: [],
  registration_method: 'default',
  date_joined: '2023-01-01',
  description: 'Test user',
  phone_number: '+1234567890',
  organization: 'Test Org',
  job_title: 'Developer',
  affiliations: ['Group 1', 'Group 2'],
  civil_number: '12345',
  native_name: 'Native name',
};

// Add test utils
const renderComponent = (
  user = mockUser,
  currentUser = {
    uuid: 'other-user',
    is_staff: false,
  },
) => {
  vi.mocked(workspaceHooks.useUser).mockReturnValue(currentUser as any);
  return render(
    <table>
      <tbody>
        <UserEditRows user={user as any} />
      </tbody>
    </table>,
  );
};

describe('UserEditRows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(features.isFeatureVisible).mockReturnValue(true);
    vi.mocked(profileAttributes.isProfileAttributeEnabled).mockReturnValue(
      true,
    );
  });

  describe('Field visibility', () => {
    it('renders all fields for a complete user profile', () => {
      renderComponent();
      expect(screen.getByText('First name')).toBeInTheDocument();
      expect(screen.getByText('Last name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Phone number')).toBeInTheDocument();
      expect(screen.getByText('Organization name')).toBeInTheDocument();
      expect(screen.getByText('Job position')).toBeInTheDocument();
    });

    it('shows native name when feature is enabled', () => {
      vi.mocked(profileAttributes.isProfileAttributeEnabled).mockImplementation(
        (attr) => attr === 'native_name',
      );
      renderComponent();
      expect(
        screen.getByRole('columnheader', { name: /native name/i }),
      ).toBeInTheDocument();
    });

    it('hides native name when feature is disabled', () => {
      vi.mocked(profileAttributes.isProfileAttributeEnabled).mockImplementation(
        (attr) => attr !== 'native_name',
      );
      renderComponent();
      expect(screen.queryByText('Native name')).not.toBeInTheDocument();
    });

    it('displays correct values for user fields', () => {
      renderComponent(mockUser, { is_staff: true } as any);
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('displays affiliations when present', () => {
      renderComponent();
      expect(screen.getByText('Group 1, Group 2')).toBeInTheDocument();
    });

    it('hides civil number when profile attribute is disabled', () => {
      vi.mocked(profileAttributes.isProfileAttributeEnabled).mockImplementation(
        (attr) => attr !== 'civil_number',
      );
      renderComponent();
      expect(screen.queryByText('ID code')).not.toBeInTheDocument();
    });
  });

  describe('Protected fields', () => {
    it('marks fields as protected when they come from identity provider', () => {
      renderComponent({
        ...mockUser,
        identity_provider_fields: ['first_name', 'last_name'],
      });
      for (const field of ['first_name', 'last_name']) {
        const button = screen.getByTestId(`user-edit-row-${field}`);
        expect(button).toHaveClass('disabled');
      }
    });

    it('marks fields as protected based on registration method', () => {
      vi.mocked(
        ENV,
      ).plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS = [
        'eduGAIN',
      ];

      renderComponent({
        ...mockUser,
        registration_method: 'eduGAIN',
      });
      for (const field of ['first_name', 'last_name']) {
        const button = screen.getByTestId(`user-edit-row-${field}`);
        expect(button).toHaveClass('disabled');
      }
    });
  });

  describe('Mandatory fields', () => {
    it('shows asterisk for required fields', () => {
      vi.mocked(ENV).plugins.WALDUR_CORE.USER_MANDATORY_FIELDS = [
        'first_name',
        'email',
      ];

      renderComponent();
      // Required fields show asterisk in label
      const requiredIndicators = document.querySelectorAll('.text-danger.ms-1');
      expect(requiredIndicators.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Staff/support specific features', () => {
    it('shows additional fields for staff users', () => {
      renderComponent(mockUser, { is_staff: true } as any);
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('User type')).toBeInTheDocument();
    });

    it('hides staff-only fields for regular users', () => {
      renderComponent(mockUser, { is_staff: false } as any);
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
      expect(screen.queryByText('User type')).not.toBeInTheDocument();
    });
  });

  it('shows different descriptions for self vs other users', () => {
    renderComponent(mockUser, mockUser as any);
    expect(
      screen.getByText('Display your first name on your profile'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Display the user's first name on their profile"),
    ).not.toBeInTheDocument();
  });
});
