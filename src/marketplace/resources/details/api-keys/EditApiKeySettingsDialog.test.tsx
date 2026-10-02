import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourceApiKeysPartialUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { EditApiKeySettingsDialog } from './EditApiKeySettingsDialog';

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
  }: {
    settingsEditable?: boolean;
    resourceLimits?: Record<string, number>;
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
            limits: { tokens: 10 },
            allowed_models: ['retired'],
            ...key,
          } as any,
          resource: { uuid: 'res-1', limits: resourceLimits } as any,
          components: [TOKENS],
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
    expect(sentBody()).toEqual({ limits: { tokens: 20 } });
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
    expect(sentBody()).toEqual({ limits: { tokens: 10 }, allowed_models: [] });
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
    expect(sentBody()).toEqual({ limits: { tokens: 20 } });
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
    expect(sentBody()).toEqual({ user: null, limits: { tokens: 10 } });
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
      { limits: { tokens: 800 }, user_uuid: 'u1', user_full_name: 'Alice' },
      { resourceLimits: { tokens: 500 } },
    );
    await screen.findByText('Alice');
    expect(screen.getByRole('spinbutton')).toBeValid();
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Backspace}');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({ user: null, limits: { tokens: 800 } });
  });
});
