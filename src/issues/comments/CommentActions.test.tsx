import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CommentActions } from './CommentActions';
import { IssueCommentsContext } from './IssueCommentsContext';

const issue = { uuid: 'issue-1', url: 'https://api.example.com/issues/1/' };

const renderActions = (availability: {
  update_is_available: boolean;
  destroy_is_available: boolean;
}) =>
  renderWithProviders(
    <IssueCommentsContext.Provider value={issue as any}>
      <CommentActions
        comment={
          {
            uuid: 'comment-1',
            description: 'Text',
            issue: issue.url,
            ...availability,
          } as any
        }
      />
    </IssueCommentsContext.Provider>,
  );

describe('CommentActions', () => {
  it('offers both actions when the user may change the comment', () => {
    renderActions({ update_is_available: true, destroy_is_available: true });

    expect(screen.getByRole('button', { name: /Change/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Remove/ })).toBeEnabled();
  });

  it('shows nothing when the user may not change the comment', () => {
    renderActions({ update_is_available: false, destroy_is_available: false });

    expect(screen.queryByRole('button', { name: /Change/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull();
  });

  it('offers only removal where the backend cannot edit comments', () => {
    // Zammad, for one: comments cannot be edited there, but a fresh internal
    // comment may still be removed.
    renderActions({ update_is_available: false, destroy_is_available: true });

    expect(screen.queryByRole('button', { name: /Change/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Remove/ })).toBeEnabled();
  });
});
