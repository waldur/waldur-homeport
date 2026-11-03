import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The warning is a real confirmation dialog, so these tests mount the real
// modal host instead of the global mock.
vi.unmock('@/modal/actions');
vi.unmock('../../../packages/ui/src/Dialog/modalContext');

import { ConfirmModalRoot } from '@/modal/ConfirmModalRoot';
import { ModalProvider } from '@/modal/ModalContext';

import { IssueAttachment } from './IssueAttachment';
import { IssueAttachmentsContext } from './IssueAttachmentsContext';

const { deleteAttachment } = vi.hoisted(() => ({
  deleteAttachment: vi.fn(),
}));

vi.mock('./api', () => ({
  useDeleteAttachment: () => ({
    deleteAttachment,
    isDeleting: () => false,
  }),
}));

const issue = { url: 'https://example.org/api/support-issues/issue/' } as any;

const attachment = (overrides) =>
  ({
    uuid: 'attachment',
    file: 'https://example.org/api/media/attachment/',
    file_name: 'notes.txt',
    mime_type: 'text/plain',
    file_size: 128,
    destroy_is_available: true,
    can_delete: true,
    ...overrides,
  }) as any;

const renderAttachment = (overrides = {}) =>
  render(
    <ModalProvider>
      <IssueAttachmentsContext.Provider value={issue}>
        <IssueAttachment attachment={attachment(overrides)} />
      </IssueAttachmentsContext.Provider>
      <ConfirmModalRoot />
    </ModalProvider>,
  );

const deleteButton = () =>
  screen.queryByRole('button', { name: 'Delete attachment' });

const LOCAL_ONLY_WARNING = /removes the file from Waldur only/;

describe('IssueAttachment', () => {
  beforeEach(() => {
    deleteAttachment.mockClear();
  });

  it('offers Delete when the caller may delete and the backend allows it', () => {
    renderAttachment();
    expect(deleteButton()).toBeInTheDocument();
  });

  it('hides Delete when the caller may not delete the attachment', () => {
    // Mastermind lets staff delete any attachment, and anyone else only one
    // they uploaded while they may still comment on its issue.
    renderAttachment({ can_delete: false });
    expect(deleteButton()).not.toBeInTheDocument();
  });

  it('hides Delete when the support backend does not allow deleting it', () => {
    renderAttachment({ destroy_is_available: false });
    expect(deleteButton()).not.toBeInTheDocument();
  });

  it('hides Delete when the backend sends no answer on deleting it', () => {
    // Zammad sent null past its cooldown until Mastermind made it false.
    renderAttachment({ destroy_is_available: null });
    expect(deleteButton()).not.toBeInTheDocument();
  });

  it('offers Delete when the backend does not say who may delete', () => {
    renderAttachment({ can_delete: undefined });
    expect(deleteButton()).toBeInTheDocument();
  });

  describe('when the delete stays in Waldur', () => {
    // The ticket's provider helpdesk was deleted, so nothing carries the
    // delete to the provider's copy of the file.

    it('warns that the provider keeps its copy before deleting', async () => {
      const user = userEvent.setup();
      renderAttachment({ delete_is_local_only: true });

      await user.click(deleteButton());

      const dialog = await screen.findByRole('dialog', {
        name: 'Delete attachment',
      });
      expect(within(dialog).getByText(LOCAL_ONLY_WARNING)).toBeInTheDocument();
      expect(deleteAttachment).not.toHaveBeenCalled();

      await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

      expect(deleteAttachment).toHaveBeenCalledWith('attachment');
    });

    it('keeps the file when the warning is cancelled', async () => {
      const user = userEvent.setup();
      renderAttachment({ delete_is_local_only: true });

      await user.click(deleteButton());
      const dialog = await screen.findByRole('dialog', {
        name: 'Delete attachment',
      });
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      expect(deleteAttachment).not.toHaveBeenCalled();
    });
  });

  describe.each([
    ['reaches the helpdesk', { delete_is_local_only: false }],
    ['is not described by the backend', {}],
  ])('when the delete %s', (_case, overrides) => {
    it('deletes at once, without a warning', async () => {
      const user = userEvent.setup();
      renderAttachment(overrides);

      await user.click(deleteButton());

      expect(deleteAttachment).toHaveBeenCalledWith('attachment');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText(LOCAL_ONLY_WARNING)).not.toBeInTheDocument();
    });
  });
});
