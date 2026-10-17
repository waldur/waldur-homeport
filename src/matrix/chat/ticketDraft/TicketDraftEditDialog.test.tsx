import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  matrixTicketDraftsCreateIssue,
  supportAttachmentsCreate,
  supportIssuesCreate,
  supportIssuesRetrieve,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { TicketDraft } from './parseTicketDraft';
import { TicketDraftEditDialog } from './TicketDraftEditDialog';

// The form itself is covered by the issue tests; this one submits what a
// user would have entered.
const form = vi.hoisted(() => ({ files: undefined as File[] | undefined }));

vi.mock('@/issues/create/IssueCreateForm', () => ({
  IssueCreateForm: ({ onCreateIssue, resolve }) => (
    <button
      onClick={() =>
        // A refused submit is the dialog's to report; the form just stays.
        Promise.resolve(
          onCreateIssue({
            summary: `${resolve.issue.summary} (edited)`,
            description: resolve.issue.description,
            type: resolve.issue.type,
            resource: { uuid: 'r2' },
            files: form.files,
          }),
        ).catch(() => undefined)
      }
    >
      Submit
    </button>
  ),
}));

const draft: TicketDraft = {
  draftUuid: 'd1',
  requester: '@alice:chat.example.com',
  title: 'VM does not boot',
  description: 'It hangs.',
  requestType: 'Incident',
  project: { uuid: 'p1', name: 'Project' },
};

describe('TicketDraftEditDialog', () => {
  beforeEach(() => {
    vi.mocked(useNotify().showError).mockClear();
    vi.mocked(useNotify().showErrorResponse).mockClear();
    vi.mocked(useModal().closeDialog).mockClear();
  });

  it('creates the ticket through the draft with the edited fields', async () => {
    vi.mocked(matrixTicketDraftsCreateIssue).mockResolvedValue({
      data: { issue_key: 'SD-1', issue_uuid: 'i1', issue_url: '/x' },
    } as any);
    const onCreated = vi.fn();
    const onFailed = vi.fn();
    renderWithProviders(
      <TicketDraftEditDialog resolve={{ draft, onCreated, onFailed }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(matrixTicketDraftsCreateIssue).toHaveBeenCalledWith({
      path: { uuid: 'd1' },
      body: {
        summary: 'VM does not boot (edited)',
        description: 'It hangs.',
        type: 'Incident',
        resource_uuid: 'r2',
      },
    });
    expect(supportIssuesCreate).not.toHaveBeenCalled();
  });

  it('reports failed attachments without failing the ticket', async () => {
    vi.mocked(matrixTicketDraftsCreateIssue).mockResolvedValue({
      data: { issue_key: 'SD-2', issue_uuid: 'i2', issue_url: '/x' },
    } as any);
    vi.mocked(supportIssuesRetrieve).mockResolvedValue({
      data: { url: 'https://api/support-issues/i2/' },
    } as any);
    vi.mocked(supportAttachmentsCreate).mockRejectedValue(new Error('413'));
    form.files = [new File(['x'], 'log.txt')];
    const onCreated = vi.fn();
    const onFailed = vi.fn();
    renderWithProviders(
      <TicketDraftEditDialog resolve={{ draft, onCreated, onFailed }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(onCreated).toHaveBeenCalledWith(
        expect.objectContaining({ issue_key: 'SD-2' }),
      ),
    );
    expect(useNotify().showError).toHaveBeenCalledWith(
      'Ticket SD-2 created, but attachments could not be uploaded.',
    );
    form.files = undefined;
  });

  it('says why Waldur refused the ticket', async () => {
    vi.mocked(matrixTicketDraftsCreateIssue).mockRejectedValue({
      resource_uuid: ["Not a resource of the room's project."],
      response: { status: 400 },
      status: 400,
      statusText: 'Bad Request',
    });
    const onCreated = vi.fn();
    const onFailed = vi.fn();
    renderWithProviders(
      <TicketDraftEditDialog resolve={{ draft, onCreated, onFailed }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        "Unable to create the support ticket. resource_uuid: Not a resource of the room's project.",
      ),
    );
    expect(useNotify().showErrorResponse).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
    // The form can fix this one: it stays open, and the card asks again.
    expect(onFailed).toHaveBeenCalled();
    expect(useModal().closeDialog).not.toHaveBeenCalled();
  });

  it('closes when Waldur no longer has the draft', async () => {
    const error = {
      detail: 'Not found.',
      response: { status: 404 },
      status: 404,
      statusText: 'Not Found',
    };
    vi.mocked(matrixTicketDraftsCreateIssue).mockRejectedValue(error);
    const onCreated = vi.fn();
    const onFailed = vi.fn();
    renderWithProviders(
      <TicketDraftEditDialog resolve={{ draft, onCreated, onFailed }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(useModal().closeDialog).toHaveBeenCalled());
    expect(onFailed).toHaveBeenCalledWith(error);
    expect(onCreated).not.toHaveBeenCalled();
    expect(useNotify().showError).toHaveBeenCalledWith(
      'Unable to create the support ticket. Not found.',
    );
  });
});
