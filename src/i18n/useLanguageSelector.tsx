import * as React from 'react';

import { ngInjector } from '@waldur/core/services';

interface Language {
  code: string;
  label: string;
}

export const useLanguageSelector = () => {
  const service = ngInjector.get('LanguageUtilsService');

  const [currentLanguage, setCurrentLanguage] = React.useState<Language>(
    service.getCurrentLanguage(),
  );

  const languageChoices = React.useMemo<Language[]>(
    () => service.getChoices().sort((a, b) => a.code.localeCompare(b.code)),
    [],
  );

  const setLanguage = React.useCallback((language: Language) => {
    setCurrentLanguage(language);
    service.setCurrentLanguage(language);
  }, []);

  return { currentLanguage, languageChoices, setLanguage };
};
