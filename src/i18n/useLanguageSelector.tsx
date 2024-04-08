import { useState, useMemo, useCallback } from 'react';

import { ENV } from '@waldur/configs/default';
import { LanguageOption } from '@waldur/core/types';

import { LanguageUtilsService } from './LanguageUtilsService';

export const useLanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(
    LanguageUtilsService.getCurrentLanguage(),
  );

  const languageChoices = useMemo<LanguageOption[]>(
    () =>
      LanguageUtilsService.getChoices()
        .sort((a, b) => a.code.localeCompare(b.code))
        .filter((language) =>
          ENV.plugins.WALDUR_CORE.LANGUAGE_CHOICES.includes(language.code),
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
