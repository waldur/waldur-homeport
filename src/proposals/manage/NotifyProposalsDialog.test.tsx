import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsNotifyProposals } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { NotifyProposalsDialog } from './NotifyProposalsDialog';

const render = () =>
  renderWithProviders(
    <NotifyProposalsDialog
      resolve={{ callUuid: 'call-1', proposalUuids: ['p1', 'p2'] }}
    />,
  );

describe('NotifyProposalsDialog', () => {
  it('sends the message to the chosen recipients of the selected proposals', async () => {
    vi.mocked(proposalProtectedCallsNotifyProposals).mockResolvedValue({
      data: { proposals_notified: 2, skipped_proposals: [] },
    } as any);
    render();
    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/The whole proposal team/));
    await user.type(screen.getByLabelText(/Subject/), 'Missing annex');
    await user.type(screen.getByLabelText(/Message/), 'Please upload it.');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(proposalProtectedCallsNotifyProposals).toHaveBeenCalledWith({
        path: { uuid: 'call-1' },
        body: {
          proposal_uuids: ['p1', 'p2'],
          recipients: 'team',
          subject: 'Missing annex',
          body: 'Please upload it.',
        },
      }),
    );
  });

  it('addresses the applicant unless told otherwise', () => {
    render();
    expect(screen.getByLabelText(/The applicant/)).toBeChecked();
  });

  it('says which proposals were not sent and why', async () => {
    vi.mocked(proposalProtectedCallsNotifyProposals).mockResolvedValue({
      data: {
        proposals_notified: 1,
        skipped_proposals: [
          {
            proposal_uuid: 'p2',
            proposal_name: 'Lattice QCD',
            reason: 'Nobody it is addressed to receives mail.',
          },
        ],
      },
    } as any);
    render();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Subject/), 'Annex');
    await user.type(screen.getByLabelText(/Message/), 'Upload it.');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(useNotify().showRedirectMessage).toHaveBeenCalledWith(
        'Not sent for 1 proposals',
        'Lattice QCD: Nobody it is addressed to receives mail.',
      ),
    );
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'The message is being sent to the applicants of 1 proposals.',
    );
  });

  it('says why a refused message was not sent, without the status line', async () => {
    // The shape the API client's interceptor gives a DRF refusal: the body's
    // items spread onto the error, beside the response envelope.
    vi.mocked(proposalProtectedCallsNotifyProposals).mockRejectedValue({
      0: 'Mail to applicants is switched off on this site.',
      status: 400,
      statusText: 'Bad Request',
      response: { status: 400 },
    });
    render();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Subject/), 'Annex');
    await user.type(screen.getByLabelText(/Message/), 'Upload it.');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        'Unable to send the message. Mail to applicants is switched off on this site.',
      ),
    );
    expect(useNotify().showErrorResponse).not.toHaveBeenCalled();
  });
});
