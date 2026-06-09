import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminMatrixAppserviceSetup,
  adminMatrixAppserviceStatusRetrieve,
  overrideSettingsRetrieve,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';

import { MatrixAppserviceSetupDialog } from './MatrixAppserviceSetup';

const h = vi.hoisted(() => ({
  statusData: {} as Record<string, unknown>,
  settingsData: {} as Record<string, unknown>,
  setupMutation: vi.fn(),
}));

const renderDialog = (queryClient?: QueryClient) => {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  const store = createStore(() => ({}));
  return render(
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MatrixAppserviceSetupDialog />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('MatrixAppserviceSetupDialog', () => {
  beforeEach(() => {
    h.statusData = {
      as_token_configured: false,
      hs_token_configured: false,
    };
    h.settingsData = {};
    h.setupMutation.mockReset();
    vi.mocked(useNotify().showErrorResponse).mockClear();

    vi.mocked(adminMatrixAppserviceStatusRetrieve).mockImplementation(() =>
      Promise.resolve({ data: h.statusData } as any),
    );
    vi.mocked(overrideSettingsRetrieve).mockImplementation(() =>
      Promise.resolve({ data: h.settingsData } as any),
    );
    vi.mocked(adminMatrixAppserviceSetup).mockImplementation((args: any) => {
      h.setupMutation(args);
      return Promise.resolve({
        data: { registration_yaml: 'fake-yaml', webhook_url: '' },
      } as any);
    });
  });

  it('lands directly on the appservice step when all three prereqs are configured', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: 'https://matrix.example.com',
      MATRIX_HOMESERVER_DOMAIN: 'matrix.example.com',
      MATRIX_USER_REGISTRATION_SECRET: 'pre-set',
    };

    renderDialog();

    expect(await screen.findByLabelText(/Waldur URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bot localpart/i)).toBeInTheDocument();
    // Prereq fields aren't rendered at all when not needed.
    expect(
      screen.queryByLabelText(/^Homeserver URL$/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Homeserver domain/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Registration secret/i),
    ).not.toBeInTheDocument();
    // No Back button on the entry step when there were no prereqs.
    expect(screen.queryByRole('button', { name: /^Back$/i })).toBeNull();
    // Footer shows "Setup" on the main step.
    expect(
      screen.getByRole('button', { name: /^Setup$/i }),
    ).toBeInTheDocument();
  });

  it('starts on the homeserver step when all three prereqs are missing', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: '',
      MATRIX_HOMESERVER_DOMAIN: '',
      MATRIX_USER_REGISTRATION_SECRET: '',
    };

    renderDialog();

    expect(
      await screen.findByLabelText(/^Homeserver URL$/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Homeserver domain/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Registration secret/i)).toBeInTheDocument();
    // The appservice fields are NOT on the same screen — they're on step 2.
    expect(screen.queryByLabelText(/Waldur URL/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Bot localpart/i)).not.toBeInTheDocument();
    // Footer shows "Next" on the prereqs step.
    expect(screen.getByRole('button', { name: /^Next$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Setup$/i })).toBeNull();
  });

  it('renders only the missing prereq fields when one is already set', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: 'https://matrix.example.com',
      MATRIX_HOMESERVER_DOMAIN: '',
      MATRIX_USER_REGISTRATION_SECRET: '',
    };

    renderDialog();

    expect(
      await screen.findByLabelText(/Homeserver domain/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Registration secret/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/^Homeserver URL$/i),
    ).not.toBeInTheDocument();
  });

  it('advances from prereqs to the appservice step without an API call', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: '',
      MATRIX_HOMESERVER_DOMAIN: '',
      MATRIX_USER_REGISTRATION_SECRET: '',
    };

    const user = userEvent.setup();
    renderDialog();

    await user.type(
      await screen.findByLabelText(/^Homeserver URL$/i),
      'https://matrix.example.com',
    );
    await user.type(
      screen.getByLabelText(/Homeserver domain/i),
      'matrix.example.com',
    );
    await user.type(screen.getByLabelText(/Registration secret/i), 'secret');

    await user.click(screen.getByRole('button', { name: /^Next$/i }));

    // Should now be on step 2 — appservice fields visible, prereqs gone.
    expect(await screen.findByLabelText(/Waldur URL/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/^Homeserver URL$/i),
    ).not.toBeInTheDocument();
    // Back button shows because we came from prereqs.
    expect(screen.getByRole('button', { name: /^Back$/i })).toBeInTheDocument();
    // No API call was made.
    expect(h.setupMutation).not.toHaveBeenCalled();
  });

  it('Back button returns to the prereqs step preserving entered values', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: '',
      MATRIX_HOMESERVER_DOMAIN: '',
      MATRIX_USER_REGISTRATION_SECRET: '',
    };

    const user = userEvent.setup();
    renderDialog();

    const urlField = await screen.findByLabelText(/^Homeserver URL$/i);
    await user.type(urlField, 'https://matrix.example.com');
    await user.type(
      screen.getByLabelText(/Homeserver domain/i),
      'matrix.example.com',
    );
    await user.type(screen.getByLabelText(/Registration secret/i), 'secret');
    await user.click(screen.getByRole('button', { name: /^Next$/i }));

    // Now on step 2; click Back
    await user.click(await screen.findByRole('button', { name: /^Back$/i }));

    const restoredUrl = await screen.findByLabelText(/^Homeserver URL$/i);
    expect((restoredUrl as HTMLInputElement).value).toBe(
      'https://matrix.example.com',
    );
    expect(
      (screen.getByLabelText(/Homeserver domain/i) as HTMLInputElement).value,
    ).toBe('matrix.example.com');
  });

  it('submits a single payload carrying prereq values from step 1 plus step 2', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: '',
      MATRIX_HOMESERVER_DOMAIN: '',
      MATRIX_USER_REGISTRATION_SECRET: '',
    };

    const user = userEvent.setup();
    renderDialog();

    // Step 1
    await user.type(
      await screen.findByLabelText(/^Homeserver URL$/i),
      'https://matrix.example.com',
    );
    await user.type(
      screen.getByLabelText(/Homeserver domain/i),
      'matrix.example.com',
    );
    await user.type(
      screen.getByLabelText(/Registration secret/i),
      'secret-xyz',
    );
    await user.click(screen.getByRole('button', { name: /^Next$/i }));

    // Step 2
    await user.type(
      await screen.findByLabelText(/Bot localpart/i),
      'custom-bot',
    );
    await user.click(screen.getByRole('button', { name: /^Setup$/i }));

    await vi.waitFor(() => expect(h.setupMutation).toHaveBeenCalled());
    const body = h.setupMutation.mock.calls[0][0].body;
    expect(body.homeserver_url).toBe('https://matrix.example.com');
    expect(body.homeserver_domain).toBe('matrix.example.com');
    expect(body.user_registration_secret).toBe('secret-xyz');
    expect(body.sender_localpart).toBe('custom-bot');
  });

  it('omits prereq keys from the payload when they were already configured', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: 'https://matrix.example.com',
      MATRIX_HOMESERVER_DOMAIN: 'matrix.example.com',
      MATRIX_USER_REGISTRATION_SECRET: 'pre-set',
    };

    const user = userEvent.setup();
    renderDialog();

    await user.click(await screen.findByRole('button', { name: /^Setup$/i }));

    await vi.waitFor(() => expect(h.setupMutation).toHaveBeenCalled());
    const body = h.setupMutation.mock.calls[0][0].body;
    expect(body.homeserver_url).toBeUndefined();
    expect(body.homeserver_domain).toBeUndefined();
    expect(body.user_registration_secret).toBeUndefined();
  });

  it('omits sender_localpart from the payload when the user leaves it blank', async () => {
    // Regression: previously we sent sender_localpart: "" which the backend
    // CharField rejects with "This field may not be blank." Omitting the
    // key entirely lets the backend fall back to its Constance default.
    h.settingsData = {
      MATRIX_HOMESERVER_URL: 'https://matrix.example.com',
      MATRIX_HOMESERVER_DOMAIN: 'matrix.example.com',
      MATRIX_USER_REGISTRATION_SECRET: 'pre-set',
    };

    const user = userEvent.setup();
    renderDialog();

    await user.click(await screen.findByRole('button', { name: /^Setup$/i }));

    await vi.waitFor(() => expect(h.setupMutation).toHaveBeenCalled());
    const body = h.setupMutation.mock.calls[0][0].body;
    expect(body.sender_localpart).toBeUndefined();
  });

  it('shows the public homeserver URL on the homeserver step, never on the appservice step', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: '',
      MATRIX_HOMESERVER_DOMAIN: '',
      MATRIX_USER_REGISTRATION_SECRET: '',
    };

    const user = userEvent.setup();
    renderDialog();

    // Grouped with the other homeserver settings on the prereqs step.
    expect(
      await screen.findByLabelText(/Public homeserver URL/i),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/^Homeserver URL$/i),
      'http://matrix-homeserver:6167',
    );
    await user.type(
      screen.getByLabelText(/Homeserver domain/i),
      'matrix.waldur.local',
    );
    await user.type(screen.getByLabelText(/Registration secret/i), 'secret');
    await user.click(screen.getByRole('button', { name: /^Next$/i }));

    // The appservice/YAML step doesn't use it, so it isn't shown here.
    expect(await screen.findByLabelText(/Waldur URL/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Public homeserver URL/i),
    ).not.toBeInTheDocument();
  });

  it('omits the public homeserver URL when the homeserver step is skipped', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: 'https://matrix.example.com',
      MATRIX_HOMESERVER_DOMAIN: 'matrix.example.com',
      MATRIX_USER_REGISTRATION_SECRET: 'pre-set',
    };

    renderDialog();

    // Lands straight on the appservice step — the public URL is a homeserver
    // setting, managed via Matrix admin settings, not part of the YAML flow.
    expect(await screen.findByLabelText(/Waldur URL/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Public homeserver URL/i),
    ).not.toBeInTheDocument();
  });

  it('carries the public homeserver URL entered on the prereqs step into the payload', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: '',
      MATRIX_HOMESERVER_DOMAIN: '',
      MATRIX_USER_REGISTRATION_SECRET: '',
    };

    const user = userEvent.setup();
    renderDialog();

    await user.type(
      await screen.findByLabelText(/^Homeserver URL$/i),
      'http://matrix-homeserver:6167',
    );
    await user.type(
      screen.getByLabelText(/Public homeserver URL/i),
      'https://matrix.waldur.local',
    );
    await user.type(
      screen.getByLabelText(/Homeserver domain/i),
      'matrix.waldur.local',
    );
    await user.type(screen.getByLabelText(/Registration secret/i), 'secret');
    await user.click(screen.getByRole('button', { name: /^Next$/i }));

    await user.click(await screen.findByRole('button', { name: /^Setup$/i }));

    await vi.waitFor(() => expect(h.setupMutation).toHaveBeenCalled());
    const body = h.setupMutation.mock.calls[0][0].body;
    expect(body.homeserver_public_url).toBe('https://matrix.waldur.local');
  });

  it('invalidates matrixAppserviceStatus and MatrixAdminSettings caches on success', async () => {
    h.settingsData = {
      MATRIX_HOMESERVER_URL: 'https://matrix.example.com',
      MATRIX_HOMESERVER_DOMAIN: 'matrix.example.com',
      MATRIX_USER_REGISTRATION_SECRET: 'pre-set',
    };

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const user = userEvent.setup();
    renderDialog(queryClient);

    await user.click(await screen.findByRole('button', { name: /^Setup$/i }));

    await vi.waitFor(() => expect(h.setupMutation).toHaveBeenCalled());
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['matrixAppserviceStatus'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['MatrixAdminSettings'],
    });
  });
});
