import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { describe, expect, it, vi } from 'vitest';
import { User } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { OfferingActions } from './OfferingActions';

ENV.plugins.WALDUR_CORE.ALLOW_SERVICE_PROVIDER_OFFERING_MANAGEMENT = true;

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
}));

vi.mocked(useCurrentStateAndParams).mockReturnValue({
  state: {
    data: {
      workspace: 'admin',
    },
  },
} as any);

vi.mocked(workspaceHooks.useUser).mockReturnValue({
  uuid: 'user_uuid',
} as User);

const renderOfferingActions = (props?) => {
  return renderWithProviders(
    <OfferingActions
      row={{
        uuid: 'offering_uuid',
        customer_uuid: 'customer_uuid',
        state: 'Active',
        resources_count: 0,
      }}
      refetch={() => {}}
      {...props}
    />,
  );
};

describe('OfferingActions', () => {
  it('renders actions dropdown button', () => {
    renderOfferingActions();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows all available actions when dropdown is clicked', async () => {
    const user = userEvent.setup();
    renderOfferingActions();
    const dropdownButton = screen.getByRole('button');
    await user.click(dropdownButton);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Preview order form')).toBeInTheDocument();
    expect(screen.getByText('Open public page')).toBeInTheDocument();
  });

  it('shows disabled delete action when offering is not in Draft state', async () => {
    const user = userEvent.setup();
    renderOfferingActions();
    const dropdownButton = screen.getByRole('button');
    await user.click(dropdownButton);

    expect(screen.getByText('Delete')).toBeInTheDocument();
    const deleteAction = screen
      .getAllByTestId('action-item-content')
      .find((el) => el.textContent?.includes('Delete'));
    expect(deleteAction).toHaveClass('opacity-50');
  });

  it('shows delete action for Draft offerings', async () => {
    const user = userEvent.setup();
    renderOfferingActions({
      row: {
        uuid: 'offering_uuid',
        customer_uuid: 'customer_uuid',
        state: 'Draft',
        resources_count: 0,
      },
    });

    const dropdownButton = screen.getByRole('button');
    await user.click(dropdownButton);

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
