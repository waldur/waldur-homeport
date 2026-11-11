import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demoPresetStatusRetrieve } from 'waldur-js-client';

import { setViewport } from 'waldur-ui';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';

import { HeroColumn } from './HeroColumn';
import { LoginColumn } from './LoginColumn';

vi.mock('@/administration/api', () => ({
  getIdentityProviders: vi.fn().mockResolvedValue([]),
}));
// What the columns show besides the sign-in methods and the demo users is
// beside the point here, and needs the API client, drawers and auth core.
vi.mock('./heroImage', () => ({ getHeroBackgroundImage: () => 'none' }));
vi.mock('./AuthHeader', () => ({ AuthHeader: () => null }));
vi.mock('./AuthHeaderControls', () => ({ AuthHeaderControls: () => null }));
vi.mock('./LoginLogo', () => ({ LoginLogo: () => null }));
vi.mock('./PoweredBy', () => ({ PoweredBy: () => null }));
vi.mock('./UserAuthWarning', () => ({ UserAuthWarning: () => null }));
vi.mock('@/i18n/LanguageSelectorBox', () => ({
  LanguageSelectorBox: () => null,
}));
vi.mock('@/navigation/footer/FooterLinks', () => ({ FooterLinks: () => null }));

// The split-screen layouts put the demo users in the hero column beside the
// sign-in column, and under the sign-in methods only where the hero column
// stacks below the fold.
describe('demo users placement', () => {
  let methods: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    methods = ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS;
    ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS = ['LOCAL_SIGNIN'];
    ENV.plugins.WALDUR_CORE.DEMO_PRESETS_ENABLED = true;
    vi.mocked(demoPresetStatusRetrieve).mockResolvedValue({
      data: {
        loading: false,
        load: null,
        users: [{ username: 'alice', password: 'demo' }],
      },
    } as any);
  });

  afterEach(() => {
    ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS = methods;
    delete ENV.plugins.WALDUR_CORE.DEMO_PRESETS_ENABLED;
  });

  it('shows them in the hero column on a wide screen', async () => {
    renderWithProviders(<HeroColumn />);
    expect(await screen.findByTestId('demo-quick-login-alice')).toBeVisible();
  });

  it('keeps them out of the sign-in column on a wide screen', async () => {
    renderWithProviders(<LoginColumn />);
    await screen.findByText('Sign in with local account', { exact: false });
    // Mounted, the list would have asked for the preset's users by now.
    expect(demoPresetStatusRetrieve).not.toHaveBeenCalled();
    expect(screen.queryByTestId('demo-quick-login')).toBeNull();
  });

  it('lists them under the sign-in methods on a narrow screen', async () => {
    setViewport('mobile');
    renderWithProviders(<LoginColumn />);
    expect(await screen.findByTestId('demo-quick-login-alice')).toBeVisible();
  });

  it('leaves the hero column without them on a narrow screen', async () => {
    setViewport('mobile');
    renderWithProviders(<HeroColumn />);
    await waitFor(() =>
      expect(demoPresetStatusRetrieve).not.toHaveBeenCalled(),
    );
    expect(screen.queryByTestId('demo-quick-login')).toBeNull();
  });
});
