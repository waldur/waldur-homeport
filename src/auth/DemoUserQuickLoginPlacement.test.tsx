import { screen, within } from '@testing-library/react';
import { FC } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demoPresetStatusRetrieve } from 'waldur-js-client';

import { setViewport } from 'waldur-ui';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';

import { RightSplitLayout } from './layouts/RightSplitLayout';
import { SplitScreenLayout } from './layouts/SplitScreenLayout';

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

// Which column holds the list, counted once it is shown: a layout that listed
// it in both columns, or in neither, fails.
const columnHoldingDemoUsers = async () => {
  await screen.findByTestId('demo-quick-login-alice');
  const count = (column: string) =>
    within(screen.getByTestId(column)).queryAllByTestId('demo-quick-login')
      .length;
  const inHero = count('hero-column');
  const inSignIn = count('login-column');
  expect(inHero + inSignIn).toBe(1);
  return inHero ? 'hero' : 'sign-in';
};

describe.each<[string, FC]>([
  ['split-screen', SplitScreenLayout],
  ['right-split', RightSplitLayout],
])('demo users in the %s layout', (_, Layout) => {
  let methods: string[];

  beforeEach(() => {
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

  it('shows them in the hero column beside the sign-in column', async () => {
    renderWithProviders(<Layout />);
    expect(await columnHoldingDemoUsers()).toBe('hero');
  });

  it('keeps them with the sign-in methods when the columns stack', async () => {
    setViewport('mobile');
    renderWithProviders(<Layout />);
    expect(await columnHoldingDemoUsers()).toBe('sign-in');
  });
});
