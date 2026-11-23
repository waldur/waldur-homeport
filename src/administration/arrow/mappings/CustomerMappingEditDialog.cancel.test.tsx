import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.unmock('@/modal/actions');
vi.unmock('../../../../packages/ui/src/Dialog/modalContext');

import { useModal } from '@/modal/actions';
import { ModalProvider } from '@/modal/ModalContext';
import { ModalRoot } from '@/modal/ModalRoot';
import { renderWithProviders } from '@/test/harness';

import { CustomerMappingEditDialog } from './CustomerMappingEditDialog';

const mapping = {
  uuid: 'mapping-uuid',
  arrow_reference: 'ARROW-123',
  arrow_company_name: 'Arrow Company',
  waldur_customer: 'https://example.com/api/customers/customer-uuid/',
  waldur_customer_uuid: 'customer-uuid',
  waldur_customer_name: 'Waldur Customer',
  is_active: true,
} as any;

const Opener = () => {
  const { openDialog } = useModal();
  return (
    <button
      type="button"
      onClick={() =>
        openDialog(CustomerMappingEditDialog, {
          resolve: { mapping, refetch: vi.fn() },
        })
      }
    >
      Open
    </button>
  );
};

describe('CustomerMappingEditDialog Cancel', () => {
  it('closes the dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ModalProvider>
        <Opener />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      await screen.findByText('Edit Customer Mapping'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() =>
      expect(
        screen.queryByText('Edit Customer Mapping'),
      ).not.toBeInTheDocument(),
    );
  });
});
