import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest';
import {
  customersAddUser,
  customersDeleteUser,
  customersUpdateUser,
  rolesList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import { getSelectByLabel, openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';
import { useCustomer } from '@/workspace/hooks';

import { EditUserDialog } from './EditUserDialog';

const mockCustomerUser = {
  uuid: 'user-uuid',
  full_name: 'Jane Smith',
  email: 'jane@example.com',
  username: 'jane',
  role_name: 'owner',
  expiration_time: '2024-12-31',
} as any;

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
    // The role picker now fetches the organization's roles via
    // available_for_customer (RoleGroup scope), so mock that list.
    vi.mocked(rolesList).mockResolvedValue(
      mockListResponse([
        {
          uuid: 'owner-role-uuid',
          name: 'owner',
          description: 'Owner',
          content_type: 'customer',
          is_active: true,
        },
        {
          uuid: 'manager-role-uuid',
          name: 'manager',
          description: 'Manager',
          content_type: 'customer',
          is_active: true,
        },
      ]) as any,
    );
  });

  it('renders dialog with correct title and user information', () => {
    renderDialog();

    expect(screen.getByText('Edit organization member')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes('Jane Smith')).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText((content) => content.includes('jane@example.com')),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes('jane')).length,
    ).toBeGreaterThan(0);
  });

  it('renders role selection with customer roles', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    // Manager only comes from the scoped fetch, so seeing it proves the roles
    // have loaded; while loading, the empty-state message is absent anyway.
    await user.click(within(getSelectByLabel('Role')).getByRole('combobox'));
    expect(
      await screen.findByRole('option', { name: /Manager/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/roles are available in this organization/),
    ).not.toBeInTheDocument();
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
      screen.getAllByText((content) => content.includes('Jane Smith')).length,
    ).toBeGreaterThan(0);
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
      screen.getAllByText((content) => content.includes('Jane Smith')).length,
    ).toBeGreaterThan(0);
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

  describe('member holds a role the picker does not offer', () => {
    const originalRoles = ENV.roles;

    afterEach(() => {
      ENV.roles = originalRoles;
    });

    // A deactivated role is still in the cache but filtered out of the picker;
    // an organization clone created after page load is not cached at all.
    it.each([
      {
        situation: 'the role is deactivated',
        cached: [
          {
            name: 'retired',
            description: 'Retired role',
            content_type: 'customer',
            is_active: false,
          },
        ],
        label: 'Retired role',
      },
      { situation: 'the role is not cached', cached: [], label: 'retired' },
    ])(
      'keeps it selected and saves the expiration when $situation',
      async ({ cached, label }) => {
        ENV.roles = [...originalRoles, ...(cached as any)];
        const user = userEvent.setup();
        vi.mocked(customersUpdateUser).mockResolvedValue({} as any);

        renderDialog({
          ...mockResolve,
          customer: { ...mockCustomerUser, role_name: 'retired' },
        });

        expect(screen.getByText(label)).toBeInTheDocument();
        const dateInput = screen.getByDisplayValue('2024-12-31');
        await user.clear(dateInput);
        await user.type(dateInput, '2025-12-31');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
          expect(customersUpdateUser).toHaveBeenCalledWith(
            expect.objectContaining({
              body: expect.objectContaining({
                user: 'user-uuid',
                role: 'retired',
                expiration_time: '2025-12-31',
              }),
            }),
          );
        });
        expect(customersDeleteUser).not.toHaveBeenCalled();
        expect(customersAddUser).not.toHaveBeenCalled();
      },
    );

    // Switching away and back must not revoke the grant: the picker has to keep
    // offering the held role, and an unchanged role saves as an update.
    it('offers the held role again after another one was picked', async () => {
      const user = userEvent.setup();
      vi.mocked(customersUpdateUser).mockResolvedValue({} as any);

      renderDialog({
        ...mockResolve,
        customer: { ...mockCustomerUser, role_name: 'retired' },
      });

      await openAndSelectOption(user, 'Role', 'Manager');
      await openAndSelectOption(user, 'Role', 'retired');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(customersUpdateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({ role: 'retired' }),
          }),
        );
      });
      expect(customersDeleteUser).not.toHaveBeenCalled();
      expect(customersAddUser).not.toHaveBeenCalled();
    });

    // The held role stays selected, so "no roles" would read as if the member
    // could not be edited at all.
    it('says no other role is available when the organization offers none', async () => {
      vi.mocked(rolesList).mockResolvedValue(mockListResponse([]) as any);

      renderDialog({
        ...mockResolve,
        customer: { ...mockCustomerUser, role_name: 'retired' },
      });

      expect(
        await screen.findByText(
          'No other roles are available in this organization. Ask staff to reveal a concealed role or reactivate one.',
        ),
      ).toBeInTheDocument();
    });

    // The fallback role is a fresh object, and final-form reinitializes when
    // initialValues stop being shallow-equal, wiping what the user typed.
    it('keeps a typed expiration when the dialog re-renders', async () => {
      const user = userEvent.setup();
      const resolve = {
        ...mockResolve,
        customer: { ...mockCustomerUser, role_name: 'retired' },
      };

      const { rerender } = renderDialog(resolve);
      const dateInput = screen.getByDisplayValue('2024-12-31');
      await user.clear(dateInput);
      await user.type(dateInput, '2025-12-31');
      rerender(<EditUserDialog resolve={resolve} />);

      expect(screen.getByDisplayValue('2025-12-31')).toBeInTheDocument();
    });
  });

  it('explains an empty role picker when the organization has no roles', async () => {
    vi.mocked(rolesList).mockResolvedValue(mockListResponse([]) as any);

    renderDialog({
      ...mockResolve,
      customer: { ...mockCustomerUser, role_name: null },
    });

    expect(
      await screen.findByText(
        'No roles are available in this organization. Ask staff to reveal a concealed role or reactivate one.',
      ),
    ).toBeInTheDocument();
  });

  it('says so when the organization roles fail to load', async () => {
    vi.mocked(rolesList).mockRejectedValue(new Error('Network error'));

    renderDialog();

    expect(
      await screen.findByText('Unable to load roles.'),
    ).toBeInTheDocument();
  });
});
