import { useState, useMemo, useCallback } from 'react';

import { LanguageOption } from '@waldur/core/types';

import { LanguageUtilsService } from './LanguageUtilsService';

export const useLanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(
    LanguageUtilsService.getCurrentLanguage(),
  );

  const languageChoices = useMemo<LanguageOption[]>(
    () =>
      LanguageUtilsService.getChoices().sort((a, b) =>
        a.code.localeCompare(b.code),
      ),
    [],
  );

  const setLanguage = useCallback((language: LanguageOption) => {
    setCurrentLanguage(language);
    LanguageUtilsService.setCurrentLanguage(language);
    setTimeout(() => {
      location.reload();
    }, 1000);
  }, []);

  return { currentLanguage, languageChoices, setLanguage };
};
