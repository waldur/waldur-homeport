import { MOCK_ICON_URLS } from '@/test/mockIcons';

// Storybook's replacement for @/core/api (registered in .storybook/preview.tsx):
// the real module, except that getIconUrl() resolves to bundled fixtures instead
// of backend URLs that don't exist in Storybook. Imports here must use the @/
// alias: Storybook resolves relative imports in a __mocks__ file from the
// original module's location.
export * from 'waldur-api-client';
export type { ProgressCallback } from 'waldur-api-client';
export { getHeaders, initApiClient, get, post } from 'waldur-auth-core';

export const getIconUrl = (name: string, language?: string) =>
  (language && MOCK_ICON_URLS[`${name}_${language}`]) ||
  MOCK_ICON_URLS[name] ||
  `http://localhost:8080/api/icons/${name}/`;
