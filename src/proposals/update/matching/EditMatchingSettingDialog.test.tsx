import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsMatchingConfigurationPartialUpdate,
  proposalProtectedCallsMatchingConfigurationRetrieve,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { EditMatchingSettingDialog } from './EditMatchingSettingDialog';

const CALL_UUID = 'call-uuid-123';

const CONFIG = {
  affinity_method: 'combined',
  keyword_weight: 0.5,
  text_weight: 0.5,
  algorithm: 'minmax',
  min_reviewers_per_proposal: 2,
  max_reviewers_per_proposal: 5,
  max_proposals_per_reviewer: 10,
};

const makeProps = (name: string, title = 'Edit setting') => ({
  resolve: {
    call: { uuid: CALL_UUID },
    name,
    title,
    refetch: vi.fn(),
  },
});

const resolveRetrieve = () =>
  vi
    .mocked(proposalProtectedCallsMatchingConfigurationRetrieve)
    .mockResolvedValue({ data: { ...CONFIG } } as any);

describe('EditMatchingSettingDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveRetrieve();
  });

  it('shows a loading spinner while the matching config query is loading', () => {
    // Never-resolving retrieve keeps the query in the loading state.
    vi.mocked(
      proposalProtectedCallsMatchingConfigurationRetrieve,
    ).mockReturnValue(new Promise(() => {}) as any);

    renderWithProviders(
      <EditMatchingSettingDialog {...makeProps('keyword_weight')} />,
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders a SELECT field for affinity_method with the loaded value', async () => {
    renderWithProviders(
      <EditMatchingSettingDialog
        {...makeProps('affinity_method', 'Edit affinity method')}
      />,
    );

    // The Save button only renders once the config query has resolved
    expect(
      await screen.findByRole('button', { name: /Save/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Edit affinity method')).toBeInTheDocument();
    // react-select renders a combobox, not a spinbutton
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    // Initial value 'combined' resolves to its label
    expect(screen.getByText('Combined (keyword + TF-IDF)')).toBeInTheDocument();
  });

  it('renders a SELECT field for algorithm', async () => {
    renderWithProviders(
      <EditMatchingSettingDialog
        {...makeProps('algorithm', 'Edit algorithm')}
      />,
    );

    expect(
      await screen.findByRole('button', { name: /Save/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Edit algorithm')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('MinMax (balanced load)')).toBeInTheDocument();
  });

  it('renders a NUMBER field for keyword_weight', async () => {
    renderWithProviders(
      <EditMatchingSettingDialog
        {...makeProps('keyword_weight', 'Edit keyword weight')}
      />,
    );

    const input = await screen.findByRole('spinbutton');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(0.5);
    expect(screen.getByText('Edit keyword weight')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders an integer NUMBER field for min_reviewers_per_proposal', async () => {
    renderWithProviders(
      <EditMatchingSettingDialog
        {...makeProps('min_reviewers_per_proposal', 'Edit min reviewers')}
      />,
    );

    const input = await screen.findByRole('spinbutton');
    expect(screen.getByText('Edit min reviewers')).toBeInTheDocument();
    expect(input).toHaveValue(2);
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '20');
  });

  it('submits a partial update, shows success and closes the dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(
      proposalProtectedCallsMatchingConfigurationPartialUpdate,
    ).mockResolvedValue({} as any);

    renderWithProviders(
      <EditMatchingSettingDialog
        {...makeProps('keyword_weight', 'Edit keyword weight')}
      />,
    );

    const input = await screen.findByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '0.8');

    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(
        proposalProtectedCallsMatchingConfigurationPartialUpdate,
      ).toHaveBeenCalledWith({
        path: { uuid: CALL_UUID },
        // The NumberField uses a native <input type="number"> whose value is a
        // string, and the component forwards it verbatim (no numeric coercion).
        body: { keyword_weight: '0.8' },
      });
    });

    expect(vi.mocked(useNotify().showSuccess)).toHaveBeenCalledWith(
      'Matching setting has been updated.',
    );
    expect(vi.mocked(useModal().closeDialog)).toHaveBeenCalled();
  });

  it('surfaces an API 400 error and calls showErrorResponse', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        status: 400,
        data: { keyword_weight: 'Value must be between 0 and 1.' },
      },
    };
    vi.mocked(
      proposalProtectedCallsMatchingConfigurationPartialUpdate,
    ).mockRejectedValue(error as any);

    renderWithProviders(
      <EditMatchingSettingDialog
        {...makeProps('keyword_weight', 'Edit keyword weight')}
      />,
    );

    const input = await screen.findByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '0.8');

    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(
        proposalProtectedCallsMatchingConfigurationPartialUpdate,
      ).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(vi.mocked(useNotify().showErrorResponse)).toHaveBeenCalledWith(
        error,
        'Unable to update matching setting.',
      );
    });
    // Dialog stays open: closeDialog not called on error
    expect(vi.mocked(useModal().closeDialog)).not.toHaveBeenCalled();
  });
});
