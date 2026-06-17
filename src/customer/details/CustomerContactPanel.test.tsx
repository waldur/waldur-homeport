import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customersContact } from 'waldur-js-client';

import { EditFieldDialog } from '@/form/EditFieldDialog';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { renderWithProviders } from '@/test/harness';
import { useSetCustomer, useUser } from '@/workspace/hooks';

import { CustomerContactPanel } from './CustomerContactPanel';

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
}));

const mockCustomer = {
  uuid: 'customer-uuid',
  email: 'old@example.com',
  phone_number: '',
  contact_details: '',
  homepage: '',
  notification_emails: [],
} as any;

// The panel is typed as a tab-slot component, so the shared `callback` prop is
// required by the interface even though this panel owns its own persistence and
// ignores it — mirror the real tab system by passing a stub.
const renderPanel = (customer = mockCustomer) =>
  renderWithProviders(
    <CustomerContactPanel customer={customer} callback={vi.fn()} />,
  );

describe('CustomerContactPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    vi.mocked(useSetCustomer).mockReturnValue(vi.fn());
    vi.mocked(hasPermission).mockReturnValue(true);
  });

  it('renders all contact field labels', () => {
    renderPanel();

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone number')).toBeInTheDocument();
    expect(screen.getByText('Contact details')).toBeInTheDocument();
    expect(screen.getByText('Homepage')).toBeInTheDocument();
    expect(screen.getByText('Notification emails')).toBeInTheDocument();
  });

  describe('permissions', () => {
    it('gates edit buttons on the CONTACT_UPDATE permission', () => {
      renderPanel();

      expect(hasPermission).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          permission: PermissionEnum.CUSTOMER_CONTACT_UPDATE,
          customerId: 'customer-uuid',
        }),
      );
    });

    it('shows edit buttons when the user may update contact details', () => {
      vi.mocked(hasPermission).mockReturnValue(true);
      renderPanel();

      const editButtons = screen.getAllByTestId('compact-edit-button');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('hides edit buttons when the user may not update contact details', () => {
      vi.mocked(hasPermission).mockReturnValue(false);
      renderPanel();

      const table = screen.getByRole('table');
      expect(table).toHaveClass('hide-actions');
    });
  });

  describe('edit flow', () => {
    it('saves through the dedicated contact endpoint and merges the result', async () => {
      const user = userEvent.setup();
      const { openDialog } = useModal();
      const setCustomer = vi.fn();
      vi.mocked(useSetCustomer).mockReturnValue(setCustomer);

      vi.mocked(customersContact).mockResolvedValue({
        data: { email: 'new@example.com' },
      } as any);

      renderPanel();

      vi.mocked(openDialog).mockClear();

      const labelElement = screen.getByText('Email');
      // eslint-disable-next-line testing-library/no-node-access
      const rowElement = labelElement.closest('tr');
      const editButton = within(rowElement as HTMLElement).getByTestId(
        'compact-edit-button',
      );

      await user.click(editButton);
      const resolveProps = vi.mocked(openDialog).mock.calls[0][1].resolve;
      expect(resolveProps.name).toBe('email');

      renderWithProviders(<EditFieldDialog resolve={resolveProps} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'new@example.com');

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      await waitFor(() => expect(confirmButton).toBeEnabled());
      await user.click(confirmButton);

      await waitFor(() => {
        expect(customersContact).toHaveBeenCalledWith({
          path: { uuid: 'customer-uuid' },
          body: expect.objectContaining({ email: 'new@example.com' }),
        });
      });

      // The contact endpoint returns only contact fields, so the panel must
      // merge them onto the existing customer instead of replacing it.
      await waitFor(() => {
        expect(setCustomer).toHaveBeenCalledWith(
          expect.objectContaining({
            uuid: 'customer-uuid',
            email: 'new@example.com',
          }),
        );
      });
    });
  });
});
