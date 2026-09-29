import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsImportCall } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { renderCallExportYaml } from './callExportYaml';
import { ImportCallDialog } from './ImportCallDialog';

const exportFile = () =>
  new File(
    [
      renderCallExportYaml({
        schema_version: 1,
        call: { name: 'Spring call' },
        rounds: [{ start_time: '2026-01-01T00:00:00+00:00' }],
        requested_offerings: [
          { offering: { name: 'GPU', provider_name: 'HPC' } },
        ],
        documents: [],
      }),
    ],
    'spring-call-export.yaml',
    { type: 'text/yaml' },
  );

const getImportButton = () =>
  screen
    .getAllByRole('button', { name: /Import/i })
    .find((b) => b.textContent === 'Import');

const uploadAndSubmit = async () => {
  const user = userEvent.setup();
  renderWithProviders(
    <ImportCallDialog resolve={{ managerUuid: 'manager-uuid' }} />,
  );
  await user.upload(screen.getByTestId('file-uploader'), exportFile());
  await screen.findByDisplayValue('Spring call');
  await user.click(getImportButton());
  return user;
};

describe('ImportCallDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('offers only the sections present in the file and sends unticked ones as false', async () => {
    vi.mocked(proposalProtectedCallsImportCall).mockResolvedValue({
      data: {
        call_uuid: 'new-call',
        call_name: 'Spring call',
        imported_sections: [],
        warnings: [],
      },
    } as any);
    const user = userEvent.setup();
    renderWithProviders(
      <ImportCallDialog resolve={{ managerUuid: 'manager-uuid' }} />,
    );
    await user.upload(screen.getByTestId('file-uploader'), exportFile());
    await screen.findByDisplayValue('Spring call');

    expect(screen.getByText('Rounds')).toBeInTheDocument();
    expect(
      screen.getByText('Offerings and resource templates'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Workflow steps')).not.toBeInTheDocument();
    // Present in the file but empty.
    expect(screen.queryByText('Documents')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Rounds'));
    await user.click(getImportButton());

    await waitFor(() =>
      expect(proposalProtectedCallsImportCall).toHaveBeenCalled(),
    );
    const { body } = vi.mocked(proposalProtectedCallsImportCall).mock
      .calls[0][0];
    expect(body.manager).toBe('manager-uuid');
    expect(body.import_rounds).toBe(false);
    expect(body.import_offerings).toBe(true);
    expect(body.import_workflow_steps).toBe(false);
  });

  it('shows every warning returned by the import', async () => {
    vi.mocked(proposalProtectedCallsImportCall).mockResolvedValue({
      data: {
        call_uuid: 'new-call',
        call_name: 'Spring call',
        imported_sections: ['rounds'],
        warnings: [
          "Offering 'GPU' of provider 'HPC' was not found on this portal, skipped.",
          "Compliance checklist 'Export control' was not found on this portal, skipped.",
        ],
      },
    } as any);
    await uploadAndSubmit();

    const list = await screen.findByTestId('import-call-warnings');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(list).toHaveTextContent("Offering 'GPU'");
    expect(screen.getByRole('button', { name: 'Open call' })).toBeVisible();
  });

  it('shows a repeated warning once per occurrence', async () => {
    const warning =
      "Workflow step checklist 'Scoring' was not found on this portal, skipped.";
    vi.mocked(proposalProtectedCallsImportCall).mockResolvedValue({
      data: {
        call_uuid: 'new-call',
        call_name: 'Spring call',
        imported_sections: [],
        warnings: [warning, warning],
      },
    } as any);
    await uploadAndSubmit();

    const list = await screen.findByTestId('import-call-warnings');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  });

  it('explains why a file over the size limit is refused', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderWithProviders(
      <ImportCallDialog resolve={{ managerUuid: 'manager-uuid' }} />,
    );
    const file = exportFile();
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
    await user.upload(screen.getByTestId('file-uploader'), file);

    expect(
      await screen.findByText(/Export the call again without documents/),
    ).toBeInTheDocument();
    expect(proposalProtectedCallsImportCall).not.toHaveBeenCalled();
  });

  it('keeps the dialog open and shows a backend error', async () => {
    vi.mocked(proposalProtectedCallsImportCall).mockRejectedValue({
      status: 400,
      schema_version: ['Unsupported schema version: 2.'],
    });
    await uploadAndSubmit();

    expect(
      await screen.findByText(/Unsupported schema version/),
    ).toBeInTheDocument();
    expect(getImportButton()).toBeInTheDocument();
  });
});
