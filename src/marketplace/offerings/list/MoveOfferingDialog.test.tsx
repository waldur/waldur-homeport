import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customersList,
  marketplaceProviderOfferingsMoveOffering,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { typeAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { MoveOfferingDialog } from './MoveOfferingDialog';

const mockOffering = {
  uuid: 'offering-uuid',
  name: 'Test Offering',
};

const mockOrganization = {
  name: 'New Org',
  url: 'http://example.com/customers/org-uuid/',
};

const renderComponent = () => {
  return renderWithProviders(
    <MoveOfferingDialog
      resolve={{
        offering: mockOffering,
        refetch: vi.fn(),
      }}
    />,
  );
};

describe('MoveOfferingDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customersList).mockResolvedValue(
      mockListResponse([mockOrganization]),
    );
  });

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Move offering Test Offering')).toBeInTheDocument();
    expect(screen.getByText('Move to service provider')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Preserve offering permissions'),
    ).not.toBeChecked();
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    const mockMove = vi
      .mocked(marketplaceProviderOfferingsMoveOffering)
      .mockResolvedValue({} as any);

    renderComponent();

    await typeAndSelectOption(
      user,
      'Move to service provider',
      'New',
      /New Org/,
    );
    await user.click(screen.getByLabelText('Preserve offering permissions'));

    const submitButton = screen.getByRole('button', { name: 'Save' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMove).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: {
            customer: mockOrganization.url,
            preserve_permissions: true,
          },
        }),
      );
    });
  });

  it('validates required organization', () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: 'Save' });
    expect(submitButton).toBeDisabled();
  });
});
