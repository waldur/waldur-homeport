import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceServiceProvidersAccountOptionsPreview,
  marketplaceServiceProvidersPartialUpdate,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { AccountOptionsPreviewDialog } from './AccountOptionsPreviewDialog';

vi.mock('./AccountOptionsPreviewResult', () => ({
  AccountOptionsPreviewResult: ({ preview }) => (
    <div data-testid="preview-result">{preview.warnings.join(' ')}</div>
  ),
}));

const serviceProvider = {
  uuid: 'provider-uuid',
  account_options: { account_scope: 'provider' },
} as any;

const renderDialog = (provider = serviceProvider) =>
  renderWithProviders(
    <AccountOptionsPreviewDialog
      resolve={{ serviceProvider: provider, setServiceProvider: vi.fn() }}
    />,
  );

describe('AccountOptionsPreviewDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      marketplaceServiceProvidersAccountOptionsPreview,
    ).mockResolvedValue({
      data: {
        warnings: ['The provider has no POSIX ID pool with a GID range.'],
      },
    } as any);
    vi.mocked(marketplaceServiceProvidersPartialUpdate).mockResolvedValue({
      data: serviceProvider,
    } as any);
  });

  it('previews and applies turning project groups on', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(
      screen.queryByText('Before enabling project groups'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Create project groups'));
    expect(
      screen.getByText('Before enabling project groups'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Preview' }));
    await waitFor(() =>
      expect(
        marketplaceServiceProvidersAccountOptionsPreview,
      ).toHaveBeenCalledWith({
        path: { uuid: 'provider-uuid' },
        body: {
          account_options: expect.objectContaining({
            account_scope: 'provider',
            project_groups_enabled: true,
          }),
        },
      }),
    );
    expect(screen.getByTestId('preview-result')).toHaveTextContent(
      'no POSIX ID pool with a GID range',
    );

    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(marketplaceServiceProvidersPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'provider-uuid' },
        body: {
          account_options: expect.objectContaining({
            project_groups_enabled: true,
          }),
        },
      }),
    );
  });

  it('keeps project groups on when other settings change', async () => {
    const user = userEvent.setup();
    renderDialog({
      ...serviceProvider,
      account_options: { project_groups_enabled: true },
    });

    expect(
      screen.queryByText('Before enabling project groups'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    await waitFor(() =>
      expect(
        marketplaceServiceProvidersAccountOptionsPreview,
      ).toHaveBeenCalledWith({
        path: { uuid: 'provider-uuid' },
        body: {
          account_options: expect.objectContaining({
            project_groups_enabled: true,
          }),
        },
      }),
    );
  });

  it('explains what turning project groups off keeps', async () => {
    const user = userEvent.setup();
    renderDialog({
      ...serviceProvider,
      account_options: { project_groups_enabled: true },
    });

    expect(
      screen.queryByText('Turning project groups off'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Create project groups'));
    expect(screen.getByText('Turning project groups off')).toBeInTheDocument();
    expect(screen.getByText(/Existing groups stay/)).toBeInTheDocument();
  });
});
