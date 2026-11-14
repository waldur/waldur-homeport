import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openportalManagedProjectsDeleteDestroy,
  openportalManagedProjectsRetrieveGet,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ManagedProjectDetail } from './ManagedProjectDetail';
import { ManagedProjectNotesDialog } from './ManagedProjectNotesDialog';

vi.mock('./ManagedProjectAuditLog', () => ({
  ManagedProjectAuditLog: () => null,
}));
vi.mock('@/navigation/title', () => ({ useTitle: vi.fn() }));

const NOTE_TEXT = 'First line\nSecond line';

const project: any = {
  identifier: 'award-42',
  destination: 'portal.cluster',
  state: 'pending',
  created: '2026-10-01T09:00:00Z',
  details: {
    name: 'Award project',
    notes: [
      {
        author: 'Awarding portal',
        timestamp: '2026-10-20T09:00:00Z',
        text: NOTE_TEXT,
      },
    ],
  },
};

const renderDetail = async () => {
  renderWithProviders(<ManagedProjectDetail />);
  await screen.findByRole('heading', { name: 'Award project' });
};

describe('ManagedProjectDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({} as any);
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      params: { identifier: 'award-42', destination: 'portal.cluster' },
    } as any);
    vi.mocked(openportalManagedProjectsRetrieveGet).mockResolvedValue({
      data: project,
    } as any);
  });

  it('keeps the line breaks of a note', async () => {
    await renderDetail();
    const note = screen.getByText(
      (_, element) => element?.textContent === NOTE_TEXT,
      { selector: 'div' },
    );
    expect(note).toHaveClass('whitespace-pre-wrap');
  });

  it('does not offer to add a note to anyone but staff', async () => {
    // add-note is staff-only on the backend.
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    await renderDetail();
    expect(
      screen.queryByRole('button', { name: 'Add note' }),
    ).not.toBeInTheDocument();
  });

  it('offers staff to add a note and reloads the project after one', async () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    await renderDetail();
    await userEvent.click(screen.getByRole('button', { name: 'Add note' }));

    const { openDialog } = vi.mocked(useModal)();
    expect(openDialog).toHaveBeenCalledWith(
      ManagedProjectNotesDialog,
      expect.objectContaining({ row: project }),
    );
    const { resolve } = vi.mocked(openDialog).mock.calls[0][1] as any;
    await resolve.refetch();
    expect(openportalManagedProjectsRetrieveGet).toHaveBeenCalledTimes(2);
  });

  it('goes back to the list after a delete instead of reloading the project', async () => {
    vi.mocked(openportalManagedProjectsDeleteDestroy).mockResolvedValue(
      {} as any,
    );
    await renderDetail();

    await userEvent.click(screen.getByTestId('actions-toggle'));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /Delete/ }),
    );

    await waitFor(() =>
      expect(useRouter().stateService.go).toHaveBeenCalledWith(
        'marketplace-provider-managed-projects',
      ),
    );
    expect(openportalManagedProjectsDeleteDestroy).toHaveBeenCalledWith({
      path: { identifier: 'award-42', destination: 'portal.cluster' },
    });
    expect(openportalManagedProjectsRetrieveGet).toHaveBeenCalledTimes(1);
  });
});
