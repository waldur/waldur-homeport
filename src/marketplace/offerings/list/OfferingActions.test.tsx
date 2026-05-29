import { act, fireEvent, screen } from '@testing-library/react';
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
    renderOfferingActions();
    const dropdownButton = screen.getByRole('button');
    await act(async () => {
      await fireEvent.click(dropdownButton);
    });

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Preview order form')).toBeInTheDocument();
    expect(screen.getByText('Open public page')).toBeInTheDocument();
  });

  it('shows disabled delete action when offering is not in Draft state', async () => {
    renderOfferingActions();
    const dropdownButton = screen.getByRole('button');
    await act(async () => {
      await fireEvent.click(dropdownButton);
    });

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(
      screen.getByText('Delete').closest('.opacity-50'),
    ).toBeInTheDocument();
  });

  it('shows delete action for Draft offerings', async () => {
    renderOfferingActions({
      row: {
        uuid: 'offering_uuid',
        customer_uuid: 'customer_uuid',
        state: 'Draft',
        resources_count: 0,
      },
    });

    const dropdownButton = screen.getByRole('button');
    await act(async () => {
      await fireEvent.click(dropdownButton);
    });

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
