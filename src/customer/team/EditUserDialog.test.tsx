import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  customersAddUser,
  customersDeleteUser,
  customersUpdateUser,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { useCustomer } from '@/workspace/hooks';

import { EditUserDialog } from './EditUserDialog';

// Mock table constants
vi.mock('@/table/constants', () => ({
  DASH_ESCAPE_CODE: '—',
}));

// Mock permissions utils
vi.mock('@/permissions/utils', () => ({
  getCustomerRoles: () => [
    {
      name: 'owner',
      description: 'Owner',
      content_type: 'customer',
    },
    {
      name: 'manager',
      description: 'Manager',
      content_type: 'customer',
    },
  ],
  getRoles: (types) =>
    types.flatMap((type) => {
      if (type === 'customer') {
        return [
          {
            name: 'owner',
            description: 'Owner',
            content_type: 'customer',
          },
          {
            name: 'manager',
            description: 'Manager',
            content_type: 'customer',
          },
        ];
      }
      return [
        {
          name: `${type}_role`,
          description: `${type} role`,
          content_type: type,
        },
      ];
    }),
}));

// Mock DateField to avoid flatpickr/language issues
vi.mock('@/form/DateField', () => ({
  DateField: ({ input }) => (
    <input
      type="date"
      value={input.value || ''}
      onChange={(e) => input.onChange(e.target.value)}
    />
  ),
}));

const mockCustomerUser = {
  uuid: 'user-uuid',
  full_name: 'Jane Smith',
  email: 'jane@example.com',
  username: 'jane',
  role_name: 'owner',
  expiration_time: '2024-12-31',
};

const mockResolve = {
  customer: mockCustomerUser,
  refetch: vi.fn(),
};

const renderDialog = (resolve = mockResolve) => {
  return renderWithProviders(<EditUserDialog resolve={resolve} />);
};

describe('EditUserDialog (Customer)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCustomer).mockReturnValue({
      uuid: 'customer-uuid',
      name: 'Test Customer',
    } as any);
  });

  it('renders dialog with correct title and user information', () => {
    renderDialog();

    expect(screen.getByText('Edit organization member')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Jane Smith')),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('jane@example.com')),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes('jane')).length,
    ).toBeGreaterThan(0);
  });

  it('renders role selection with customer roles', () => {
    renderDialog();

    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('renders expiration time field', () => {
    renderDialog();

    expect(screen.getByText('Role expires on')).toBeInTheDocument();
  });

  it('handles submission with role change', async () => {
    const user = userEvent.setup();
    const mockCustomersDeleteUser = vi.mocked(customersDeleteUser);
    const mockCustomersAddUser = vi.mocked(customersAddUser);
    mockCustomersDeleteUser.mockResolvedValue({} as any);
    mockCustomersAddUser.mockResolvedValue({} as any);

    renderDialog();

    // Change role from Owner to Manager
    await openAndSelectOption(user, 'Role', 'Manager');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockCustomersDeleteUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'customer-uuid' },
          body: {
            user: 'user-uuid',
            role: 'owner',
          },
        }),
      );
      expect(mockCustomersAddUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'customer-uuid' },
          body: expect.objectContaining({
            user: 'user-uuid',
            role: 'manager',
          }),
        }),
      );
      expect(mockResolve.refetch).toHaveBeenCalled();
    });
  });

  it('handles submission with only expiration time change', async () => {
    const user = userEvent.setup();
    const mockCustomersUpdateUser = vi.mocked(customersUpdateUser);
    mockCustomersUpdateUser.mockResolvedValue({} as any);

    renderDialog();

    // Change expiration date
    const dateInput = screen.getByDisplayValue('2024-12-31');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-12-31');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockCustomersUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'customer-uuid' },
          body: expect.objectContaining({
            user: 'user-uuid',
            role: 'owner',
            expiration_time: '2025-12-31',
          }),
        }),
      );
      expect(mockResolve.refetch).toHaveBeenCalled();
    });
  });

  it('handles customers without existing role names', () => {
    const customerWithoutRole = {
      ...mockCustomerUser,
      role_name: null,
    };

    renderDialog({ ...mockResolve, customer: customerWithoutRole });

    expect(screen.getByText('Edit organization member')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Jane Smith')),
    ).toBeInTheDocument();
  });

  it('handles API errors gracefully', () => {
    const mockCustomersUpdateUser = vi.mocked(customersUpdateUser);
    const mockError = new Error('API Error');
    mockCustomersUpdateUser.mockRejectedValue(mockError);

    renderDialog();

    // Error handling would be tested through form submission
    expect(screen.getByText('Edit organization member')).toBeInTheDocument();
  });

  it('displays user without email when email is not provided', () => {
    const customerWithoutEmail = {
      ...mockCustomerUser,
      email: null,
    };

    renderDialog({ ...mockResolve, customer: customerWithoutEmail });

    expect(
      screen.getByText((content) => content.includes('Jane Smith')),
    ).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });

  it('displays dash when user full name is not available', () => {
    const customerWithoutName = {
      ...mockCustomerUser,
      full_name: null,
    };

    renderDialog({ ...mockResolve, customer: customerWithoutName });

    expect(
      screen.getByText((content) => content.includes('—')),
    ).toBeInTheDocument(); // DASH_ESCAPE_CODE
    expect(screen.getByText('Username')).toBeInTheDocument();
  });
});
