import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { EditFieldDialog } from '@/form/EditFieldDialog';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import {
  GeneralConfigurationSection,
  formatOrderAuthorUser,
  normalizeOrderAuthorUser,
  validateFixedDuration,
} from './GeneralConfigurationSection';

describe('validateFixedDuration', () => {
  it('accepts an empty value, which clears the fixed duration', () => {
    expect(validateFixedDuration(null)).toBeUndefined();
    expect(validateFixedDuration('')).toBeUndefined();
    expect(validateFixedDuration(undefined)).toBeUndefined();
  });

  it('accepts a positive whole number, including the string form', () => {
    expect(validateFixedDuration(1)).toBeUndefined();
    expect(validateFixedDuration('45')).toBeUndefined();
  });

  it('rejects values the backend would refuse', () => {
    expect(validateFixedDuration(0)).toBeTruthy();
    expect(validateFixedDuration(-5)).toBeTruthy();
    expect(validateFixedDuration('1.5')).toBeTruthy();
    expect(validateFixedDuration('abc')).toBeTruthy();
  });
});

describe('formatOrderAuthorUser', () => {
  const call = { order_author_user_name: 'Grants Office' };

  it('turns the stored UUID into an option the picker can display', () => {
    expect(formatOrderAuthorUser('abc123', call)).toEqual({
      uuid: 'abc123',
      full_name: 'Grants Office',
    });
  });

  it('keeps a freshly picked user as it is', () => {
    const picked = { uuid: 'def456', full_name: 'Jane Doe' };
    expect(formatOrderAuthorUser(picked, call)).toBe(picked);
  });

  it('shows nothing selected when no contact is set', () => {
    expect(formatOrderAuthorUser(null, call)).toBeNull();
    expect(formatOrderAuthorUser('', call)).toBeNull();
    expect(formatOrderAuthorUser(undefined, call)).toBeNull();
  });
});

describe('normalizeOrderAuthorUser', () => {
  it('submits the UUID of a picked user', () => {
    expect(normalizeOrderAuthorUser({ uuid: 'def456' })).toBe('def456');
  });

  it('passes an unchanged UUID through', () => {
    expect(normalizeOrderAuthorUser('abc123')).toBe('abc123');
  });

  it('submits null for a cleared contact', () => {
    expect(normalizeOrderAuthorUser(null)).toBeNull();
    expect(normalizeOrderAuthorUser(undefined)).toBeNull();
  });
});

describe('GeneralConfigurationSection evaluation start', () => {
  const call = {
    uuid: 'call-uuid',
    customer_uuid: 'customer-uuid',
    evaluation_start: 'on_submission',
    order_author: 'applicant',
    has_proposals: true,
  } as any;

  it('shows when evaluation starts', () => {
    renderWithProviders(
      <GeneralConfigurationSection
        call={{ ...call, evaluation_start: 'at_cutoff' }}
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByText('Evaluation starts')).toBeInTheDocument();
    expect(screen.getByText('At the round cut-off')).toBeInTheDocument();
  });

  it('saves the chosen evaluation start on the call', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsPartialUpdate).mockResolvedValue({
      data: {},
    } as any);
    renderWithProviders(
      <GeneralConfigurationSection call={call} refetch={refetch} />,
    );

    await user.click(screen.getByTestId('edit-evaluation_start'));
    const { openDialog } = useModal();
    const [, dialogProps] = vi.mocked(openDialog).mock.lastCall as any;
    renderWithProviders(<EditFieldDialog {...dialogProps} />);

    await openAndSelectOption(
      user,
      /^Evaluation starts/,
      'At the round cut-off',
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { evaluation_start: 'at_cutoff' },
      });
      expect(refetch).toHaveBeenCalled();
    });
  });
});
