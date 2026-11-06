import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourceApiKeysPartialUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { EditApiKeyDescriptionDialog } from './EditApiKeyDescriptionDialog';

// Runs the real mutationFn, so the PATCH body the form produces is observable
// on the (globally auto-mocked) SDK call.
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: ({ mutationFn }: any) => ({ mutateAsync: mutationFn }),
}));

const renderDialog = (row: any) =>
  renderWithProviders(
    <Provider store={configureStore()({})}>
      <EditApiKeyDescriptionDialog
        resolve={{
          row: { uuid: 'k1', client_id: 'KEY1', ...row },
          refetch: vi.fn(),
        }}
      />
    </Provider>,
  );

const save = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(marketplaceResourceApiKeysPartialUpdate).toHaveBeenCalled(),
  );
  return vi.mocked(marketplaceResourceApiKeysPartialUpdate).mock.calls[0][0];
};

describe('EditApiKeyDescriptionDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens on the key description and keeps Save disabled until it changes', async () => {
    renderDialog({ description: 'Production' });
    expect(await screen.findByLabelText('Description')).toHaveValue(
      'Production',
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('sends the description alone, so the edit issues no command', async () => {
    const user = userEvent.setup();
    renderDialog({
      description: '',
      spending_limits: { tokens: { month: 5 } },
    });
    await user.type(await screen.findByLabelText('Description'), 'Staging');
    expect(await save(user)).toEqual({
      path: { uuid: 'k1' },
      body: { description: 'Staging' },
    });
  });

  it('clears the description with an empty one', async () => {
    const user = userEvent.setup();
    renderDialog({ description: 'Production' });
    await user.clear(await screen.findByLabelText('Description'));
    expect((await save(user)).body).toEqual({ description: '' });
  });
});
