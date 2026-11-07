import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callTemplatesCreate,
  callTemplatesPartialUpdate,
} from 'waldur-js-client';

import { renderCallExportYaml } from '@/proposals/transfer/callExportYaml';
import { renderWithProviders } from '@/test/harness';

import { CallTemplateFormDialog } from './CallTemplateFormDialog';

const exportFile = () =>
  new File(
    [
      renderCallExportYaml({
        schema_version: 3,
        call: { name: 'Spring call' },
        rounds: [{ start_time: '2026-01-01T00:00:00+00:00' }],
        workflow_steps: [{ name: 'Review', order: 0 }],
      }),
    ],
    'spring-call-export.yaml',
    { type: 'text/yaml' },
  );

const saved = {
  uuid: 'template-uuid',
  name: 'Spring call',
  warnings: [],
};

describe('CallTemplateFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a template from a call file without its rounds', async () => {
    vi.mocked(callTemplatesCreate).mockResolvedValue({ data: saved } as any);
    const user = userEvent.setup();
    renderWithProviders(<CallTemplateFormDialog resolve={{}} />);

    await user.upload(screen.getByTestId('file-uploader'), exportFile());
    await screen.findByDisplayValue('Spring call');
    expect(
      screen.getByText('Left out of the template: rounds.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(callTemplatesCreate).toHaveBeenCalled());
    const { body } = vi.mocked(callTemplatesCreate).mock.calls[0][0];
    expect(body).toEqual({
      name: 'Spring call',
      description: '',
      is_published: false,
      document: {
        schema_version: 3,
        call: { name: 'Spring call' },
        workflow_steps: [{ name: 'Review', order: 0 }],
      },
    });
  });

  it('shows what a call created from the template would leave out', async () => {
    vi.mocked(callTemplatesCreate).mockResolvedValue({
      data: {
        ...saved,
        warnings: ["Compliance checklist 'Export control' was not found."],
      },
    } as any);
    const user = userEvent.setup();
    renderWithProviders(<CallTemplateFormDialog resolve={{}} />);

    await user.upload(screen.getByTestId('file-uploader'), exportFile());
    await screen.findByDisplayValue('Spring call');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(
      await screen.findByTestId('call-template-warnings'),
    ).toHaveTextContent("Compliance checklist 'Export control'");
  });

  it('edits a template without replacing its document', async () => {
    vi.mocked(callTemplatesPartialUpdate).mockResolvedValue({
      data: saved,
    } as any);
    const user = userEvent.setup();
    renderWithProviders(
      <CallTemplateFormDialog
        resolve={{
          template: {
            uuid: 'template-uuid',
            name: 'Spring call',
            description: '',
            is_published: true,
          } as any,
        }}
      />,
    );

    const name = screen.getByDisplayValue('Spring call');
    await user.clear(name);
    await user.type(name, 'Autumn call');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(callTemplatesPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'template-uuid' },
        body: { name: 'Autumn call', description: '', is_published: true },
      }),
    );
  });
});
