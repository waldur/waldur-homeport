import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ManagedProjectNotesDialog } from './ManagedProjectNotesDialog';

const NOTE_TEXT = 'First line\nSecond line';

const row: any = {
  identifier: 'award-42',
  destination: 'portal.cluster',
  details: {
    notes: [
      {
        author: 'Awarding portal',
        timestamp: '2026-10-20T09:00:00Z',
        text: NOTE_TEXT,
      },
    ],
  },
};

const renderDialog = () =>
  renderWithProviders(
    <ManagedProjectNotesDialog row={row} resolve={{ refetch: vi.fn() }} />,
  );

describe('ManagedProjectNotesDialog', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({} as any);
  });

  it('keeps the line breaks of a note', () => {
    renderDialog();
    const note = screen.getByText(
      (_, element) => element?.textContent === NOTE_TEXT,
      { selector: 'div' },
    );
    expect(note).toHaveClass('whitespace-pre-wrap');
  });

  it('shows the notes read-only to anyone but staff', () => {
    // add-note is staff-only on the backend.
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    renderDialog();
    expect(
      screen.getByText('Awarding portal', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add note' }),
    ).not.toBeInTheDocument();
  });

  it('lets staff add a note', () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    renderDialog();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add note' }),
    ).toBeInTheDocument();
  });
});
