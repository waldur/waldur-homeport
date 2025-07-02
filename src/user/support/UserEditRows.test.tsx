import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@waldur/core/config';
import * as features from '@waldur/features/connect';
import * as config from '@waldur/store/config';

import { UserEditRows } from './UserEditRows';

// Mock dependencies
vi.mock('@waldur/i18n', () => ({
  translate: (key) => key,
}));

vi.mock('@waldur/features/connect');
vi.mock('@waldur/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        USER_MANDATORY_FIELDS: [],
        PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS: [],
      },
    },
  },
}));
vi.mock('@waldur/store/config', () => ({
  getNativeNameVisible: vi.fn(),
}));
vi.mock('@waldur/user/support/selectors', () => ({
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
  const mockStore = configureStore();
  const store = mockStore({
    workspace: {
      user: currentUser,
    },
  });
  return render(
    <Provider store={store}>
      <UserEditRows user={user as any} />
    </Provider>,
  );
};

describe('UserEditRows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(features.isFeatureVisible).mockReturnValue(true);
    vi.mocked(config.getNativeNameVisible).mockReturnValue(true);
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
      vi.mocked(config.getNativeNameVisible).mockReturnValue(true);
      renderComponent();
      expect(
        screen.getByRole('columnheader', { name: /native name/i }),
      ).toBeInTheDocument();
    });

    it('hides native name when feature is disabled', () => {
      vi.mocked(config.getNativeNameVisible).mockReturnValue(false);
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

    it('hides civil number when not provided', () => {
      renderComponent({
        ...mockUser,
        civil_number: null,
      });
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
    it('shows required message for mandatory fields', () => {
      vi.mocked(ENV).plugins.WALDUR_CORE.USER_MANDATORY_FIELDS = [
        'first_name',
        'email',
      ];

      renderComponent();
      expect(screen.getAllByTestId('warning').length).toBe(2);
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
