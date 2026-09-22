import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceOfferingMergesExecute,
  marketplaceOfferingMergesUndo,
  OfferingMerge,
} from 'waldur-js-client';

import { inActionsMenu, renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import {
  DeleteMergeAction,
  ExecuteMergeButton,
  UndoMergeAction,
  UndoMergeButton,
} from './actions';

const merge = {
  uuid: 'merge',
  state: 'previewed',
  sources: ['source'],
  target: 'target',
  source_offerings: [],
  target_offering: { uuid: 'target', name: 'Target', state: 'Active' },
  preview: {
    blockers: [],
    warnings: [
      { code: 'plan_price_difference', message: 'Prices', details: {} },
      { code: 'offering_user_on_both', message: 'Users', details: {} },
    ],
  },
} as unknown as OfferingMerge;

const asUser = (user: { is_staff: boolean; is_support?: boolean }) =>
  vi.mocked(workspaceHooks.useUser).mockReturnValue(user as any);

describe('ExecuteMergeButton', () => {
  beforeEach(() => {
    vi.mocked(marketplaceOfferingMergesExecute).mockReset();
    asUser({ is_staff: true });
  });

  it('stays disabled and names the unacknowledged warnings', async () => {
    renderWithProviders(
      <ExecuteMergeButton
        merge={merge}
        acknowledged={['plan_price_difference']}
      />,
    );
    const button = screen.getByRole('button', { name: /run merge/i });
    expect(button).toBeDisabled();
    // A disabled button gets no pointer events; the tooltip listens on the
    // wrapper BaseButton puts around it.
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.hover(button.parentElement);
    expect(
      (await screen.findAllByText(/offering_user_on_both/)).length,
    ).toBeGreaterThan(0);
  });

  it('runs once every warning is acknowledged', async () => {
    vi.mocked(marketplaceOfferingMergesExecute).mockResolvedValue({
      data: { ...merge, state: 'queued' },
    } as any);
    renderWithProviders(
      <ExecuteMergeButton
        merge={merge}
        acknowledged={['plan_price_difference', 'offering_user_on_both']}
      />,
    );
    const button = screen.getByRole('button', { name: /run merge/i });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    await waitFor(() =>
      expect(marketplaceOfferingMergesExecute).toHaveBeenCalledWith({
        path: { uuid: 'merge' },
        body: {
          acknowledged_warnings: [
            'plan_price_difference',
            'offering_user_on_both',
          ],
        },
      }),
    );
  });

  it('is disabled again when a mapping changed since the preview', () => {
    renderWithProviders(
      <ExecuteMergeButton
        merge={merge}
        acknowledged={['plan_price_difference', 'offering_user_on_both']}
        unsavedChanges
      />,
    );
    expect(screen.getByRole('button', { name: /run merge/i })).toBeDisabled();
  });

  it('is hidden from support', () => {
    asUser({ is_staff: false, is_support: true });
    renderWithProviders(
      <ExecuteMergeButton
        merge={merge}
        acknowledged={['plan_price_difference', 'offering_user_on_both']}
      />,
    );
    expect(screen.queryByRole('button', { name: /run merge/i })).toBeNull();
  });
});

describe('merge controls for support', () => {
  beforeEach(() => asUser({ is_staff: false, is_support: true }));

  it('hides undo on the details page', () => {
    renderWithProviders(
      <UndoMergeButton merge={{ ...merge, state: 'done' }} />,
    );
    expect(screen.queryByRole('button', { name: /undo/i })).toBeNull();
  });

  it('hides the undo and delete row actions', () => {
    renderWithProviders(
      inActionsMenu(
        <>
          <UndoMergeAction row={{ ...merge, state: 'done' }} />
          <DeleteMergeAction row={{ ...merge, state: 'draft' }} />
        </>,
      ),
    );
    expect(screen.queryByRole('menuitem')).toBeNull();
  });
});

describe('merge controls for staff', () => {
  beforeEach(() => asUser({ is_staff: true }));

  it('shows undo on a done merge', () => {
    renderWithProviders(
      <UndoMergeButton merge={{ ...merge, state: 'done' }} />,
    );
    expect(screen.getByRole('button', { name: /undo merge/i })).toBeEnabled();
  });

  it('disables undo until the merge is done', () => {
    renderWithProviders(<UndoMergeButton merge={merge} />);
    expect(screen.getByRole('button', { name: /undo merge/i })).toBeDisabled();
  });

  it('hands a refused undo to the page', async () => {
    const refusal = {
      detail: 'Undo refused.',
      blockers: [
        { code: 'changed_since_merge', message: 'Changed.', details: {} },
      ],
    };
    vi.mocked(marketplaceOfferingMergesUndo).mockRejectedValue(refusal);
    const onRefused = vi.fn();
    renderWithProviders(
      <UndoMergeButton
        merge={{ ...merge, state: 'done' }}
        onRefused={onRefused}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /undo merge/i }));
    await waitFor(() =>
      expect(onRefused).toHaveBeenCalledWith({
        detail: 'Undo refused.',
        blockers: refusal.blockers,
        missing_acknowledgements: [],
      }),
    );
  });
});
