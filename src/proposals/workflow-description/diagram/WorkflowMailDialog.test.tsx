import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { proposalProposalsWorkflowMailsList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { WorkflowMailDialog } from './WorkflowMailDialog';

const render = () =>
  renderWithProviders(
    <WorkflowMailDialog
      resolve={{
        proposalUuid: 'p1',
        emailLogUuids: ['mail-1'],
        title: 'Step started: as sent',
      }}
    />,
  );

describe('WorkflowMailDialog', () => {
  it('shows the mail as it went out', async () => {
    vi.mocked(proposalProposalsWorkflowMailsList).mockResolvedValue({
      data: [
        {
          uuid: 'mail-1',
          sent_at: '2026-10-18T17:56:00Z',
          subject: 'Consensus report started',
          body: 'Dear expert,\nthe consensus report is yours.',
          emails: ['expert@example.org'],
        },
      ],
    } as any);
    render();
    expect(
      await screen.findByText('Consensus report started'),
    ).toBeInTheDocument();
    expect(screen.getByText('expert@example.org')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-mails')).toHaveTextContent(
      'the consensus report is yours.',
    );
    expect(proposalProposalsWorkflowMailsList).toHaveBeenCalledWith({
      path: { uuid: 'p1' },
      query: { uuid: ['mail-1'] },
    });
  });

  it('says when the text was not kept', async () => {
    vi.mocked(proposalProposalsWorkflowMailsList).mockResolvedValue({
      data: [],
    } as any);
    render();
    expect(
      await screen.findByText('The text of this mail was not kept.'),
    ).toBeInTheDocument();
  });
});
