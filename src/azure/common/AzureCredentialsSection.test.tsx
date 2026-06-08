import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateIntegration } from 'waldur-js-client';

import { EditFieldDialog } from '@/form/EditFieldDialog';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { AzureCredentialsSection } from './AzureCredentialsSection';

describe('AzureCredentialsSection', () => {
  it('renders all Azure credential fields with their values', () => {
    const offering = {
      service_attributes: {
        subscription_id: 'test-subscription-id',
        tenant_id: 'test-tenant-id',
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
      },
    } as any;

    renderWithProviders(
      <AzureCredentialsSection offering={offering} refetch={vi.fn()} />,
    );

    // Renders the labels for all fields
    expect(screen.getByText('Subscription ID')).toBeInTheDocument();
    expect(screen.getByText('Tenant ID')).toBeInTheDocument();
    expect(screen.getByText('Client ID')).toBeInTheDocument();
    expect(screen.getByText('Client secret')).toBeInTheDocument();

    // Verify the values render in the display
    expect(screen.getByText('test-subscription-id')).toBeInTheDocument();
    expect(screen.getByText('test-tenant-id')).toBeInTheDocument();
    expect(screen.getByText('test-client-id')).toBeInTheDocument();
    expect(screen.getByText('test-client-secret')).toBeInTheDocument();
  });

  it.each([
    [
      'Subscription ID',
      'subscription_id',
      'aaaaaaaa-bbbb-1ccc-8ddd-eeeeeeeeeeee',
    ],
    ['Tenant ID', 'tenant_id', 'bbbbbbbb-cccc-1ddd-8eee-ffffffffffff'],
    ['Client ID', 'client_id', 'cccccccc-dddd-1eee-8fff-aaaaaaaaaaaa'],
    ['Client secret', 'client_secret', 'my-new-secret'],
  ])(
    'calls SDK update method when edit dialog is submitted for %s',
    async (label, fieldKey, newValue) => {
      const user = userEvent.setup();

      const offering = {
        uuid: 'test-offering-uuid',
        type: 'Azure.Provider',
        service_attributes: {
          subscription_id: 'aaaaaaaa-bbbb-1ccc-8ddd-111111111111',
          tenant_id: 'bbbbbbbb-cccc-1ddd-8eee-111111111111',
          client_id: 'cccccccc-dddd-1eee-8fff-111111111111',
          client_secret: 'test-client-secret',
        },
      } as any;

      renderWithProviders(
        <AzureCredentialsSection offering={offering} refetch={vi.fn()} />,
      );

      const { openDialog } = useModal();
      vi.mocked(
        marketplaceProviderOfferingsUpdateIntegration,
      ).mockResolvedValue({
        data: offering,
      } as any);

      vi.mocked(openDialog).mockClear();
      vi.mocked(marketplaceProviderOfferingsUpdateIntegration).mockClear();

      const labelElement = screen.getByText(label);
      // eslint-disable-next-line testing-library/no-node-access
      const rowElement = labelElement.closest('tr');
      const editButton = within(rowElement as HTMLElement).getByTestId(
        'compact-edit-button',
      );

      await user.click(editButton);
      expect(openDialog).toHaveBeenCalledTimes(1);

      const resolveProps = vi.mocked(openDialog).mock.calls[0][1].resolve;
      // Render the dialog separately to interact with it
      renderWithProviders(<EditFieldDialog resolve={resolveProps} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, newValue);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      await user.click(confirmButton);

      // EditFieldDialog sends only the changed field via set({}, name, value)
      expect(
        marketplaceProviderOfferingsUpdateIntegration,
      ).toHaveBeenCalledWith({
        path: { uuid: 'test-offering-uuid' },
        body: { service_attributes: { [fieldKey as string]: newValue } },
      });
    },
  );
});
