import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourceApiKeysCreate } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { RequestApiKeyDialog } from './RequestApiKeyDialog';

// Runs the real mutationFn, so the POST body the form produces is observable
// on the (globally auto-mocked) SDK call.
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: ({ mutationFn }: any) => ({ mutateAsync: mutationFn }),
}));

// useNotify is mocked globally; its actions are one shared object.
const { showErrorResponse } = useNotify();

// A refusal as the SDK's error interceptor (attachResponseDetails in
// waldur-auth-core) throws it: the body spread and kept whole under `data`,
// beside the fetch Response and its status. No axios-style `response.data`.
const refusal = (status: number, body: object) => {
  const response = new Response(JSON.stringify(body), { status });
  return { ...body, data: body, response, status, url: response.url };
};

const WARNING = 'The key will not be able to call any model.';

const renderDialog = (models: string[] | null = ['gpt-4o', 'llama-3']) =>
  renderWithProviders(
    <Provider store={configureStore()({})}>
      <RequestApiKeyDialog
        resolve={{
          resource: { uuid: 'res-1', project_uuid: 'proj-1' } as any,
          components: [],
          models,
          refetch: vi.fn(),
        }}
      />
    </Provider>,
  );

const submit = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(marketplaceResourceApiKeysCreate).toHaveBeenCalled(),
  );
  return vi.mocked(marketplaceResourceApiKeysCreate).mock.calls[0][0].body;
};

describe('RequestApiKeyDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens on All models with the individual ticks locked', async () => {
    renderDialog();
    expect(await screen.findByLabelText('All models')).toBeChecked();
    expect(screen.getByLabelText('gpt-4o')).toBeDisabled();
    expect(screen.getByLabelText('llama-3')).toBeDisabled();
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
  });

  it('opens on a project key and requests it unassigned', async () => {
    // Assign
    const user = userEvent.setup();
    renderDialog();

    // Act
    const shown = await screen.findByText(
      'Project key (shared by the project)',
    );
    const body = await submit(user);

    // Assert
    expect(shown).toBeInTheDocument();
    expect(body.user).toBeNull();
  });

  it('shows a refused assignee under the field, not as a toast', async () => {
    // Assign
    const user = userEvent.setup();
    const HELD =
      'Ada already holds an API key on this resource (KEY1). A person holds at most one key per resource: delete that key first.';
    vi.mocked(marketplaceResourceApiKeysCreate).mockRejectedValueOnce(
      refusal(400, { user: [HELD] }),
    );
    renderDialog();
    await screen.findByText('Project key (shared by the project)');

    // Act
    await submit(user);

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(HELD);
    expect(showErrorResponse).not.toHaveBeenCalled();
  });

  it('lets a refused request be sent again once the form is changed', async () => {
    // Assign
    const user = userEvent.setup();
    vi.mocked(marketplaceResourceApiKeysCreate).mockRejectedValueOnce(
      refusal(400, { user: ['Ada already holds an API key.'] }),
    );
    renderDialog();
    await screen.findByText('Project key (shared by the project)');
    await submit(user);
    await screen.findByRole('alert');
    const button = screen.getByRole('button', { name: 'Submit' });
    const heldBack = button.hasAttribute('disabled');

    // Act
    await user.type(screen.getByLabelText('Description'), 'CI');

    // Assert
    expect(heldBack).toBe(true);
    expect(button).toBeEnabled();
  });

  it('shows any other refusal as a toast', async () => {
    // Assign
    const user = userEvent.setup();
    const error = refusal(400, { resource: ['Resource is not live.'] });
    vi.mocked(marketplaceResourceApiKeysCreate).mockRejectedValueOnce(error);
    renderDialog();
    await screen.findByText('Project key (shared by the project)');

    // Act
    await submit(user);

    // Assert
    await waitFor(() =>
      expect(showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to request the API key.',
      ),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('requests every model when left alone', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findByLabelText('All models');
    expect(await submit(user)).toEqual({
      resource: 'res-1',
      user: null,
      allowed_models: ['*'],
    });
  });

  it('sends the description given', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(await screen.findByLabelText('Description'), 'Production');
    expect((await submit(user)).description).toBe('Production');
  });

  it('requests a key with no models once All models is unticked and nothing else is', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(await screen.findByLabelText('All models'));
    expect(screen.getByText(WARNING)).toBeInTheDocument();
    expect((await submit(user)).allowed_models).toEqual([]);
  });

  it('requests the ticked models', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(await screen.findByLabelText('All models'));
    await user.click(screen.getByLabelText('llama-3'));
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
    expect((await submit(user)).allowed_models).toEqual(['llama-3']);
  });

  it('requests every model and locks the individual ticks once All models is ticked', async () => {
    const user = userEvent.setup();
    renderDialog();
    const allModels = await screen.findByLabelText('All models');
    await user.click(allModels);
    await user.click(screen.getByLabelText('gpt-4o'));
    await user.click(allModels);
    expect(screen.getByLabelText('gpt-4o')).toBeDisabled();
    expect(screen.getByLabelText('llama-3')).toBeDisabled();
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
    expect((await submit(user)).allowed_models).toEqual(['*']);
  });

  it('lets the individual ticks decide again once All models is unticked', async () => {
    const user = userEvent.setup();
    renderDialog();
    const allModels = await screen.findByLabelText('All models');
    await user.click(allModels);
    await user.click(screen.getByLabelText('gpt-4o'));
    await user.click(allModels);
    await user.click(allModels);
    expect(screen.getByLabelText('gpt-4o')).toBeEnabled();
    expect((await submit(user)).allowed_models).toEqual(['gpt-4o']);
  });

  // The offering lists models but the resource allows none of them: All
  // models is still the key's to choose, and leaves it none.
  it('warns even on All models when the resource allows no model', async () => {
    const user = userEvent.setup();
    renderDialog([]);
    expect(await screen.findByLabelText('All models')).toBeChecked();
    expect(screen.getByText(WARNING)).toBeInTheDocument();
    expect((await submit(user)).allowed_models).toEqual(['*']);
  });

  // Nothing to choose from, so nothing may be withheld either.
  it('requests every model when the offering lists none', async () => {
    const user = userEvent.setup();
    renderDialog(null);
    await screen.findByRole('button', { name: 'Submit' });
    expect(screen.queryByText('Models')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('All models')).not.toBeInTheDocument();
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
    expect((await submit(user)).allowed_models).toEqual(['*']);
  });
});
