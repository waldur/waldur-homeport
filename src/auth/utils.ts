import { IdentityProvider } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LanguageUtilsService } from '@/i18n/LanguageUtilsService';

export const getOauthURL = (provider: Pick<IdentityProvider, 'provider'>) => {
  const baseUrl = `${ENV.apiEndpoint}api-auth/${provider.provider}/init/`;
  const params = new URLSearchParams();

  // Backend matches this against the provider's allowed_redirects on origin only.
  const returnUrl = window.location.origin;
  params.append('return_url', returnUrl);

  // Add language preference if available
  const langCode = LanguageUtilsService.getCurrentLanguage()?.code;
  if (langCode) {
    params.append('ui_locales', langCode);
  }

  return `${baseUrl}?${params.toString()}`;
};
