import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsRoundsRecordAdoption } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { RecordRoundAdoptionDialog } from './RecordRoundAdoptionDialog';

const call = { uuid: 'call-uuid' } as any;
const round = {
  uuid: 'round-uuid',
  name: 'Round 1',
  adopted_at: null,
  adoption_note: null,
  adoption_document: null,
} as any;

const renderDialog = (roundProps = {}, refetch = vi.fn()) =>
  renderWithProviders(
    <RecordRoundAdoptionDialog
      resolve={{ round: { ...round, ...roundProps }, call, refetch }}
    />,
  );

const saveButton = () => screen.getByRole('button', { name: 'Save' });

describe('RecordRoundAdoptionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('asks for the adoption date before saving', () => {
    renderDialog();
    expect(saveButton()).toBeDisabled();
  });

  it('saves the recorded date and the edited note, keeping the document', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsRoundsRecordAdoption).mockResolvedValue({
      data: {},
    } as any);
    renderDialog(
      {
        adopted_at: '2026-09-01',
        adoption_note: 'Board decision 12',
        adoption_document: 'http://localhost/api/media/token/',
      },
      refetch,
    );

    expect(
      screen.getByText(
        'A document is already recorded. Choose a file only to replace it.',
      ),
    ).toBeInTheDocument();
    const note = screen.getByRole('textbox', { name: /Note/ });
    expect(note).toHaveValue('Board decision 12');
    await user.type(note, ', amended');
    await user.click(saveButton());

    await waitFor(() =>
      expect(proposalProtectedCallsRoundsRecordAdoption).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid', obj_uuid: 'round-uuid' },
        body: {
          adopted_at: '2026-09-01',
          adoption_note: 'Board decision 12, amended',
        },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});
