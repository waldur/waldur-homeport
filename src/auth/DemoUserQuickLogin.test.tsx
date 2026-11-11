import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demoPresetStatusRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';

import { redirectOnSuccess } from './authNavigation';
import * as AuthService from './AuthService';
import { DemoUserQuickLogin } from './DemoUserQuickLogin';

vi.mock('./authNavigation', () => ({ redirectOnSuccess: vi.fn() }));
vi.mock('./AuthService', () => ({ signin: vi.fn() }));

const USERS = [
  { username: 'alice', password: 'demo', email: 'alice@example.com' },
  { username: 'bob', password: 'demo' },
  // The endpoint never lists these; the component drops them all the same.
  { username: 'root', password: 'demo', is_staff: true },
  { username: 'helpdesk', password: 'demo', is_support: true },
];

describe('DemoUserQuickLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(demoPresetStatusRetrieve).mockResolvedValue({
      data: { loading: false, load: null, users: USERS },
    } as any);
  });

  afterEach(() => {
    delete ENV.plugins.WALDUR_CORE.DEMO_PRESETS_ENABLED;
  });

  it('shows nothing unless the deployment enables demo presets', () => {
    renderWithProviders(<DemoUserQuickLogin />);
    expect(screen.queryByTestId('demo-quick-login')).toBeNull();
    expect(demoPresetStatusRetrieve).not.toHaveBeenCalled();
  });

  it('lists only users without a staff or support role', async () => {
    ENV.plugins.WALDUR_CORE.DEMO_PRESETS_ENABLED = true;
    renderWithProviders(<DemoUserQuickLogin />);

    expect(await screen.findByTestId('demo-quick-login-alice')).toBeVisible();
    expect(screen.getByTestId('demo-quick-login-bob')).toBeVisible();
    expect(screen.queryByTestId('demo-quick-login-root')).toBeNull();
    expect(screen.queryByTestId('demo-quick-login-helpdesk')).toBeNull();
  });

  it('shows nothing when no preset users are known', async () => {
    ENV.plugins.WALDUR_CORE.DEMO_PRESETS_ENABLED = true;
    vi.mocked(demoPresetStatusRetrieve).mockResolvedValue({
      data: { loading: false, load: null, users: [] },
    } as any);
    renderWithProviders(<DemoUserQuickLogin />);

    await waitFor(() => expect(demoPresetStatusRetrieve).toHaveBeenCalled());
    expect(screen.queryByTestId('demo-quick-login')).toBeNull();
  });

  it('signs in as the chosen user', async () => {
    ENV.plugins.WALDUR_CORE.DEMO_PRESETS_ENABLED = true;
    vi.mocked(AuthService.signin).mockResolvedValue({
      status: 'authenticated',
    });
    renderWithProviders(<DemoUserQuickLogin />);

    await userEvent.click(await screen.findByTestId('demo-quick-login-alice'));

    expect(AuthService.signin).toHaveBeenCalledWith('alice', 'demo');
    await waitFor(() => expect(redirectOnSuccess).toHaveBeenCalled());
  });
});
