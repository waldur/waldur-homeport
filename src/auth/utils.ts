import { IdentityProvider } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { LanguageUtilsService } from '@waldur/i18n/LanguageUtilsService';

export const getOauthURL = (provider: Pick<IdentityProvider, 'provider'>) => {
  const baseUrl = `${ENV.apiEndpoint}api-auth/${provider.provider}/init/`;
  const params = new URLSearchParams();

  // Add redirect_uri parameter (origin-only, no paths/query/fragments, HTTPS unless localhost)
  const redirectUri = window.location.origin;
  params.append('redirect_uri', redirectUri);

  // Add language preference if available
  const langCode = LanguageUtilsService.getCurrentLanguage()?.code;
  if (langCode) {
    params.append('ui_locales', langCode);
  }

  return `${baseUrl}?${params.toString()}`;
};
