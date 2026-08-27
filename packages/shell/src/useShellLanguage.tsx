import { createContext, ReactNode, useContext } from 'react';
import { LanguageOption, useLanguageSelector } from 'waldur-i18n-runtime';

interface ShellLanguageValue {
  currentLanguage: LanguageOption | undefined;
  languageChoices: LanguageOption[];
  onLanguageChange: (language: LanguageOption) => void;
}

const ShellLanguageContext = createContext<ShellLanguageValue | undefined>(
  undefined,
);

/**
 * Constructed once, inside AppShell, rather than by each app. Wraps
 * waldur-i18n-runtime's useLanguageSelector() (a portable read of the
 * LanguageUtilsService singleton bootstrapMicroApp() already initializes)
 * and adds the page reload every micro-app calling it wants —
 * see that hook's own comment on why reloading is deliberately the host's
 * decision, not baked into the primitive. This is that decision, made once
 * for every AppShell consumer instead of once per app.
 */
export function ShellLanguageProvider({ children }: { children: ReactNode }) {
  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  const onLanguageChange = (language: LanguageOption) => {
    setLanguage(language);
    // LanguageUtilsService.dictionary is a plain mutable property, not
    // React state, so nothing re-renders already-translated text once the
    // new dictionary loads — same reload the main app's own
    // src/i18n/useLanguageSelector.tsx uses.
    window.location.reload();
  };

  return (
    <ShellLanguageContext.Provider
      value={{ currentLanguage, languageChoices, onLanguageChange }}
    >
      {children}
    </ShellLanguageContext.Provider>
  );
}

/** Must be called from inside <AppShell> — its Provider is what constructs the value. */
export function useShellLanguage(): ShellLanguageValue {
  const value = useContext(ShellLanguageContext);
  if (!value) {
    throw new Error('useShellLanguage() must be used inside <AppShell>.');
  }
  return value;
}
