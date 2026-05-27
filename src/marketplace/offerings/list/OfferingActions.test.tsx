import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { translate } from '@/i18n';
import * as workspaceHooks from '@/workspace/hooks';

import { OfferingActions } from './OfferingActions';
vi.mock('@/workspace/hooks');

vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        ALLOW_SERVICE_PROVIDER_OFFERING_MANAGEMENT: true,
      },
    },
  },
}));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
}));

vi.mock('@uirouter/react', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@uirouter/react')>();
  return {
    ...mod,
    useRouter: vi.fn(),
    useCurrentStateAndParams: () => ({
      state: {
        data: {
          workspace: 'admin',
        },
      },
    }),
  };
});

const renderOfferingActions = (props?) => {
  const queryClient = new QueryClient();
  vi.mocked(workspaceHooks.useUser).mockReturnValue({
    uuid: 'user_uuid',
  } as any);
  return render(
    <QueryClientProvider client={queryClient}>
      <OfferingActions
        row={{
          uuid: 'offering_uuid',
          customer_uuid: 'customer_uuid',
          state: 'Active',
          resources_count: 0,
        }}
        refetch={() => {}}
        {...props}
      />
    </QueryClientProvider>,
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

    expect(screen.getByText(translate('Edit'))).toBeInTheDocument();
    expect(
      screen.getByText(translate('Preview order form')),
    ).toBeInTheDocument();
    expect(screen.getByText(translate('Open public page'))).toBeInTheDocument();
  });

  it('shows disabled delete action when offering is not in Draft state', async () => {
    renderOfferingActions();
    const dropdownButton = screen.getByRole('button');
    await act(async () => {
      await fireEvent.click(dropdownButton);
    });

    expect(screen.getByText(translate('Delete'))).toBeInTheDocument();
    expect(
      screen.getByText(translate('Delete')).closest('.opacity-50'),
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

    expect(screen.getByText(translate('Delete'))).toBeInTheDocument();
  });
});
