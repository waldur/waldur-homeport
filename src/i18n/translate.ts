import { setMessageTransform } from 'waldur-i18n-runtime';

import { ENV } from '@/core/config';

import { DOMAIN_MESSAGES } from './domainMessages';

export {
  formatJsx,
  formatJsxTemplate,
  formatTemplate,
  translate,
} from 'waldur-i18n-runtime';

setMessageTransform((message) => {
  const domain = ENV.plugins?.WALDUR_CORE.TRANSLATION_DOMAIN;
  if (!domain || !DOMAIN_MESSAGES[domain]) {
    return message;
  }
  return DOMAIN_MESSAGES[domain][message] || message;
});
