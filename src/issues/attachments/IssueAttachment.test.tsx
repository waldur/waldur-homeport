import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { IssueAttachment } from './IssueAttachment';
import { IssueAttachmentsContext } from './IssueAttachmentsContext';

vi.mock('./api', () => ({
  useDeleteAttachment: () => ({
    deleteAttachment: vi.fn(),
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
    <IssueAttachmentsContext.Provider value={issue}>
      <IssueAttachment attachment={attachment(overrides)} />
    </IssueAttachmentsContext.Provider>,
  );

const deleteButton = () =>
  screen.queryByRole('button', { name: 'Delete attachment' });

describe('IssueAttachment', () => {
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

  it('offers Delete when the backend does not say who may delete', () => {
    renderAttachment({ can_delete: undefined });
    expect(deleteButton()).toBeInTheDocument();
  });
});
