import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customersPartialUpdate } from 'waldur-js-client';

import { EditFieldDialog } from '@/form/EditFieldDialog';
import { useModal } from '@/modal/actions';
import { hasPermission } from '@/permissions/hasPermission';
import { renderWithProviders } from '@/test/harness';
import { useSetCustomer, useUser } from '@/workspace/hooks';

import { CustomerMembershipRestrictionsPanel } from './CustomerMembershipRestrictionsPanel';

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
}));

const mockCustomer = {
  uuid: 'customer-uuid',
  user_email_patterns: ['@example.com', '@test.org'],
  user_affiliations: ['staff'],
  user_identity_sources: [],
  user_nationalities: ['US'],
  user_organization_types: [],
  user_assurance_levels: ['low', 'medium'],
} as any;

const renderPanel = (customer = mockCustomer) =>
  renderWithProviders(
    <CustomerMembershipRestrictionsPanel customer={customer} />,
  );

describe('CustomerMembershipRestrictionsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    vi.mocked(useSetCustomer).mockReturnValue(vi.fn());
    vi.mocked(hasPermission).mockReturnValue(true);
  });

  describe('field labels', () => {
    it('renders all 6 restriction field labels', () => {
      renderPanel();

      expect(screen.getByText('Email patterns')).toBeInTheDocument();
      expect(screen.getByText('User affiliations')).toBeInTheDocument();
      expect(screen.getByText('Identity sources')).toBeInTheDocument();
      expect(screen.getByText('Nationalities')).toBeInTheDocument();
      expect(screen.getByText('Organization types')).toBeInTheDocument();
      expect(screen.getByText('Assurance levels')).toBeInTheDocument();
    });
  });

  describe('field values', () => {
    it('renders configured restriction values as badges', () => {
      renderPanel();

      expect(screen.getByText('@example.com')).toBeInTheDocument();
      expect(screen.getByText('@test.org')).toBeInTheDocument();
      expect(screen.getByText('staff')).toBeInTheDocument();
      expect(screen.getByText('US')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('renders empty state message for unconfigured fields', () => {
      renderPanel();

      // user_identity_sources and user_organization_types are empty
      const emptyMessages = screen.getAllByText('No restrictions configured');
      expect(emptyMessages.length).toBeGreaterThanOrEqual(2);
    });

    it('renders all fields as empty when customer has no restrictions', () => {
      const emptyCustomer = {
        uuid: 'customer-uuid',
        user_email_patterns: [],
        user_affiliations: [],
        user_identity_sources: [],
        user_nationalities: [],
        user_organization_types: [],
        user_assurance_levels: [],
      } as any;

      renderPanel(emptyCustomer);

      const emptyMessages = screen.getAllByText('No restrictions configured');
      expect(emptyMessages).toHaveLength(6);
    });
  });

  describe('permissions', () => {
    it('shows edit buttons when user has UPDATE_CUSTOMER permission', () => {
      vi.mocked(hasPermission).mockReturnValue(true);
      renderPanel();

      const editButtons = screen.getAllByTestId('compact-edit-button');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('hides edit buttons when user lacks UPDATE_CUSTOMER permission', () => {
      vi.mocked(hasPermission).mockReturnValue(false);
      renderPanel();

      const table = screen.getByRole('table');
      expect(table).toHaveClass('hide-actions');
    });

    it('calls hasPermission with the correct customer uuid', () => {
      renderPanel();

      expect(hasPermission).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ customerId: 'customer-uuid' }),
      );
    });
  });

  describe('edit flow', () => {
    it.each([
      ['Email patterns', 'user_email_patterns', '@newpattern.com'],
      ['User affiliations', 'user_affiliations', 'researcher'],
      ['Identity sources', 'user_identity_sources', 'saml'],
      ['Nationalities', 'user_nationalities', 'DE'],
      ['Organization types', 'user_organization_types', 'university'],
      ['Assurance levels', 'user_assurance_levels', 'high'],
    ])(
      'calls SDK when edit dialog is submitted for %s',
      async (label, fieldKey, newValue) => {
        const user = userEvent.setup();
        const { openDialog } = useModal();
        const setCustomer = vi.fn();
        vi.mocked(useSetCustomer).mockReturnValue(setCustomer);

        vi.mocked(customersPartialUpdate).mockResolvedValue({
          data: { ...mockCustomer, [fieldKey]: [newValue] },
        } as any);

        renderPanel();

        vi.mocked(openDialog).mockClear();
        vi.mocked(customersPartialUpdate).mockClear();

        const labelElement = screen.getByText(label);
        // eslint-disable-next-line testing-library/no-node-access
        const rowElement = labelElement.closest('tr');
        const editButton = within(rowElement as HTMLElement).getByTestId(
          'compact-edit-button',
        );

        await user.click(editButton);
        expect(openDialog).toHaveBeenCalledTimes(1);

        const resolveProps = vi.mocked(openDialog).mock.calls[0][1].resolve;
        expect(resolveProps.name).toBe(fieldKey);

        renderWithProviders(<EditFieldDialog resolve={resolveProps} />);

        const input = screen.getByRole('textbox');
        await user.clear(input);
        await user.type(input, newValue);

        const confirmButton = screen.getByRole('button', { name: 'Confirm' });
        await waitFor(() => expect(confirmButton).toBeEnabled());
        await user.click(confirmButton);

        await waitFor(() => {
          expect(customersPartialUpdate).toHaveBeenCalledWith({
            path: { uuid: 'customer-uuid' },
            body: expect.anything(),
          });
        });
      },
    );

    it('calls setCustomer with updated data on success', async () => {
      const user = userEvent.setup();
      const { openDialog } = useModal();
      const setCustomer = vi.fn();
      vi.mocked(useSetCustomer).mockReturnValue(setCustomer);

      const updatedCustomer = {
        ...mockCustomer,
        user_affiliations: ['admin'],
      };
      vi.mocked(customersPartialUpdate).mockResolvedValue({
        data: updatedCustomer,
      } as any);

      renderPanel();

      vi.mocked(openDialog).mockClear();

      const labelElement = screen.getByText('User affiliations');
      // eslint-disable-next-line testing-library/no-node-access
      const rowElement = labelElement.closest('tr');
      const editButton = within(rowElement as HTMLElement).getByTestId(
        'compact-edit-button',
      );

      await user.click(editButton);
      const resolveProps = vi.mocked(openDialog).mock.calls[0][1].resolve;

      renderWithProviders(<EditFieldDialog resolve={resolveProps} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'admin');

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      await waitFor(() => expect(confirmButton).toBeEnabled());
      await user.click(confirmButton);

      await waitFor(() => {
        expect(setCustomer).toHaveBeenCalledWith(updatedCustomer);
      });
    });
  });
});
