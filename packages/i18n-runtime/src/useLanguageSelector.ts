import { useCallback } from 'react';

import { LanguageUtilsService } from './languageUtils';
import { LanguageOption } from './types';

/**
 * Portable counterpart to waldur-homeport's own
 * src/i18n/useLanguageSelector.tsx, minus two things that are specifically
 * that app's own policy, not this package's: filtering languageChoices
 * against ENV.plugins.WALDUR_CORE.LANGUAGE_CHOICES (a separate,
 * main-app-specific runtime-config flag on top of the choices
 * LanguageUtilsService.init() was already given), and reloading the page
 * after switching. LanguageUtilsService.dictionary is a plain mutable
 * property, not React state, so nothing re-renders already-translated
 * text when a new dictionary finishes loading — the host app decides how
 * to handle that (the main app reloads; see setLanguage's caller here for
 * why a consumer would still want to).
 *
 * currentLanguage/languageChoices read the singleton fresh on every
 * render rather than mirroring it into useState (the original
 * useLanguageSelector.tsx does mirror currentLanguage into useState) —
 * that mirror only reflects LanguageUtilsService.init()/checkLanguage()
 * correctly when the host guarantees they run before this hook's first
 * render, which the main app's own bootstrap does (a loading screen
 * gates all rendering on it) but a host that renders immediately and
 * only resolves runtime config afterward, in a useEffect, cannot: the
 * mirrored value would freeze at whatever it was on first render (likely
 * undefined) and never catch up. Reading live avoids that gap and still
 * catches up on any later re-render, the same way translate() itself
 * does for the dictionary.
 */
export function useLanguageSelector() {
  const currentLanguage = LanguageUtilsService.getCurrentLanguage();
  const languageChoices = LanguageUtilsService.getChoices();

  const setLanguage = useCallback((language: LanguageOption) => {
    LanguageUtilsService.setCurrentLanguage(language);
  }, []);

  return { currentLanguage, languageChoices, setLanguage };
}
