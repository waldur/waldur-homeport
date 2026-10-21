import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourceApiKeysPartialUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { EditApiKeySettingsDialog } from './EditApiKeySettingsDialog';
import { KeyComponent } from './types';

// Runs the real mutationFn, so the PATCH body the form produces is observable
// on the (globally auto-mocked) SDK call.
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: ({ mutationFn }: any) => ({ mutateAsync: mutationFn }),
}));

const TOKENS = { type: 'tokens', name: 'Tokens' };

// A key limited to a model the offering no longer lists: the form shows no
// model ticked.
const renderDialog = (
  key: Record<string, unknown> = {},
  {
    settingsEditable = true,
    resourceLimits = {},
    components = [TOKENS],
  }: {
    components?: KeyComponent[];
    settingsEditable?: boolean;
    resourceLimits?: Record<string, Record<string, number>>;
  } = {},
) =>
  renderWithProviders(
    <Provider store={configureStore()({})}>
      <EditApiKeySettingsDialog
        resolve={{
          row: {
            uuid: 'k1',
            client_id: 'KEY1',
            state: 'OK',
            spending_limits: { tokens: { month: 10 } },
            allowed_models: ['retired'],
            ...key,
          } as any,
          resource: { uuid: 'res-1', spending_limits: resourceLimits } as any,
          components,
          models: ['gpt-4o'],
          refetch: vi.fn(),
          settingsEditable,
        }}
      />
    </Provider>,
  );

const sentBody = () =>
  vi.mocked(marketplaceResourceApiKeysPartialUpdate).mock.calls[0][0].body;

describe('EditApiKeySettingsDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps a key limited to retired models when only its limit changes', async () => {
    const user = userEvent.setup();
    renderDialog();
    const limitInput = await screen.findByRole('spinbutton');
    await user.clear(limitInput);
    await user.type(limitInput, '20');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { tokens: { month: 20 } },
    });
  });

  it('opens the key to every model once the user clears the list', async () => {
    const user = userEvent.setup();
    renderDialog();
    const model = await screen.findByLabelText('gpt-4o');
    await user.click(model);
    await user.click(model);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { tokens: { month: 10 } },
      allowed_models: [],
    });
  });

  it('keeps the assignee when only a limit changes', async () => {
    const user = userEvent.setup();
    renderDialog({ user_uuid: 'u1', user_full_name: 'Alice' });
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    const limitInput = screen.getByRole('spinbutton');
    await user.clear(limitInput);
    await user.type(limitInput, '20');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { tokens: { month: 20 } },
    });
  });

  it('unassigns a key when the assignee is cleared', async () => {
    const user = userEvent.setup();
    renderDialog({ user_uuid: 'u1', user_full_name: 'Alice' });
    await screen.findByText('Alice');
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Backspace}');
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      user: null,
      spending_limits: { tokens: { month: 10 } },
    });
  });

  // Saving an untouched form would issue nothing, not even a retry.
  it('keeps Save disabled until something changes', async () => {
    const user = userEvent.setup();
    renderDialog({ state: 'Erred', pending_action: 'update' });
    const save = () => screen.getByRole('button', { name: 'Save' });
    await screen.findByRole('spinbutton');
    expect(save()).toBeDisabled();
    const limitInput = screen.getByRole('spinbutton');
    await user.clear(limitInput);
    await user.type(limitInput, '20');
    expect(save()).toBeEnabled();
  });

  it('changes only the assignee of a key that is not settled', async () => {
    const user = userEvent.setup();
    renderDialog(
      { state: 'Updating', user_uuid: 'u1', user_full_name: 'Alice' },
      { settingsEditable: false },
    );
    await screen.findByText('Alice');
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(screen.getByLabelText('gpt-4o')).toBeDisabled();
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Backspace}');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({ user: null });
  });

  // The resource limit was lowered below the key's after it was set.
  it('saves an assignee change on a key above a lowered resource limit', async () => {
    const user = userEvent.setup();
    renderDialog(
      {
        spending_limits: { tokens: { month: 800 } },
        user_uuid: 'u1',
        user_full_name: 'Alice',
      },
      { resourceLimits: { tokens: { month: 500 } } },
    );
    await screen.findByText('Alice');
    expect(screen.getByRole('spinbutton')).toBeValid();
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Backspace}');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      user: null,
      spending_limits: { tokens: { month: 800 } },
    });
  });

  // Key limits took any number before they had periods.
  it('saves an assignee change on a key whose limit has more decimals', async () => {
    const user = userEvent.setup();
    renderDialog({
      spending_limits: { tokens: { month: 0.125 } },
      user_uuid: 'u1',
      user_full_name: 'Alice',
    });
    await screen.findByText('Alice');
    expect(
      screen.queryByText('Use at most 2 decimal places.'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Backspace}');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      user: null,
      spending_limits: { tokens: { month: 0.125 } },
    });
  });

  it("offers each period the component offers, capped by the resource's limit", async () => {
    const user = userEvent.setup();
    renderDialog(
      { spending_limits: null },
      {
        components: [
          {
            type: 'token_cost',
            name: 'Token cost',
            billing_type: 'usage',
            spending_limit_periods: { day: {}, month: {} },
          },
        ],
        resourceLimits: { token_cost: { day: 20 } },
      },
    );
    expect(await screen.findByText('Daily limit')).toBeInTheDocument();
    expect(screen.getByText('Monthly limit')).toBeInTheDocument();
    expect(screen.getByText('Up to 20')).toBeInTheDocument();
    expect(screen.getByText('resets 00:00 UTC')).toBeInTheDocument();
    const [day, month] = screen.getAllByRole('spinbutton');
    await user.type(day, '0');
    expect(await screen.findByText('Must be above 0.')).toBeInTheDocument();
    await user.clear(day);
    await user.type(day, '25');
    expect(await screen.findByText('Must not exceed 20.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await user.clear(day);
    await user.type(day, '5');
    await user.type(month, '50');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { token_cost: { day: 5, month: 50 } },
    });
  });
});
