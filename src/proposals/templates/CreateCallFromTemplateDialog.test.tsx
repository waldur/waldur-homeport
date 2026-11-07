import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callTemplatesList,
  proposalProtectedCallsImportCall,
  proposalProtectedCallsWorkflowStepKindsList,
} from 'waldur-js-client';

import { router } from '@/router';
import { renderWithProviders } from '@/test/harness';

import { CreateCallFromTemplateDialog } from './CreateCallFromTemplateDialog';

const templates = [
  {
    uuid: 'extreme',
    name: 'Extreme Scale Access',
    description: 'Large allocations.',
    origin: {
      organization: 'EuroHPC Joint Undertaking',
      process: 'Extreme Scale Access Mode',
      reference_url: 'https://eurohpc-ju.europa.eu/extreme-scale',
      programme: 'EuroHPC JU access calls',
    },
    schema_version: 3,
    modified: '2026-10-01T00:00:00Z',
    steps: [
      {
        name: 'Administrative check',
        kind: 'decision',
        order: 0,
        is_enabled: true,
      },
      {
        name: 'Scientific review',
        kind: 'assessment',
        order: 1,
        is_enabled: true,
      },
    ],
  },
  {
    uuid: 'regular',
    name: 'Regular Access',
    description: '',
    schema_version: 3,
    modified: '2026-10-01T00:00:00Z',
    steps: [],
  },
];

const renderDialog = () =>
  renderWithProviders(
    <CreateCallFromTemplateDialog resolve={{ managerUuid: 'manager-uuid' }} />,
  );

describe('CreateCallFromTemplateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(callTemplatesList).mockResolvedValue({ data: templates } as any);
    vi.mocked(proposalProtectedCallsWorkflowStepKindsList).mockResolvedValue({
      data: [],
    } as any);
  });

  it('names the programme and process a template models', async () => {
    renderDialog();
    expect(
      await screen.findByText(
        'EuroHPC JU access calls · Extreme Scale Access Mode',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('call-template-origin')).toHaveLength(1);
  });

  it('creates a draft call from the chosen template and opens it', async () => {
    vi.mocked(proposalProtectedCallsImportCall).mockResolvedValue({
      data: {
        call_uuid: 'new-call',
        call_name: 'Extreme Scale Access',
        imported_sections: ['workflow_steps'],
        warnings: [],
      },
    } as any);
    const user = userEvent.setup();
    renderDialog();

    await user.click(await screen.findByLabelText('Extreme Scale Access'));
    // The call is named after the template until the user names it.
    expect(
      await screen.findByDisplayValue('Extreme Scale Access'),
    ).toBeInTheDocument();
    expect(screen.getByText('Scientific review')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(proposalProtectedCallsImportCall).toHaveBeenCalledWith({
        body: {
          manager: 'manager-uuid',
          template: 'extreme',
          name: 'Extreme Scale Access',
        },
      }),
    );
    await waitFor(() =>
      expect(router.stateService.go).toHaveBeenCalledWith(
        'protected-call.main',
        { call_uuid: 'new-call' },
      ),
    );
  });

  it('keeps a name the user typed when another template is chosen', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(await screen.findByLabelText('Extreme Scale Access'));
    const name = await screen.findByDisplayValue('Extreme Scale Access');
    await user.clear(name);
    await user.type(name, 'Spring call');
    await user.click(screen.getByLabelText('Regular Access'));

    expect(screen.getByDisplayValue('Spring call')).toBeInTheDocument();
  });

  it('shows the warnings of the new call', async () => {
    vi.mocked(proposalProtectedCallsImportCall).mockResolvedValue({
      data: {
        call_uuid: 'new-call',
        call_name: 'Regular Access',
        imported_sections: [],
        warnings: ["Compliance checklist 'Export control' was not found."],
      },
    } as any);
    const user = userEvent.setup();
    renderDialog();

    await user.click(await screen.findByLabelText('Regular Access'));
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(
      await screen.findByText(/Compliance checklist 'Export control'/),
    ).toBeInTheDocument();
    expect(router.stateService.go).not.toHaveBeenCalled();
  });

  it('says so when there is no template to choose', async () => {
    vi.mocked(callTemplatesList).mockResolvedValue({ data: [] } as any);
    renderDialog();

    expect(
      await screen.findByText('No call templates yet'),
    ).toBeInTheDocument();
  });
});
