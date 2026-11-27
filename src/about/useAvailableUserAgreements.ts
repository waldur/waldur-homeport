import { useQuery } from '@tanstack/react-query';
import { userAgreementsList } from 'waldur-js-client';

import { LanguageUtilsService } from '@/i18n/LanguageUtilsService';

// Queries to refresh when staff change an agreement.
export const USER_AGREEMENT_QUERY_KEYS = [
  { queryKey: ['availableUserAgreements'] },
  { queryKey: ['userAgreementData'] },
];

/**
 * Which user agreements (privacy policy, terms of service) have content in
 * the current language or the default fallback, so that links to them are
 * only shown when the page they lead to is not empty.
 *
 * Asking with a language and no agreement_type makes the backend return one
 * agreement per type, the language version or the default, which is what
 * UserAgreementComponent would render.
 */
export const useAvailableUserAgreements = () => {
  const language = LanguageUtilsService.getCurrentLanguage()?.code || '';
  const { data } = useQuery({
    queryKey: ['availableUserAgreements', language],
    queryFn: async () => {
      const response = await userAgreementsList({
        query: language ? { language } : {},
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
  // Until the list has loaded, or if it fails to, keep the links: hiding
  // them is only right once the backend has said there is nothing to show.
  const hasContent = (type: 'PP' | 'TOS') =>
    !data ||
    data.some(
      (agreement) =>
        agreement.agreement_type === type && !!agreement.content?.trim(),
    );
  return {
    hasPrivacyPolicy: hasContent('PP'),
    hasTermsOfService: hasContent('TOS'),
  };
};
