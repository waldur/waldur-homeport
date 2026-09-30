import type { Locale } from 'date-fns';
import { useEffect, useState } from 'react';
import { LanguageUtilsService } from 'waldur-i18n-runtime';

/**
 * date-fns locales for the languages in /locales, loaded on demand so only
 * the active one is bundled into the page. Codes date-fns spells differently
 * are mapped; anything date-fns lacks (Kyrgyz) falls back to English.
 */
const loaders: Record<string, () => Promise<Locale>> = {
  ar: () => import('date-fns/locale/ar').then((m) => m.ar),
  az: () => import('date-fns/locale/az').then((m) => m.az),
  bg: () => import('date-fns/locale/bg').then((m) => m.bg),
  bn: () => import('date-fns/locale/bn').then((m) => m.bn),
  cs: () => import('date-fns/locale/cs').then((m) => m.cs),
  da: () => import('date-fns/locale/da').then((m) => m.da),
  de: () => import('date-fns/locale/de').then((m) => m.de),
  el: () => import('date-fns/locale/el').then((m) => m.el),
  es: () => import('date-fns/locale/es').then((m) => m.es),
  et: () => import('date-fns/locale/et').then((m) => m.et),
  fa: () => import('date-fns/locale/fa-IR').then((m) => m.faIR),
  fi: () => import('date-fns/locale/fi').then((m) => m.fi),
  fr: () => import('date-fns/locale/fr').then((m) => m.fr),
  hr: () => import('date-fns/locale/hr').then((m) => m.hr),
  it: () => import('date-fns/locale/it').then((m) => m.it),
  km: () => import('date-fns/locale/km').then((m) => m.km),
  lt: () => import('date-fns/locale/lt').then((m) => m.lt),
  lv: () => import('date-fns/locale/lv').then((m) => m.lv),
  mk: () => import('date-fns/locale/mk').then((m) => m.mk),
  nb: () => import('date-fns/locale/nb').then((m) => m.nb),
  nl: () => import('date-fns/locale/nl').then((m) => m.nl),
  'nl-BE': () => import('date-fns/locale/nl-BE').then((m) => m.nlBE),
  pl: () => import('date-fns/locale/pl').then((m) => m.pl),
  ru: () => import('date-fns/locale/ru').then((m) => m.ru),
  sl: () => import('date-fns/locale/sl').then((m) => m.sl),
  sq: () => import('date-fns/locale/sq').then((m) => m.sq),
  sv: () => import('date-fns/locale/sv').then((m) => m.sv),
  th: () => import('date-fns/locale/th').then((m) => m.th),
  uk: () => import('date-fns/locale/uk').then((m) => m.uk),
};

const cache: Record<string, Locale> = {};

/**
 * The date-fns locale for the current UI language — month and weekday names
 * in the calendar. `undefined` (English) until it has loaded, and outside
 * the app shell where no language is set.
 */
export const useCalendarLocale = (): Locale | undefined => {
  const code = LanguageUtilsService.getCurrentLanguage()?.code;
  const [locale, setLocale] = useState<Locale | undefined>(
    code ? cache[code] : undefined,
  );
  useEffect(() => {
    if (!code || !loaders[code]) {
      setLocale(undefined);
      return;
    }
    if (cache[code]) {
      setLocale(cache[code]);
      return;
    }
    let active = true;
    loaders[code]().then((loaded) => {
      cache[code] = loaded;
      if (active) setLocale(loaded);
    });
    return () => {
      active = false;
    };
  }, [code]);
  return locale;
};
