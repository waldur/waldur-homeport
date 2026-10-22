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

const WARNING = 'The key will not be able to call any model.';

// A key limited to a model the offering no longer lists: the form shows no
// model ticked.
const renderDialog = (
  key: Record<string, unknown> = {},
  {
    resourceLimits = {},
    components = [TOKENS],
    models = ['gpt-4o'],
  }: {
    components?: KeyComponent[];
    resourceLimits?: Record<string, Record<string, number>>;
    models?: string[] | null;
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
          models,
          refetch: vi.fn(),
        }}
      />
    </Provider>,
  );

const sentBody = () =>
  vi.mocked(marketplaceResourceApiKeysPartialUpdate).mock.calls[0][0].body;

describe('EditApiKeySettingsDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  // Its models are all retired, so it can call nothing: saved with the ticks
  // left alone it keeps its list as chosen, and is never opened to every model.
  it('never widens a key limited to retired models when only its limit changes', async () => {
    const user = userEvent.setup();
    renderDialog();
    const limitInput = await screen.findByRole('spinbutton');
    expect(screen.getByLabelText('All models')).not.toBeChecked();
    expect(screen.getByLabelText('gpt-4o')).not.toBeChecked();
    expect(screen.getByText(WARNING)).toBeInTheDocument();
    await user.clear(limitInput);
    await user.type(limitInput, '20');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { tokens: { month: 20 } },
      allowed_models: ['retired'],
    });
  });

  it('leaves a key with no models once the user unticks every model', async () => {
    const user = userEvent.setup();
    renderDialog({ allowed_models: ['gpt-4o'] });
    const model = await screen.findByLabelText('gpt-4o');
    expect(model).toBeChecked();
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
    await user.click(model);
    expect(screen.getByText(WARNING)).toBeInTheDocument();
    // The warning does not block saving.
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { tokens: { month: 10 } },
      allowed_models: [],
    });
  });

  // The resource no longer allows one of the key's models: it is not shown,
  // and an edit leaves it on the key.
  it('keeps the models it does not show', async () => {
    const user = userEvent.setup();
    renderDialog({ allowed_models: ['gpt-4o', 'hidden'] });
    await user.click(await screen.findByLabelText('gpt-4o'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody().allowed_models).toEqual(['hidden']);
  });

  it('opens with All models ticked only for a key that may call every model', async () => {
    renderDialog({ allowed_models: ['*'] });
    expect(await screen.findByLabelText('All models')).toBeChecked();
    expect(screen.getByLabelText('gpt-4o')).toBeDisabled();
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
  });

  it('shows the stored selection of a key limited to some models', async () => {
    renderDialog({ allowed_models: ['gpt-4o', 'retired'] });
    expect(await screen.findByLabelText('gpt-4o')).toBeChecked();
    expect(screen.getByLabelText('All models')).not.toBeChecked();
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
  });

  it('sends every model once All models is ticked', async () => {
    const user = userEvent.setup();
    renderDialog({ allowed_models: ['gpt-4o'] });
    await user.click(await screen.findByLabelText('All models'));
    expect(screen.getByLabelText('gpt-4o')).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { tokens: { month: 10 } },
      allowed_models: ['*'],
    });
  });

  it('lets the individual ticks decide again once All models is unticked', async () => {
    const user = userEvent.setup();
    renderDialog({ allowed_models: ['*'] });
    await user.click(await screen.findByLabelText('All models'));
    expect(screen.getByText(WARNING)).toBeInTheDocument();
    await user.click(screen.getByLabelText('gpt-4o'));
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { tokens: { month: 10 } },
      allowed_models: ['gpt-4o'],
    });
  });

  // Nothing to choose from, so the key's models are not the dialog's to change.
  it('shows no Models field and leaves the models alone when the offering lists none', async () => {
    const user = userEvent.setup();
    renderDialog({ allowed_models: ['*'] }, { models: null });
    const limitInput = await screen.findByRole('spinbutton');
    expect(screen.queryByText('Models')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('All models')).not.toBeInTheDocument();
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
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

  // The assignee is chosen when the key is requested; an edit that names
  // one is refused.
  it('neither shows nor sends the assignee', async () => {
    const user = userEvent.setup();
    renderDialog({ user_uuid: 'u1', user_full_name: 'Alice' });
    const limitInput = await screen.findByRole('spinbutton');
    expect(screen.queryByText('Assignee')).not.toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    await user.clear(limitInput);
    await user.type(limitInput, '20');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { tokens: { month: 20 } },
      allowed_models: ['retired'],
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

  // The resource limit was lowered below the key's after it was set.
  it('saves a key above a lowered resource limit without touching the limit', async () => {
    const user = userEvent.setup();
    renderDialog(
      { spending_limits: { tokens: { month: 800 } } },
      { resourceLimits: { tokens: { month: 500 } } },
    );
    expect(await screen.findByRole('spinbutton')).toBeValid();
    await user.click(screen.getByLabelText('gpt-4o'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { tokens: { month: 800 } },
      allowed_models: ['gpt-4o', 'retired'],
    });
  });

  // Key limits took any number before they had periods.
  it('saves a key whose limit has more decimals', async () => {
    const user = userEvent.setup();
    renderDialog({ spending_limits: { tokens: { month: 0.125 } } });
    expect(await screen.findByRole('spinbutton')).toBeValid();
    expect(
      screen.queryByText('Use at most 2 decimal places.'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('gpt-4o'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
    );
    expect(sentBody()).toEqual({
      spending_limits: { tokens: { month: 0.125 } },
      allowed_models: ['gpt-4o', 'retired'],
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
      allowed_models: ['retired'],
    });
  });
});
