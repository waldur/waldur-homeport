import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceServiceProviderProjectGroupsImportGroups } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { ImportProjectGroupsDialog } from './ImportProjectGroupsDialog';

const provider = { uuid: 'provider-uuid' } as any;
const UUID = '0b4a1c2d3e4f5a6b7c8d9e0f1a2b3c4d';

const renderDialog = () =>
  renderWithProviders(
    <ImportProjectGroupsDialog resolve={{ provider, refetch: vi.fn() }} />,
  );

const paste = async (user, text: string) => {
  await user.click(screen.getByLabelText(/Groups/));
  await user.paste(text);
};

describe('ImportProjectGroupsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('imports the pasted groups', async () => {
    vi.mocked(
      marketplaceServiceProviderProjectGroupsImportGroups,
    ).mockResolvedValue({ data: [] } as any);
    const user = userEvent.setup();
    renderDialog();

    await paste(user, `project,gid\n${UUID},20001,alpha`);
    await user.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() =>
      expect(
        marketplaceServiceProviderProjectGroupsImportGroups,
      ).toHaveBeenCalledWith({
        body: {
          service_provider: 'provider-uuid',
          groups: [{ project: UUID, gid: 20001, name: 'alpha' }],
          allow_outside_range: false,
        },
      }),
    );
  });

  it('refuses malformed lines before sending', async () => {
    const user = userEvent.setup();
    renderDialog();

    await paste(user, `${UUID},abc`);
    await user.tab();

    expect(
      await screen.findByText('Line 1: "abc" is not a GID.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
  });

  it('lists every refused line and says nothing was imported', async () => {
    vi.mocked(
      marketplaceServiceProviderProjectGroupsImportGroups,
    ).mockRejectedValue({
      response: { status: 400 },
      status: 400,
      statusText: 'Bad Request',
      url: 'http://localhost/api/import_groups/',
      groups: { 1: { gid: ['GID 20002 is held by another consumer.'] } },
    });
    const user = userEvent.setup();
    renderDialog();

    await paste(user, `${UUID},20001\n\n${UUID},20002`);
    await user.click(screen.getByRole('button', { name: 'Import' }));

    expect(
      await screen.findByText('Nothing was imported.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('import-problems')).toHaveTextContent(
      'Line 3, GID: GID 20002 is held by another consumer.',
    );
    expect(screen.getByTestId('import-problems')).not.toHaveTextContent(
      /Bad Request|statusText|localhost/,
    );
  });

  it('accepts a project’s short name', async () => {
    vi.mocked(
      marketplaceServiceProviderProjectGroupsImportGroups,
    ).mockResolvedValue({ data: [] } as any);
    const user = userEvent.setup();
    renderDialog();

    await paste(user, 'climate-models,20002');
    await user.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() =>
      expect(
        marketplaceServiceProviderProjectGroupsImportGroups,
      ).toHaveBeenCalledWith({
        body: expect.objectContaining({
          groups: [{ project: 'climate-models', gid: 20002 }],
        }),
      }),
    );
  });

  it('drops the refusal list once the lines are edited', async () => {
    vi.mocked(
      marketplaceServiceProviderProjectGroupsImportGroups,
    ).mockRejectedValue({
      response: { status: 400 },
      status: 400,
      groups: { 0: { gid: ['Taken.'] } },
    });
    const user = userEvent.setup();
    renderDialog();

    await paste(user, `${UUID},20001`);
    await user.click(screen.getByRole('button', { name: 'Import' }));
    expect(await screen.findByTestId('import-problems')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Groups/), '9');
    expect(screen.queryByTestId('import-problems')).not.toBeInTheDocument();
  });

  it('toasts an error it cannot list', async () => {
    vi.mocked(
      marketplaceServiceProviderProjectGroupsImportGroups,
    ).mockRejectedValue({ response: { status: 500 }, status: 500 });
    const user = userEvent.setup();
    renderDialog();

    await paste(user, `${UUID},20001`);
    await user.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.anything(),
        'Unable to import project groups.',
      ),
    );
    expect(screen.queryByTestId('import-problems')).not.toBeInTheDocument();
  });
});
