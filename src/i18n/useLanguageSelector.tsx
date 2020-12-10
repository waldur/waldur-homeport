import { useState, useMemo, useCallback } from 'react';

import { ngInjector } from '@waldur/core/services';

interface Language {
  code: string;
  display_code: string;
  label: string;
}

export const useLanguageSelector = () => {
  const service = ngInjector.get('LanguageUtilsService');

  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    service.getCurrentLanguage(),
  );

  const languageChoices = useMemo<Language[]>(
    () => service.getChoices().sort((a, b) => a.code.localeCompare(b.code)),
    [],
  );

  const setLanguage = useCallback((language: Language) => {
    setCurrentLanguage(language);
    service.setCurrentLanguage(language);
    setTimeout(() => {
      location.reload();
    }, 1000);
  }, []);

  return { currentLanguage, languageChoices, setLanguage };
};
