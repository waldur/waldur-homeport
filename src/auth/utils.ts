import { IdentityProvider } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { LanguageUtilsService } from '@waldur/i18n/LanguageUtilsService';

export const getOauthURL = (provider: Pick<IdentityProvider, 'provider'>) => {
  const baseUrl = `${ENV.apiEndpoint}api-auth/${provider.provider}/init/`;
  const langCode = LanguageUtilsService.getCurrentLanguage()?.code;
  if (langCode) {
    return `${baseUrl}?ui_locales=${langCode}`;
  }
  return baseUrl;
};
