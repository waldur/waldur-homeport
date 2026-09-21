import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UIRouter } from '@uirouter/react';
import React, { ReactNode, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { IdentityProvider } from 'waldur-js-client';

import { configureApiClient } from 'waldur-api-client';

import { AnonymousThreadProvider } from '@/ai-assistant/anonymous/AnonymousThreadProvider';
import { ThreadProvider } from '@/ai-assistant/logic/ThreadProvider';
import { initApiClient } from '@/core/api';
import { setupAuthCore } from '@/core/authCoreSetup';
import { ENV } from '@/core/config';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { ModalProvider } from '@/modal/ModalContext';
import store from '@/store/store';
import { createTestRouter } from '@/test/router';

/**
 * Initializes ENV.plugins and API client with deterministic mock configuration for Storybook.
 * Storybook skips the full bootstrap cycle (afterBootstrap.tsx), so configuration
 * properties accessed by auth components and client request helpers must be guaranteed here.
 */
const mockAuthEnv = () => {
  setupAuthCore();
  initApiClient();
  configureApiClient({
    apiEndpoint: ENV.apiEndpoint || 'http://localhost:8080/',
  });

  if (!ENV.plugins) {
    ENV.plugins = {} as any;
  }
  ENV.plugins.WALDUR_CORE = {
    SITE_NAME: 'Waldur',
    SHORT_PAGE_TITLE: 'Waldur',
    FULL_PAGE_TITLE: 'Waldur | Cloud Management Platform',
    BRAND_COLOR: '#307300',
    SITE_DESCRIPTION: 'Open-source cloud management platform',
    POWERED_BY_LOGO: 'powered_by_logo',
    LOGIN_LOGO: 'login_logo',
    HERO_IMAGE: 'hero_image',
    SIDEBAR_LOGO: 'sidebar_logo',
    SIDEBAR_LOGO_DARK: 'sidebar_logo_dark',
    SIDEBAR_LOGO_MOBILE: 'sidebar_logo_mobile',

    LOGIN_PAGE_STATS: [
      { value: '10K+', label: 'Active Users' },
      { value: '50+', label: 'Organizations' },
      { value: '99.9%', label: 'Uptime' },
      { value: '24/7', label: 'Support' },
    ],
    LOGIN_PAGE_NEWS: [
      {
        date: 'Sep 18, 2026',
        title: 'Waldur v4.8 Released',
        description:
          'New cloud orchestration features, enhanced passkey MFA, and refreshed UI themes.',
        tag: 'Release',
      },
      {
        date: 'Sep 10, 2026',
        title: 'Scheduled Maintenance',
        description:
          'Completed annual cloud storage cluster upgrades with zero downtime.',
        tag: 'Maintenance',
      },
    ],
    LOGIN_PAGE_CAROUSEL_SLIDES: [
      {
        title: 'Manage Cloud Resources',
        subtitle: 'Access and control your infrastructure in one unified place',
      },
      {
        title: 'Team Collaboration',
        subtitle:
          'Work together with your colleagues across organizations seamlessly',
      },
      {
        title: 'Enterprise Security',
        subtitle:
          'Hardware passkeys, SAML2, and single sign-on integration out of the box',
      },
    ],
    AUTHENTICATION_METHODS: [
      'LOCAL_SIGNIN',
      'VALIMO',
      'SAML2',
      'PASSKEY_SIGNIN',
    ],
    HERO_LINK_URL: 'https://waldur.com',
    HERO_LINK_LABEL: 'Learn more about Waldur',
    ...ENV.plugins?.WALDUR_CORE,
  };
  ENV.plugins.WALDUR_AUTH_SAML2 = {
    IDENTITY_PROVIDER_URL: 'https://saml2.example.com',
    IDENTITY_PROVIDER_LABEL: 'SAML2 Provider',
    ALLOW_TO_SELECT_IDENTITY_PROVIDER: true,
    DISCOVERY_SERVICE_URL: 'https://discovery.example.com',
    DISCOVERY_SERVICE_LABEL: 'eduGAIN Discovery',
    ...ENV.plugins?.WALDUR_AUTH_SAML2,
  };
  ENV.plugins.WALDUR_AUTH_VALIMO = {
    LABEL: 'Mobile ID',
    MOBILE_PREFIX: '+372',
    ...ENV.plugins?.WALDUR_AUTH_VALIMO,
  };
};

const MOCK_PROVIDERS: Pick<IdentityProvider, 'provider' | 'label'>[] = [
  { provider: 'keycloak', label: 'Keycloak SSO' },
  { provider: 'tara', label: 'Riigi Autentimisteenus (TARA)' },
  { provider: 'eduteams', label: 'MyAccessID (eduTEAMS)' },
  { provider: 'freeipa', label: 'FreeIPA' },
  { provider: 'saml2', label: 'University Single Sign-On' },
];

const createAuthQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  queryClient.setQueryData(['IdentityProvidersConfigurations'], MOCK_PROVIDERS);
  queryClient.setQueryData(['publicGroupInvitationsCount'], 0);

  return queryClient;
};

export const AuthStoryHarness = ({ children }: { children: ReactNode }) => {
  mockAuthEnv();
  // <UIRouter> starts the router it is given and start() throws when called
  // twice, so every mounted story gets its own, disposed on unmount.
  const [router] = useState(createTestRouter);
  useEffect(() => () => router.dispose(), [router]);
  const [queryClient] = useState(createAuthQueryClient);

  return (
    <Provider store={store}>
      <ModalProvider>
        <DrawerProvider>
          <ThreadProvider>
            <AnonymousThreadProvider>
              <UIRouter router={router}>
                <QueryClientProvider client={queryClient}>
                  {children}
                </QueryClientProvider>
              </UIRouter>
            </AnonymousThreadProvider>
          </ThreadProvider>
        </DrawerProvider>
      </ModalProvider>
    </Provider>
  );
};
